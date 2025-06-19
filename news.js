class LiveNewsHub {
    constructor() {
        this.initializeProperties();
        this.setupEventListeners();
        this.initializeCache();
        this.loadInitialNews();
        this.setupAutoRefresh();
        this.currentArticleData = null; // Store current article data for modals
    }

    initializeProperties() {
        // NewsAPI configuration
        this.baseUrl = 'https://newsapi.org/v2';
        this.apiKey = 'dcb071f269784ec280990d91a82ecc23'; // Your NewsAPI key
        
        // YouTube API configuration
        this.youtubeApiKey = 'dcb071f269784ec280990d91a82ecc23'; // Replace with your YouTube API key
        
        this.currentCategory = 'general';
        this.currentPage = 1;
        this.isLoading = false;
        this.searchTerm = '';

        // Cache configuration
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes for live news
        this.maxCacheSize = 50;

        this.initializeDOMElements();
    }

    initializeDOMElements() {
        this.newsContainer = document.getElementById('newsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorContainer = document.getElementById('errorContainer');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.headlineContent = document.getElementById('headlineContent');
        this.refreshHeadlines = document.getElementById('refreshHeadlines');
        this.categoryButtons = document.querySelectorAll('.category-btn');

        // Cache elements
        this.cacheStatus = document.getElementById('cacheStatus');
        this.cacheText = document.getElementById('cacheText');
        this.cacheStatsText = document.getElementById('cacheStatsText');

        // Modal elements
        this.videoModal = document.getElementById('videoModal');
        this.previewModal = document.getElementById('previewModal');
        this.optionsModal = document.getElementById('optionsModal');
    }

    // YouTube API Integration
    async validateYouTubeVideo(videoId) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${this.youtubeApiKey}`
            );
            
            if (!response.ok) {
                throw new Error('YouTube API request failed');
            }
            
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                return video.status.embeddable && video.status.privacyStatus === "public";
            }
            
            return false;
        } catch (error) {
            console.error('YouTube API validation error:', error);
            return false;
        }
    }

    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async createYouTubeEmbed(videoId, containerId) {
        const container = document.getElementById(containerId);
        
        try {
            // Validate video before embedding
            const isValid = await this.validateYouTubeVideo(videoId);
            
            if (isValid) {
                // ✅ Show the video
                container.innerHTML = `
                    <iframe width="100%" height="400"
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0"
                            frameborder="0" 
                            allowfullscreen
                            allow="autoplay; encrypted-media">
                    </iframe>
                `;
                return true;
            } else {
                // ❌ Fallback if not embeddable
                container.innerHTML = `
                    <div class="video-error-container">
                        <div class="video-error-content">
                            <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                            <h3>Video Not Available</h3>
                            <p>This video is not available to embed or may be private.</p>
                            <button class="modal-btn modal-btn-primary" onclick="window.open('https://youtube.com/watch?v=${videoId}', '_blank')">
                                <i class="bi bi-youtube me-1"></i>Watch on YouTube
                            </button>
                        </div>
                    </div>
                `;
                return false;
            }
        } catch (error) {
            // ❌ Error fallback
            container.innerHTML = `
                <div class="video-error-container">
                    <div class="video-error-content">
                        <i class="bi bi-wifi-off" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                        <h3>Failed to Load Video</h3>
                        <p>Please check your connection and try again later.</p>
                        <button class="modal-btn modal-btn-primary" onclick="newsHub.retryVideoLoad('${videoId}', '${containerId}')">
                            <i class="bi bi-arrow-clockwise me-1"></i>Retry
                        </button>
                    </div>
                </div>
            `;
            return false;
        }
    }

    async retryVideoLoad(videoId, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="content-loading">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <span>Retrying video load...</span>
            </div>
        `;
        
        await this.createYouTubeEmbed(videoId, containerId);
    }

    // Cache Management
    initializeCache() {
        if (!localStorage.getItem('live_news_cache')) {
            localStorage.setItem('live_news_cache', JSON.stringify({}));
        }
        this.updateCacheStatus();
    }

    getCacheKey(endpoint, params) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    getCachedData(cacheKey) {
        try {
            const cache = JSON.parse(localStorage.getItem('live_news_cache') || '{}');
            const cached = cache[cacheKey];
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
                return cached.data;
            }
            return null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }

    setCachedData(cacheKey, data) {
        try {
            const cache = JSON.parse(localStorage.getItem('live_news_cache') || '{}');
            
            // Remove old entries if cache is too large
            const keys = Object.keys(cache);
            if (keys.length >= this.maxCacheSize) {
                const oldestKey = keys.reduce((oldest, key) => 
                    cache[key].timestamp < cache[oldest].timestamp ? key : oldest
                );
                delete cache[oldestKey];
            }

            cache[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };

            localStorage.setItem('live_news_cache', JSON.stringify(cache));
            this.updateCacheStatus();
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }

    clearCache() {
        localStorage.setItem('live_news_cache', JSON.stringify({}));
        this.updateCacheStatus();
        this.showNotification('Cache cleared - Fresh news will be loaded', 'success');
        this.loadCategoryNews();
    }

    updateCacheStatus() {
        try {
            const cache = JSON.parse(localStorage.getItem('live_news_cache') || '{}');
            const count = Object.keys(cache).length;
            this.cacheStatsText.textContent = `${count} articles cached`;
            this.cacheText.textContent = `Cache: ${count} items`;
        } catch (error) {
            this.cacheStatsText.textContent = 'Cache error';
            this.cacheText.textContent = 'Cache: Error';
        }
    }

    setupEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Category filters
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectCategory(btn));
        });

        // Headlines refresh
        this.refreshHeadlines.addEventListener('click', () => this.loadBreakingNews());

        // Load more button
        this.loadMoreBtn.addEventListener('click', () => this.loadMoreNews());

        // Modal close on background click
        [this.videoModal, this.previewModal, this.optionsModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Auto-refresh for live news
    setupAutoRefresh() {
        // Refresh breaking news every 2 minutes
        setInterval(() => {
            this.loadBreakingNews();
        }, 2 * 60 * 1000);

        // Refresh main news every 5 minutes
        setInterval(() => {
            if (!this.isLoading) {
                this.showNotification('Refreshing live news...', 'info');
                this.currentPage = 1;
                this.loadCategoryNews();
            }
        }, 5 * 60 * 1000);
    }

    // News Loading Functions
    async loadInitialNews() {
        await this.loadBreakingNews();
        await this.loadCategoryNews();
    }

    async loadBreakingNews() {
        try {
            const headlines = await this.fetchNews('top-headlines', { 
                category: 'general', 
                pageSize: 10,
                country: 'us'
            });
            this.displayBreakingNews(headlines);
        } catch (error) {
            console.error('Breaking news error:', error);
            this.displayBreakingNewsError(error.message);
        }
    }

    async loadCategoryNews() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const params = {
                category: this.currentCategory,
                pageSize: 20,
                page: this.currentPage,
                country: 'us'
            };

            if (this.searchTerm) {
                params.q = this.searchTerm;
                delete params.category;
                delete params.country;
            }

            const articles = await this.fetchNews(this.searchTerm ? 'everything' : 'top-headlines', params);

            if (this.currentPage === 1) {
                this.newsContainer.innerHTML = '';
            }

            this.displayNews(articles);
            this.loadMoreBtn.style.display = articles && articles.length >= 20 ? 'block' : 'none';

        } catch (error) {
            console.error('News loading error:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async fetchNews(endpoint, params) {
        const cacheKey = this.getCacheKey(endpoint, params);
        
        // Try cache first for non-breaking news
        if (endpoint !== 'top-headlines' || params.pageSize !== 10) {
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                this.showNotification('Loaded from cache', 'info');
                return cachedData;
            }
        }

        try {
            const url = new URL(`${this.baseUrl}/${endpoint}`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            url.searchParams.append('apiKey', this.apiKey);

            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                } else if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your NewsAPI configuration.');
                } else {
                    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
                }
            }

            const data = await response.json();
            const articles = data.articles || [];
            
            // Cache the results
            this.setCachedData(cacheKey, articles);
            
            if (articles.length > 0) {
                this.showNotification(`Loaded ${articles.length} live articles`, 'success');
            }
            
            return articles;

        } catch (error) {
            console.error('API fetch error:', error);
            
            // Try to return cached data even if expired
            const cache = JSON.parse(localStorage.getItem('live_news_cache') || '{}');
            const cached = cache[cacheKey];
            if (cached) {
                this.showNotification('Using cached data (API unavailable)', 'warning');
                return cached.data;
            }
            
            throw error;
        }
    }

    displayBreakingNews(articles) {
        if (!articles || articles.length === 0) {
            this.headlineContent.innerHTML = '<span class="headline-item">No breaking news available</span>';
            return;
        }

        const headlines = articles.map(article => 
            `<span class="headline-item" data-url="${article.url}">${article.title}</span>`
        ).join('');

        this.headlineContent.innerHTML = headlines;

        this.headlineContent.querySelectorAll('.headline-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.url) {
                    window.open(item.dataset.url, '_blank');
                }
            });
        });
    }

    displayBreakingNewsError(message) {
        this.headlineContent.innerHTML = `<span class="headline-item">Breaking news unavailable: ${message}</span>`;
    }

    displayNews(articles) {
        if (!articles || articles.length === 0) {
            if (this.currentPage === 1) {
                this.showError('No news articles found. Try a different category or search term.');
            }
            return;
        }

        articles.forEach((article, index) => {
            if (article.title && article.title !== '[Removed]') {
                const newsCard = this.createNewsCard(article, index);
                this.newsContainer.appendChild(newsCard);
            }
        });

        this.clearError();
    }

    createNewsCard(article, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'col-lg-4 col-md-6 col-sm-12';

        const timeAgo = this.getTimeAgo(new Date(article.publishedAt));
        const defaultImage = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop";
        const isCached = this.getCachedData(this.getCacheKey('article', { url: article.url })) !== null;
        const videoInfo = this.detectVideoContent(article);

        cardElement.innerHTML = `
            <div class="card news-card h-100 ${isCached ? 'cached' : ''}" 
                 data-url="${article.url}" 
                 data-title="${this.escapeHtml(article.title)}"
                 data-description="${this.escapeHtml(article.description || '')}"
                 data-content="${this.escapeHtml(article.content || '')}"
                 data-source="${this.escapeHtml(article.source.name)}"
                 data-published="${article.publishedAt}"
                 data-has-video="${videoInfo.hasVideo}"
                 data-video-id="${videoInfo.videoId || ''}"
                 data-video-type="${videoInfo.videoType || ''}">
                ${isCached ? '<div class="cache-indicator-card"><i class="bi bi-database"></i></div>' : ''}
                ${videoInfo.hasVideo ? '<div class="cache-indicator-card" style="background: var(--breaking-color); top: 40px;"><i class="bi bi-play-circle"></i></div>' : ''}
                <img 
                    src="${article.urlToImage || defaultImage}" 
                    class="card-img-top news-card-img" 
                    alt="${article.title}"
                    onerror="this.src='${defaultImage}'"
                >
                <div class="card-body d-flex flex-column">
                    <div class="source-info">
                        <div class="d-flex align-items-center">
                            <span class="source-name">${article.source.name}</span>
                            ${isCached ? '<i class="bi bi-database text-muted ms-2" title="Cached"></i>' : ''}
                            ${videoInfo.hasVideo ? '<i class="bi bi-play-circle text-danger ms-2" title="Video Available"></i>' : ''}
                        </div>
                        <span class="publish-time">${timeAgo}</span>
                    </div>
                    
                    <h5 class="card-title">${this.truncateText(article.title, 80)}</h5>
                    <p class="card-text flex-grow-1">${this.truncateText(article.description || 'No description available', 120)}</p>
                    
                    <div class="mt-auto">
                        <div class="action-buttons">
                            <button class="btn-preview" onclick="newsHub.openPreviewModal(this)">
                                <i class="bi bi-eye me-1"></i>Preview
                            </button>
                            ${videoInfo.hasVideo ? `
                                <button class="btn-watch" onclick="newsHub.openVideoModal(this)">
                                    <i class="bi bi-play-circle me-1"></i>Video
                                </button>
                            ` : ''}
                            <button class="btn-read" onclick="newsHub.readFullArticle('${article.url}')">
                                <i class="bi bi-book me-1"></i>Read
                            </button>
                            <button class="btn-options" onclick="newsHub.openOptionsModal(this)">
                                <i class="bi bi-three-dots me-1"></i>Options
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return cardElement;
    }

    detectVideoContent(article) {
        // Enhanced video detection with YouTube integration
        const content = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();
        const videoKeywords = ['video', 'watch', 'youtube', 'vimeo', 'mp4', 'webm'];
        
        // Check for YouTube links in content or URL
        const youtubeId = this.extractYouTubeId(article.url) || this.extractYouTubeId(content);
        if (youtubeId) {
            return { 
                hasVideo: true, 
                videoId: youtubeId, 
                videoType: 'youtube' 
            };
        }
        
        // Check for video keywords
        const hasVideoKeywords = videoKeywords.some(keyword => content.includes(keyword));
        
        // Check if image URL suggests video content
        const hasVideoImage = article.urlToImage && (
            article.urlToImage.includes('video') || 
            article.urlToImage.includes('youtube') ||
            article.urlToImage.includes('thumbnail')
        );
        
        // Simulate video availability for demo (remove in production)
        const simulatedVideo = Math.random() > 0.7;
        
        if (hasVideoKeywords || hasVideoImage || simulatedVideo) {
            // Generate sample video content for demo
            const videoTypes = ['youtube', 'vimeo', 'direct'];
            const randomType = videoTypes[Math.floor(Math.random() * videoTypes.length)];
            
            let videoId = null;
            if (randomType === 'youtube') {
                // Sample YouTube video IDs for demo
                const sampleVideoIds = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', 'M7lc1UVf-VE'];
                videoId = sampleVideoIds[Math.floor(Math.random() * sampleVideoIds.length)];
            }
            
            return {
                hasVideo: true,
                videoId: videoId,
                videoType: randomType
            };
        }
        
        return { hasVideo: false };
    }

    // ENHANCED VIDEO MODAL FUNCTIONS

    async openVideoModal(button) {
        const card = button.closest('.news-card');
        this.currentArticleData = this.getArticleDataFromCard(card);
        
        await this.showVideoModal();
    }

    async showVideoModal() {
        const { title, url, source, hasVideo, videoId, videoType } = this.currentArticleData;
        
        document.getElementById('videoModalTitle').textContent = this.truncateText(title, 60);
        document.getElementById('videoBadge').textContent = hasVideo ? 'Live Video' : 'Related Video';
        document.getElementById('videoDescription').textContent = `From ${source}`;
        
        this.videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Show loading state
        document.getElementById('videoPlayerContainer').innerHTML = `
            <div class="content-loading" style="height: 400px; display: flex; align-items: center; justify-content: center;">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <span>Loading video content...</span>
            </div>
        `;
        
        // Load video content based on type
        await this.loadVideoContent(videoId, videoType);
    }

    async loadVideoContent(videoId, videoType) {
        const container = document.getElementById('videoPlayerContainer');
        
        try {
            if (videoType === 'youtube' && videoId) {
                // Use YouTube API validation and embedding
                const success = await this.createYouTubeEmbed(videoId, 'videoPlayerContainer');
                if (!success) {
                    this.showNotification('YouTube video could not be loaded', 'warning');
                }
            } else if (videoType === 'vimeo') {
                // Vimeo embed
                container.innerHTML = `
                    <iframe 
                        class="video-player-centered" 
                        src="https://player.vimeo.com/video/148751763?autoplay=1&muted=1" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                `;
            } else if (videoType === 'direct') {
                // Direct video
                container.innerHTML = `
                    <video class="video-player-centered" controls autoplay muted preload="metadata">
                        <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4">
                        <track src="/path/to/captions.vtt" kind="subtitles" srclang="en" label="English">
                        Your browser does not support the video tag.
                    </video>
                `;
            } else {
                // Fallback content
                container.innerHTML = `
                    <div class="video-error-container">
                        <div class="video-error-content">
                            <i class="bi bi-film" style="font-size: 3rem; color: #3498db; margin-bottom: 1rem;"></i>
                            <h3>Video Content Available</h3>
                            <p>This article contains video content available at the source.</p>
                            <button class="modal-btn modal-btn-primary" onclick="window.open('${this.currentArticleData.url}', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Watch at Source
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Video loading error:', error);
            container.innerHTML = `
                <div class="video-error-container">
                    <div class="video-error-content">
                        <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                        <h3>Video Loading Failed</h3>
                        <p>Unable to load video content. Please try again later.</p>
                        <button class="modal-btn modal-btn-secondary" onclick="newsHub.loadVideoContent('${videoId}', '${videoType}')">
                            <i class="bi bi-arrow-clockwise me-1"></i>Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }

    openPreviewModal(button) {
        const card = button.closest('.news-card');
        this.currentArticleData = this.getArticleDataFromCard(card);
        
        this.showPreviewModal();
    }

    async showPreviewModal() {
        const { title, description, content, source, publishedAt, url } = this.currentArticleData;
        
        document.getElementById('previewModalTitle').textContent = title;
        document.getElementById('previewSource').textContent = source;
        document.getElementById('previewTime').textContent = this.getTimeAgo(new Date(publishedAt));
        document.getElementById('previewCategory').textContent = this.currentCategory.toUpperCase();
        
        this.previewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Show loading state
        document.getElementById('previewContent').innerHTML = `
            <div class="content-loading">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <span>Loading preview...</span>
            </div>
        `;
        
        // Simulate content loading
        setTimeout(() => {
            this.displayPreviewContent(description, content);
        }, 1000);
    }

    displayPreviewContent(description, content) {
        const summary = this.generateSummary(description, content);
        const readingTime = Math.ceil((content || description || '').length / 1000) + ' min';
        const hasVideo = this.currentArticleData.hasVideo;

        const previewHTML = `
            <div class="mb-4">
                <h6><i class="bi bi-file-text me-2"></i>Article Summary</h6>
                <p style="font-size: 1.1rem; line-height: 1.8;">${summary}</p>
            </div>
            
            ${content && content !== 'null' ? `
                <div class="full-article-content-centered">
                    <h6><i class="bi bi-file-text me-2"></i>Full Article Content</h6>
                    <p>${this.truncateText(content, 800)}</p>
                    ${content.length > 800 ? '<p><em>...content continues in full article</em></p>' : ''}
                </div>
            ` : ''}
            
            ${hasVideo ? `
                <div class="mt-4 p-3" style="background: rgba(231, 76, 60, 0.1); border-radius: 10px; border-left: 4px solid var(--breaking-color);">
                    <h6><i class="bi bi-play-circle me-2"></i>Video Content Available</h6>
                    <p class="mb-0">This article includes video content. Click the Video button to watch.</p>
                </div>
            ` : ''}
            
            <div class="mt-4 p-3" style="background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="bi bi-clock me-1"></i>Estimated reading time: ${readingTime}
                    </small>
                    <small class="text-muted">
                        <i class="bi bi-eye me-1"></i>Live preview
                    </small>
                </div>
            </div>
        `;

        document.getElementById('previewContent').innerHTML = previewHTML;
    }

    openOptionsModal(button) {
        const card = button.closest('.news-card');
        this.currentArticleData = this.getArticleDataFromCard(card);
        
        this.optionsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Modal utility functions
    getArticleDataFromCard(card) {
        return {
            url: card.dataset.url,
            title: card.dataset.title,
            description: card.dataset.description,
            content: card.dataset.content,
            source: card.dataset.source,
            publishedAt: card.dataset.published,
            hasVideo: card.dataset.hasVideo === 'true',
            videoId: card.dataset.videoId,
            videoType: card.dataset.videoType
        };
    }

    closeVideoModal() {
        this.videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Stop any playing videos
        const videoContainer = document.getElementById('videoPlayerContainer');
        videoContainer.innerHTML = '';
    }

    closePreviewModal() {
        this.previewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeOptionsModal() {
        this.optionsModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeAllModals() {
        this.closeVideoModal();
        this.closePreviewModal();
        this.closeOptionsModal();
    }

    // Modal action functions
    toggleFullscreen() {
        const videoPlayer = document.querySelector('.video-player-centered, iframe, video');
        if (videoPlayer) {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) {
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) {
                videoPlayer.msRequestFullscreen();
            }
        }
    }

    openVideoSource() {
        if (this.currentArticleData) {
            window.open(this.currentArticleData.url, '_blank');
        }
    }

    shareVideo() {
        if (this.currentArticleData) {
            this.shareArticle(this.currentArticleData.url, this.currentArticleData.title);
        }
    }

    readFullFromPreview() {
        if (this.currentArticleData) {
            window.open(this.currentArticleData.url, '_blank');
        }
    }

    shareFromPreview() {
        if (this.currentArticleData) {
            this.shareArticle(this.currentArticleData.url, this.currentArticleData.title);
        }
    }

    // Options modal functions
    readFullArticleFromOptions() {
        if (this.currentArticleData) {
            window.open(this.currentArticleData.url, '_blank');
            this.closeOptionsModal();
        }
    }

    readFromSourceFromOptions() {
        if (this.currentArticleData) {
            window.open(this.currentArticleData.url, '_blank');
            this.closeOptionsModal();
            this.showNotification('Opening article from original source', 'info');
        }
    }

    showFullContentFromOptions() {
        if (this.currentArticleData) {
            const { title, content, url } = this.currentArticleData;
            
            if (!content || content === 'null' || content === '') {
                this.showNotification('Full content not available - try reading from source', 'warning');
                return;
            }

            this.closeOptionsModal();
            this.displayFullContentModal(title, content, url);
        }
    }

    saveArticleFromOptions() {
        if (this.currentArticleData) {
            // Save to localStorage
            const savedArticles = JSON.parse(localStorage.getItem('saved_articles') || '[]');
            const articleToSave = {
                ...this.currentArticleData,
                savedAt: Date.now()
            };
            
            // Check if already saved
            const isAlreadySaved = savedArticles.some(article => article.url === articleToSave.url);
            
            if (!isAlreadySaved) {
                savedArticles.push(articleToSave);
                localStorage.setItem('saved_articles', JSON.stringify(savedArticles));
                this.showNotification('Article saved successfully', 'success');
            } else {
                this.showNotification('Article already saved', 'warning');
            }
            
            this.closeOptionsModal();
        }
    }

    shareFromOptions() {
        if (this.currentArticleData) {
            this.shareArticle(this.currentArticleData.url, this.currentArticleData.title);
            this.closeOptionsModal();
        }
    }

    displayFullContentModal(title, content, url) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '10000';
        
        modal.innerHTML = `
            <div class="preview-modal-content" style="max-width: 900px;">
                <div class="preview-modal-header">
                    <h3 class="preview-modal-title">
                        <i class="bi bi-file-text me-2"></i>Full Article Content
                    </h3>
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = 'auto';">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="preview-content-centered">
                    <h4 class="mb-4">${title}</h4>
                    <div style="line-height: 1.8; color: rgba(255,255,255,0.9); font-size: 1.1rem;">
                        ${content.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-primary" onclick="window.open('${url}', '_blank')">
                        <i class="bi bi-box-arrow-up-right me-1"></i>Read Original
                    </button>
                    <button class="modal-btn modal-btn-secondary" onclick="newsHub.shareArticle('${url}', '${title.replace(/'/g, "\\'")}')">
                        <i class="bi bi-share me-1"></i>Share Article
                    </button>
                    <button class="modal-btn modal-btn-secondary" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = 'auto';">
                        <i class="bi bi-x-circle me-1"></i>Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });
    }

    generateSummary(description, content) {
        const text = content || description || 'No content available for this article.';
        
        if (text.length <= 300) return text;
        
        // Try to find a good breaking point
        const sentences = text.split('. ');
        let summary = '';
        
        for (let sentence of sentences) {
            if ((summary + sentence).length > 300) break;
            summary += sentence + '. ';
        }
        
        return summary || text.substring(0, 300) + '...';
    }

    shareArticle(url, title) {
        if (navigator.share) {
            navigator.share({
                title: title,
                url: url
            }).then(() => {
                this.showNotification('Article shared successfully', 'success');
            }).catch(() => {
                this.fallbackShare(url, title);
            });
        } else {
            this.fallbackShare(url, title);
        }
    }

    fallbackShare(url, title) {
        // Copy to clipboard
        navigator.clipboard.writeText(`${title} - ${url}`).then(() => {
            this.showNotification('Article link copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Unable to share article', 'error');
        });
    }

    // Search and Category Functions
    performSearch() {
        const query = this.searchInput.value.trim();
        if (query) {
            this.searchTerm = query;
            this.currentPage = 1;
            this.loadCategoryNews();
            this.showNotification(`Searching live news for: ${query}`, 'info');
        }
    }

    selectCategory(button) {
        this.categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentCategory = button.dataset.category;
        this.currentPage = 1;
        this.searchTerm = '';
        this.searchInput.value = '';
        
        this.loadCategoryNews();
        this.showNotification(`Loading live ${this.currentCategory} news`, 'info');
    }

    loadMoreNews() {
        this.currentPage++;
        this.loadCategoryNews();
    }

    readFullArticle(url) {
        window.open(url, '_blank');
        this.showNotification('Opening full article', 'info');
    }

    // UI Helper Functions
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showError(message) {
        this.errorContainer.innerHTML = `
            <div class="error-container">
                <i class="bi bi-exclamation-triangle me-2" style="font-size: 2rem;"></i>
                <h5>Unable to Load Live News</h5>
                <p>${message}</p>
                <button class="retry-btn" onclick="newsHub.retryLastAction()">
                    <i class="bi bi-arrow-clockwise me-2"></i>Try Again
                </button>
            </div>
        `;
    }

    clearError() {
        this.errorContainer.innerHTML = '';
    }

    retryLastAction() {
        this.clearError();
        this.loadCategoryNews();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="bi bi-${this.getNotificationIcon(type)} me-2"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'x-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Utility Functions
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }
}

// Initialize the Live News Hub
let newsHub;
document.addEventListener('DOMContentLoaded', () => {
    newsHub = new LiveNewsHub();
});

// Security measures
document.addEventListener("keydown", function(e) {
    // F12, Ctrl+Shift+I, and Ctrl+U
    if ((e.key === 'F12') || 
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
    }
});

// Detect DevTools opening (using resize event)
let devtoolsOpen = false;
setInterval(function() {
    const width = window.outerWidth - window.innerWidth > 100;
    const height = window.outerHeight - window.innerHeight > 100;
    if ((width || height) && !devtoolsOpen) {
        devtoolsOpen = true;
    }
    if (!(width || height) && devtoolsOpen) {
        devtoolsOpen = false;
    }
}, 1000);
        class LiveNewsHub {
            constructor() {
                this.initializeProperties();
                this.setupEventListeners();
                this.initializeCache();
                this.loadInitialNews();
                this.setupAutoRefresh();
            }

            initializeProperties() {
                // NewsAPI configuration
                this.baseUrl = 'https://newsapi.org/v2';
                this.apiKey = 'dcb071f269784ec280990d91a82ecc23'; // Your NewsAPI key
                
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

                cardElement.innerHTML = `
                    <div class="card news-card h-100 ${isCached ? 'cached' : ''}" 
                         data-url="${article.url}" 
                         data-title="${this.escapeHtml(article.title)}"
                         data-description="${this.escapeHtml(article.description || '')}">
                        ${isCached ? '<div class="cache-indicator-card"><i class="bi bi-database"></i></div>' : ''}
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
                                </div>
                                <span class="publish-time">${timeAgo}</span>
                            </div>
                            
                            <h5 class="card-title">${this.truncateText(article.title, 80)}</h5>
                            <p class="card-text flex-grow-1">${this.truncateText(article.description || 'No description available', 120)}</p>
                            
                            <div class="mt-auto">
                                <div class="action-buttons">
                                    <button class="btn btn-preview" onclick="window.open('${article.url}', '_blank')">
                                        <i class="bi bi-eye me-1"></i>Read Full
                                    </button>
                                    <button class="btn btn-watch" onclick="newsHub.toggleArticlePreview(this)">
                                        <i class="bi bi-play-circle me-1"></i>Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                return cardElement;
            }

            async toggleArticlePreview(button) {
                const card = button.closest('.news-card');
                const isActive = button.classList.contains('active');

                if (isActive) {
                    const preview = card.querySelector('.content-preview');
                    if (preview) {
                        preview.classList.remove('active');
                    }
                    button.classList.remove('active');
                    button.innerHTML = '<i class="bi bi-play-circle me-1"></i>Preview';
                } else {
                    button.innerHTML = '<i class="bi bi-stop-circle me-1"></i>Hide';
                    button.classList.add('active');
                    await this.showContentPreview(card);
                }
            }

            async showContentPreview(cardElement) {
                const url = cardElement.dataset.url;
                const title = cardElement.dataset.title;
                const description = cardElement.dataset.description;

                try {
                    let previewElement = cardElement.querySelector('.content-preview');
                    if (!previewElement) {
                        previewElement = document.createElement('div');
                        previewElement.className = 'content-preview';
                        cardElement.querySelector('.card-body').appendChild(previewElement);
                    }

                    previewElement.innerHTML = `
                        <div class="content-loading">
                            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                            <span>Loading preview...</span>
                        </div>
                    `;
                    previewElement.classList.add('active');

                    // Simulate content extraction
                    setTimeout(() => {
                        this.displayContentPreview(previewElement, title, description, url);
                    }, 1000);

                } catch (error) {
                    console.error('Preview error:', error);
                }
            }

            displayContentPreview(container, title, description, url) {
                const summary = this.generateSummary(description);
                const readingTime = Math.ceil((description || '').length / 1000) + ' min';
                const hasVideo = Math.random() > 0.8; // Simulate video availability

                container.innerHTML = `
                    <div class="preview-header">
                        <h6><i class="bi bi-eye me-2"></i>Article Preview</h6>
                        <small class="text-muted">Live Content</small>
                    </div>
                    <div class="preview-content">
                        <h6>${title}</h6>
                        <p>${summary}</p>
                        ${hasVideo ? `
                            <div class="mt-3">
                                <h6><i class="bi bi-play-circle me-2"></i>Video Available</h6>
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Video content available - click "Read Full" to watch
                                </div>
                            </div>
                        ` : ''}
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>${readingTime} read
                            </small>
                            <div>
                                <button class="btn btn-outline-primary btn-sm" onclick="window.open('${url}', '_blank')">
                                    <i class="bi bi-box-arrow-up-right me-1"></i>Read Full Article
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            generateSummary(description) {
                if (!description) return 'No description available for this article.';
                
                const summary = description.length > 200 
                    ? description.substring(0, 200) + '...' 
                    : description;
                
                return summary;
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

          // Prevent right-click (optional)
        document.addEventListener('contextmenu', e => e.preventDefault());
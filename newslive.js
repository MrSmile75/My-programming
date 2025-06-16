        // API Configuration
        const NEWS_API_KEY = 'dcb071f269784ec280990d91a82ecc23'; // Replace with  NewsAPI key
        const YOUTUBE_API_KEY = 'AIzaSyDBKjt_vLZJhVqq7hpwXbvEgsOoD9NDu4A'; // Replace with  YouTube API key
        
        // Cache configuration
        const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
        const CACHE_KEY_NEWS = 'newsCache';
        const CACHE_KEY_VIDEOS = 'videosCache';
        const CACHE_KEY_OFFLINE = 'offlineNewsCache';

        let newsData = [];
        let currentIndex = 0;
        let previousIndex = -1;
        let isOnline = navigator.onLine;
        let searchTimeout;
        let isAudioMuted = false;
        let isInfiniteScrollEnabled = true;
        let isLoadingMore = false;
        let currentPage = 1;
        let totalPages = 5; // Simulate pagination
        let videoStates = new Map(); // Track video play/pause states
        let userInteractions = {
            likes: new Set(),
            subscriptions: new Set(),
            following: new Set()
        };

        // Network status monitoring
        window.addEventListener('online', () => {
            isOnline = true;
            hideOfflineIndicator();
            showAlert('Back online! Fresh content loading...', 'success');
            updateCacheInfo();
        });

        window.addEventListener('offline', () => {
            isOnline = false;
            showOfflineIndicator();
            showAlert('You are offline. Showing cached content.', 'warning');
            updateCacheInfo();
        });

        // Video control functions
        function pauseAllVideos() {
            const allIframes = document.querySelectorAll('.video-iframe');
            allIframes.forEach((iframe, index) => {
                if (iframe.contentWindow) {
                    try {
                        // Send pause command to YouTube iframe
                        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        videoStates.set(index, 'paused');
                        updateVideoState(index, 'paused');
                    } catch (e) {
                        console.log('Could not pause video:', e);
                    }
                }
            });
        }

        function playCurrentVideo() {
            const currentIframe = document.querySelector(`[data-index="${currentIndex}"] .video-iframe`);
            if (currentIframe && currentIframe.contentWindow) {
                try {
                    // Send play command to YouTube iframe
                    currentIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    videoStates.set(currentIndex, 'playing');
                    updateVideoState(currentIndex, 'playing');
                } catch (e) {
                    console.log('Could not play video:', e);
                }
            }
        }

        function pauseCurrentVideo() {
            const currentIframe = document.querySelector(`[data-index="${currentIndex}"] .video-iframe`);
            if (currentIframe && currentIframe.contentWindow) {
                try {
                    // Send pause command to YouTube iframe
                    currentIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    videoStates.set(currentIndex, 'paused');
                    updateVideoState(currentIndex, 'paused');
                } catch (e) {
                    console.log('Could not pause video:', e);
                }
            }
        }

        function toggleVideoPlayPause(index) {
            const iframe = document.querySelector(`[data-index="${index}"] .video-iframe`);
            const overlay = document.querySelector(`[data-index="${index}"] .video-overlay`);
            const playPauseBtn = document.querySelector(`[data-index="${index}"] .play-pause-btn`);
            
            if (!iframe) return;

            const currentState = videoStates.get(index) || 'paused';
            
            if (currentState === 'playing') {
                // Pause video
                try {
                    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    videoStates.set(index, 'paused');
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    overlay.classList.add('show');
                    updateVideoState(index, 'paused');
                    
                    setTimeout(() => {
                        overlay.classList.remove('show');
                    }, 2000);
                } catch (e) {
                    console.log('Could not pause video:', e);
                }
            } else {
                // Play video
                try {
                    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    videoStates.set(index, 'playing');
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    overlay.classList.add('show');
                    updateVideoState(index, 'playing');
                    
                    setTimeout(() => {
                        overlay.classList.remove('show');
                    }, 1000);
                } catch (e) {
                    console.log('Could not play video:', e);
                }
            }
        }

        function updateVideoState(index, state) {
            const stateIndicator = document.querySelector(`[data-index="${index}"] .video-state`);
            if (stateIndicator) {
                stateIndicator.textContent = state === 'playing' ? 'Playing' : 'Paused';
                stateIndicator.className = `video-state show ${state}`;
                
                setTimeout(() => {
                    stateIndicator.classList.remove('show');
                }, 2000);
            }
        }

        // Navigation functions
        function scrollUp() {
            const container = document.getElementById('shortsContainer');
            
            // Pause current video before scrolling
            pauseCurrentVideo();
            
            container.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
            
            setTimeout(() => {
                updateCurrentIndex(-1);
                handleVideoTransition();
            }, 300);
        }

        function scrollDown() {
            const container = document.getElementById('shortsContainer');
            
            // Pause current video before scrolling
            pauseCurrentVideo();
            
            container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            
            setTimeout(() => {
                updateCurrentIndex(1);
                handleVideoTransition();
                checkInfiniteScroll();
            }, 300);
        }

        function updateCurrentIndex(direction) {
            const container = document.getElementById('shortsContainer');
            const scrollTop = container.scrollTop;
            const cardHeight = window.innerHeight;
            previousIndex = currentIndex;
            currentIndex = Math.round(scrollTop / cardHeight);
            
            // Update arrow states
            updateArrowStates();
        }

        function handleVideoTransition() {
            // Pause previous video
            if (previousIndex >= 0 && previousIndex !== currentIndex) {
                const prevIframe = document.querySelector(`[data-index="${previousIndex}"] .video-iframe`);
                if (prevIframe && prevIframe.contentWindow) {
                    try {
                        prevIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        videoStates.set(previousIndex, 'paused');
                        updateVideoState(previousIndex, 'paused');
                    } catch (e) {
                        console.log('Could not pause previous video:', e);
                    }
                }
            }

            // Auto-play current video if audio is enabled
            if (!isAudioMuted) {
                setTimeout(() => {
                    playCurrentVideo();
                }, 500);
            }
        }

        function updateArrowStates() {
            const upArrow = document.getElementById('upArrow');
            const downArrow = document.getElementById('downArrow');
            
            upArrow.classList.toggle('disabled', currentIndex <= 0);
            // Never disable down arrow in infinite mode
            downArrow.classList.remove('disabled');
        }

        // Audio control functions
        function toggleAudio() {
            const audioControl = document.getElementById('audioControl');
            isAudioMuted = !isAudioMuted;
            
            if (isAudioMuted) {
                audioControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
                audioControl.classList.add('muted');
                showAlert('Audio muted - Videos will pause when scrolled', 'info');
                pauseCurrentVideo();
            } else {
                audioControl.innerHTML = '<i class="fas fa-volume-up"></i>';
                audioControl.classList.remove('muted');
                showAlert('Audio enabled with high volume!', 'success');
                playCurrentVideo();
            }
        }

        // Infinite scroll functionality
        function checkInfiniteScroll() {
            if (!isInfiniteScrollEnabled || isLoadingMore) return;
            
            const container = document.getElementById('shortsContainer');
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            // Load more when user is near the bottom (80% scrolled)
            if (scrollTop + clientHeight >= scrollHeight * 0.8) {
                loadMoreInfinite();
            }
        }

        async function loadMoreInfinite() {
            if (isLoadingMore || !isOnline) return;
            
            isLoadingMore = true;
            const autoLoading = document.getElementById('autoLoading');
            autoLoading.style.display = 'flex';
            
            try {
                currentPage++;
                const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=5&page=${currentPage}&apiKey=${NEWS_API_KEY}`);
                const data = await response.json();
                
                if (data.status === 'ok' && data.articles.length > 0) {
                    const newArticles = data.articles;
                    await loadVideosForArticles(newArticles);
                    
                    const startIndex = newsData.length;
                    newsData = [...newsData, ...newArticles];
                    appendNews(newArticles, startIndex);
                    setOfflineCache(newsData);
                    
                    showAlert(`Loaded ${newArticles.length} more shorts!`, 'success');
                } else {
                    // If no more news from API, generate more demo content
                    const demoArticles = generateMoreDemoNews(5);
                    const startIndex = newsData.length;
                    newsData = [...newsData, ...demoArticles];
                    appendNews(demoArticles, startIndex);
                    
                    showAlert('Generated more content for you!', 'info');
                }
            } catch (error) {
                console.error('Error loading more content:', error);
                // Generate demo content as fallback
                const demoArticles = generateMoreDemoNews(5);
                const startIndex = newsData.length;
                newsData = [...newsData, ...demoArticles];
                appendNews(demoArticles, startIndex);
                
                showAlert('Loaded offline content', 'warning');
            } finally {
                isLoadingMore = false;
                autoLoading.style.display = 'none';
            }
        }

        function generateMoreDemoNews(count) {
            const demoTopics = [
                'Technology Breakthrough',
                'Climate Change Update',
                'Space Exploration',
                'Medical Discovery',
                'Economic News',
                'Sports Update',
                'Entertainment News',
                'Science Innovation',
                'Political Development',
                'Cultural Event'
            ];
            
            const articles = [];
            for (let i = 0; i < count; i++) {
                const topic = demoTopics[Math.floor(Math.random() * demoTopics.length)];
                articles.push({
                    title: `Breaking: ${topic} - Latest Development #${Date.now() + i}`,
                    description: `Important update on ${topic.toLowerCase()} with significant implications for the future. Stay informed with the latest developments.`,
                    source: { name: `News${Math.floor(Math.random() * 100)}` },
                    publishedAt: new Date().toISOString(),
                    urlToImage: null
                });
            }
            return articles;
        }

        // Cache management
        function setCache(key, data) {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
            updateCacheInfo();
        }

        function getCache(key) {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
            
            if (isExpired && isOnline) {
                localStorage.removeItem(key);
                return null;
            }
            
            return cacheData.data;
        }

        function setOfflineCache(data) {
            localStorage.setItem(CACHE_KEY_OFFLINE, JSON.stringify(data));
        }

        function getOfflineCache() {
            const cached = localStorage.getItem(CACHE_KEY_OFFLINE);
            return cached ? JSON.parse(cached) : null;
        }

        function updateCacheInfo() {
            const cacheInfo = document.getElementById('cacheInfo');
            const infiniteIndicator = document.getElementById('infiniteIndicator');
            
            if (isOnline) {
                const newsCache = getCache(CACHE_KEY_NEWS);
                const status = newsCache ? 'Saved' : 'Live';
                cacheInfo.innerHTML = `<i class="fas fa-signal"></i> ${status}`;
            } else {
                cacheInfo.innerHTML = `<i class="fas fa-wifi-slash"></i> Offline`;
            }
            
            if (isInfiniteScrollEnabled) {
                infiniteIndicator.style.display = 'block';
            }
        }

        function showOfflineIndicator() {
            document.getElementById('offlineIndicator').style.display = 'block';
        }

        function hideOfflineIndicator() {
            document.getElementById('offlineIndicator').style.display = 'none';
        }

        // Alert system
        function showAlert(message, type = 'info') {
            const alert = document.createElement('div');
            alert.className = `alert ${type}`;
            alert.textContent = message;
            document.body.appendChild(alert);

            setTimeout(() => {
                alert.remove();
            }, 3000);
        }

        // Floating heart animation
        function createFloatingHeart(x, y) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '<i class="fas fa-heart"></i>';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            document.body.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 2000);
        }

        // Interaction handlers
        function toggleLike(index, event) {
            const isLiked = userInteractions.likes.has(index);
            if (isLiked) {
                userInteractions.likes.delete(index);
                showAlert('Removed like from this short', 'info');
            } else {
                userInteractions.likes.add(index);
                showAlert('You liked this short!', 'success');
                
                // Create floating heart animation
                const rect = event.target.getBoundingClientRect();
                createFloatingHeart(rect.left, rect.top);
            }
            updateActionButton(index, 'like', !isLiked);
        }

        function openComments(index) {
            showAlert('Coming soon!', '');
        }

        function shareShort(index) {
            if (navigator.share) {
                navigator.share({
                    title: newsData[index]?.title || 'News Short',
                    text: newsData[index]?.description || 'Check out this news short!',
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                showAlert('Link copied to clipboard!', 'success');
            }
        }

        function toggleSubscribe(index) {
            const isSubscribed = userInteractions.subscriptions.has(index);
            if (isSubscribed) {
                userInteractions.subscriptions.delete(index);
                showAlert('Unsubscribed from channel', 'info');
            } else {
                userInteractions.subscriptions.add(index);
                showAlert('Subscribed to channel!', 'success');
            }
            updateSubscribeButton(index, !isSubscribed);
        }

        function toggleFollow(index) {
            const isFollowing = userInteractions.following.has(index);
            if (isFollowing) {
                userInteractions.following.delete(index);
                showAlert('Unfollowed channel', 'info');
            } else {
                userInteractions.following.add(index);
                showAlert('Following channel!', 'success');
            }
            updateFollowButton(index, !isFollowing);
        }

        function updateActionButton(index, type, state) {
            const button = document.querySelector(`[data-index="${index}"] .action-btn.${type}`);
            if (button) {
                if (state) {
                    button.classList.add('liked');
                } else {
                    button.classList.remove('liked');
                }
            }
        }

        function updateSubscribeButton(index, state) {
            const button = document.querySelector(`[data-index="${index}"] .subscribe-btn`);
            if (button) {
                button.innerHTML = state ? '<i class="fas fa-check"></i>' : '<i class="fas fa-plus"></i>';
                button.classList.toggle('subscribed', state);
            }
        }

        function updateFollowButton(index, state) {
            const button = document.querySelector(`[data-index="${index}"] .follow-btn`);
            if (button) {
                button.textContent = state ? 'Following' : 'Follow';
                button.classList.toggle('following', state);
            }
        }

        // Search functionality
        function setupSearch() {
            const searchBar = document.getElementById('searchBar');
            
            searchBar.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length > 2) {
                    searchTimeout = setTimeout(() => {
                        searchNews(query);
                    }, 500);
                } else if (query.length === 0) {
                    loadNews();
                }
            });

            searchBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        searchNews(query);
                    }
                }
            });
        }

        async function searchNews(query) {
            if (!isOnline) {
                showAlert('Search requires internet connection', 'warning');
                return;
            }

            const loading = document.getElementById('loading');
            loading.style.display = 'block';

            // Pause all videos before search
            pauseAllVideos();

            try {
                const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
                const data = await response.json();
                
                if (data.status === 'ok' && data.articles.length > 0) {
                    newsData = data.articles;
                    await loadVideosForArticles(newsData);
                    displayNews(newsData);
                    currentIndex = 0;
                    previousIndex = -1;
                    updateArrowStates();
                    showAlert(`Found ${data.articles.length} results for "${query}"`, 'success');
                } else {
                    showAlert(`No results found for "${query}"`, 'info');
                }
            } catch (error) {
                console.error('Search error:', error);
                showAlert('Search failed. Please try again.', 'error');
            } finally {
                loading.style.display = 'none';
            }
        }

        // Fetch more news
        async function fetchMoreNews() {
            const plusBtn = document.getElementById('plusBtn');
            plusBtn.classList.add('loading');
            plusBtn.innerHTML = '<i class="fas fa-spinner"></i>';

            try {
                if (!isOnline) {
                    showAlert('Loading more requires internet connection', 'warning');
                    return;
                }

                const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=5&page=${Math.floor(newsData.length / 5) + 1}&apiKey=${NEWS_API_KEY}`);
                const data = await response.json();
                
                if (data.status === 'ok' && data.articles.length > 0) {
                    const newArticles = data.articles;
                    await loadVideosForArticles(newArticles);
                    
                    const startIndex = newsData.length;
                    newsData = [...newsData, ...newArticles];
                    appendNews(newArticles, startIndex);
                    setOfflineCache(newsData);
                    
                    showAlert(`Added ${newArticles.length} new shorts!`, 'success');
                } else {
                    showAlert('No more news available', 'info');
                }
            } catch (error) {
                console.error('Error fetching more news:', error);
                showAlert('Failed to load more news', 'error');
            } finally {
                plusBtn.classList.remove('loading');
                plusBtn.innerHTML = '<i class="fas fa-plus"></i>';
            }
        }

        // Fetch news from NewsAPI
        async function fetchNews() {
            if (!isOnline) {
                const offlineData = getOfflineCache();
                if (offlineData) {
                    return offlineData;
                }
            }

            const cached = getCache(CACHE_KEY_NEWS);
            if (cached) {
                console.log('Using cached news data');
                return cached;
            }

            try {
                const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${NEWS_API_KEY}`);
                const data = await response.json();
                
                if (data.status === 'ok') {
                    setCache(CACHE_KEY_NEWS, data.articles);
                    setOfflineCache(data.articles);
                    return data.articles;
                } else {
                    throw new Error(data.message || 'Failed to fetch news');
                }
            } catch (error) {
                console.error('Error fetching news:', error);
                const offlineData = getOfflineCache();
                return offlineData || getDemoNews();
            }
        }

        // Fetch YouTube videos
        async function fetchYouTubeVideo(query) {
            if (!isOnline) return null;

            const cacheKey = `${CACHE_KEY_VIDEOS}_${encodeURIComponent(query)}`;
            const cached = getCache(cacheKey);
            if (cached) {
                console.log('Using cached video data for:', query);
                return cached;
            }

            try {
                const searchQuery = encodeURIComponent(`${query} news short`);
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&videoDuration=short&key=${YOUTUBE_API_KEY}`);
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    const videoId = data.items[0].id.videoId;
                    setCache(cacheKey, videoId);
                    return videoId;
                }
            } catch (error) {
                console.error('Error fetching YouTube video:', error);
            }
            
            return null;
        }

        async function loadVideosForArticles(articles) {
            const videoPromises = articles.map(async (article) => {
                const videoId = await fetchYouTubeVideo(article.title);
                article.videoId = videoId;
                return article;
            });
            
            await Promise.all(videoPromises);
        }

        // Demo data fallback
        function getDemoNews() {
            return [
                {
                    title: "Breaking: Major AI Breakthrough Changes Everything",
                    description: "Revolutionary artificial intelligence system demonstrates unprecedented capabilities in solving complex problems. Industry experts call it a game-changer for technology.",
                    source: { name: "TechNews" },
                    publishedAt: new Date().toISOString(),
                    urlToImage: null
                },
                {
                    title: "Climate Summit: Historic Global Agreement Reached",
                    description: "World leaders unite for ambitious carbon reduction targets. The landmark deal promises to reshape environmental policy worldwide.",
                    source: { name: "EcoDaily" },
                    publishedAt: new Date().toISOString(),
                    urlToImage: null
                },
                {
                    title: "Mars Mission: Rover Discovers Potential Signs of Life",
                    description: "NASA's latest Mars rover uncovers intriguing geological formations that could indicate past microbial activity on the Red Planet.",
                    source: { name: "SpaceNews" },
                    publishedAt: new Date().toISOString(),
                    urlToImage: null
                },
                {
                    title: "Cryptocurrency Market Sees Massive Surge",
                    description: "Digital currencies experience unprecedented growth as institutional investors show renewed confidence in blockchain technology.",
                    source: { name: "CryptoWatch" },
                    publishedAt: new Date().toISOString(),
                    urlToImage: null
                },
                {
                    title: "Medical Breakthrough: New Treatment Shows Promise",
                    description: "Researchers announce successful trials of innovative therapy that could revolutionize treatment for chronic diseases.",
                    source: { name: "MedToday" },
                    publishedAt: new Date().toISOString(),
                    urlToImage: null
                }
            ];
        }

        // Generate random engagement numbers
        function generateEngagement() {
            return {
                likes: Math.floor(Math.random() * 50000) + 1000,
                comments: Math.floor(Math.random() * 5000) + 100,
                shares: Math.floor(Math.random() * 2000) + 50
            };
        }

        // Format numbers for display
        function formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        }

        // Create news short HTML
        function createNewsShort(article, index) {
            const publishedDate = new Date(article.publishedAt).toLocaleDateString();
            const videoId = article.videoId;
            const engagement = generateEngagement();
            const channelInitials = article.source.name.substring(0, 2).toUpperCase();
            
            // Extract hashtags from title/description
            const hashtags = ['#breaking', '#news', '#trending', '#shorts'];
            const randomHashtags = hashtags.sort(() => 0.5 - Math.random()).slice(0, 3).join(' ');
            
            const audioParam = isAudioMuted ? 'mute=1' : 'mute=0';
            const autoplayParam = 'autoplay=0'; // Always start paused, we'll control play manually
            
            return `
                <div class="short-card" data-index="${index}">
                    <!-- Video Background -->
                    <div class="video-background">
                        ${videoId ? 
                            `<iframe class="video-iframe" 
                                src="https://www.youtube.com/embed/${videoId}?${autoplayParam}&${audioParam}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}&enablejsapi=1" 
                                allowfullscreen>
                            </iframe>` :
                            `<div class="video-placeholder">
                                <div class="icon"><i class="fas fa-play-circle"></i></div>
                                <div class="text">News Video Loading...</div>
                                <div class="subtext">Explore news experience</div>
                            </div>`
                        }
                    </div>

                    <!-- Video Play/Pause Overlay -->
                    <div class="video-overlay" onclick="toggleVideoPlayPause(${index})">
                        <button class="play-pause-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>

                    <!-- Video State Indicator -->
                    <div class="video-state">Paused</div>

                    <!-- Video Progress Bar -->
                    <div class="video-progress">
                        <div class="video-progress-bar" style="width: ${Math.random() * 100}%"></div>
                    </div>

                    <!-- Gradient Overlays -->
                    <div class="top-gradient"></div>
                    <div class="bottom-gradient"></div>

                    <!-- Right Side Action Buttons -->
                    <div class="action-buttons">
                        <!-- Like Button -->
                        <div style="position: relative;">
                            <button class="action-btn like" onclick="toggleLike(${index}, event)">
                                <i class="fas fa-heart"></i>
                            </button>
                            <div class="action-count">${formatNumber(engagement.likes)}</div>
                        </div>

                        <!-- Comment Button -->
                        <div style="position: relative;">
                            <button class="action-btn comment" onclick="openComments(${index})">
                                <i class="fas fa-comment"></i>
                            </button>
                            <div class="action-count">${formatNumber(engagement.comments)}</div>
                        </div>

                        <!-- Share Button -->
                        <div style="position: relative;">
                            <button class="action-btn share" onclick="shareShort(${index})">
                                <i class="fas fa-share"></i>
                            </button>
                            <div class="action-count">${formatNumber(engagement.shares)}</div>
                        </div>

                        <!-- Channel Avatar with Subscribe -->
                        <div class="channel-avatar" onclick="toggleSubscribe(${index})">
                            ${channelInitials}
                            <div class="subscribe-btn"><i class="fas fa-plus"></i></div>
                        </div>
                    </div>

                    <!-- Bottom Content Overlay -->
                    <div class="content-overlay">
                        <!-- Channel Info -->
                        <div class="channel-info">
                            <div class="channel-avatar-small">${channelInitials}</div>
                            <div class="channel-name">@${article.source.name.toLowerCase().replace(/\s+/g, '')}</div>
                            <button class="follow-btn" onclick="toggleFollow(${index})">Follow</button>
                        </div>

                        <!-- News Content -->
                        <div class="news-title">${article.title}</div>
                        <div class="news-description">
                            ${article.description || 'Breaking news update with all the latest developments.'}
                            <span class="hashtags">${randomHashtags}</span>
                        </div>

                        <!-- Audio Track Info -->
                        <div class="audio-track">
                            <div class="music-icon"><i class="fas fa-music"></i></div>
                            <div class="track-info">Original sound - ${article.source.name}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Display news
        function displayNews(articles) {
            const container = document.getElementById('shortsContainer');
            const newsHTML = articles.map((article, index) => createNewsShort(article, index)).join('');
            container.innerHTML = newsHTML;
            currentIndex = 0;
            previousIndex = -1;
            videoStates.clear();
            updateArrowStates();
        }

        // Append new news
        function appendNews(articles, startIndex) {
            const container = document.getElementById('shortsContainer');
            const newsHTML = articles.map((article, index) => createNewsShort(article, startIndex + index)).join('');
            container.insertAdjacentHTML('beforeend', newsHTML);
        }

        // Load and display news
        async function loadNews() {
            const loading = document.getElementById('loading');
            const container = document.getElementById('shortsContainer');
            
            loading.style.display = 'block';
            
            try {
                // Fetch news articles
                const articles = await fetchNews();
                newsData = articles;
                
                // Load videos for articles
                await loadVideosForArticles(articles);
                
                // Display news
                displayNews(articles);
                
                if (!isOnline) {
                    showAlert('Showing offline content', 'info');
                }
                
            } catch (error) {
                console.error('Error loading news:', error);
                container.innerHTML = `
                    <div class="short-card">
                        <div class="video-placeholder">
                            <div class="icon"><i class="fas fa-exclamation-triangle"></i></div>
                            <div class="text">Error loading news</div>
                            <div class="subtext">Please check your connection</div>
                        </div>
                    </div>
                `;
                showAlert('Failed to load news', 'error');
            } finally {
                loading.style.display = 'none';
                updateCacheInfo();
            }
        }

        // Initialize the app
        function init() {
            // Check if API keys are set
            if (NEWS_API_KEY === 'dcb071f269784ec280990d91a82ecc23' || YOUTUBE_API_KEY === 'AIzaSyDBKjt_vLZJhVqq7hpwXbvEgsOoD9NDu4A') {
                console.warn('⚠️ API keys not set. Using demo data.');
            }
            
            // Initialize network status
            updateCacheInfo();
            if (!isOnline) {
                showOfflineIndicator();
            }
            
            // Setup search
            setupSearch();
            
            // Load initial news
            loadNews();
            
            // Add smooth scrolling behavior and infinite scroll
            const container = document.getElementById('shortsContainer');
            let isScrolling = false;
            
            container.addEventListener('scroll', () => {
                if (!isScrolling) {
                    window.requestAnimationFrame(() => {
                        updateCurrentIndex(0);
                        checkInfiniteScroll();
                        isScrolling = false;
                    });
                }
                isScrolling = true;
            });

            // Show infinite scroll and pause feature info
            setTimeout(() => {
                showAlert('Videos auto-pause when scrolled! Tap to play/pause manually', 'info');
            }, 3000);
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', init);

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                scrollDown();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                scrollUp();
            } else if (e.key === 'm' || e.key === 'M') {
                e.preventDefault();
                toggleAudio();
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                toggleVideoPlayPause(currentIndex);
            }
        });

        // Add touch/swipe support for mobile
        let startY = 0;
        let endY = 0;

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            endY = e.changedTouches[0].clientY;
            const diff = startY - endY;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    // Swipe up - next video
                    scrollDown();
                } else {
                    // Swipe down - previous video
                    scrollUp();
                }
            }
        });

        // Listen for YouTube iframe API messages
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://www.youtube.com') return;
            
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'video-progress') {
                    // Update progress bar if needed
                    const progress = (data.info.currentTime / data.info.duration) * 100;
                    // Update progress bar for current video
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });

                          // Disable F12, Ctrl+U, and Ctrl+Shift+I
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
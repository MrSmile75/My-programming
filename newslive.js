/**
 * YouTube API Cache Manager
 * Compliant with YouTube ToS - 30-day cache limit
 */
class CacheManager {
    constructor() {
        this.CACHE_DURATION = {
            SEARCH_RESULTS: 24 * 60 * 60 * 1000, // 1 day
            VIDEO_METADATA: 7 * 24 * 60 * 60 * 1000, // 7 days
            CHANNEL_INFO: 30 * 24 * 60 * 60 * 1000, // 30 days
            PLAYLIST_INFO: 24 * 60 * 60 * 1000, // 1 day
        };

        this.CACHE_KEYS = {
            SEARCH: 'yt_search_',
            VIDEO: 'yt_video_',
            CHANNEL: 'yt_channel_',
            PLAYLIST: 'yt_playlist_',
        };

        this.init();
    }

    init() {
        // Clean expired cache on startup
        this.cleanExpiredCache();

        // Set up periodic cache cleaning (every hour)
        setInterval(() => {
            this.cleanExpiredCache();
        }, 60 * 60 * 1000);

        console.log('✅ Cache Manager initialized - YouTube ToS compliant');
    }

    cacheSearchResults(query, data) {
        const cacheKey = this.CACHE_KEYS.SEARCH + this.hashString(query);
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            expires: Date.now() + this.CACHE_DURATION.SEARCH_RESULTS,
            type: 'search',
            query: query,
        };

        try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`📦 Cached search results for: ${query}`);
        } catch (error) {
            console.warn('Cache storage failed:', error);
            this.clearOldestCache();
        }
    }

    getCachedSearchResults(query) {
        const cacheKey = this.CACHE_KEYS.SEARCH + this.hashString(query);

        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            if (Date.now() > cacheData.expires) {
                localStorage.removeItem(cacheKey);
                console.log(`🗑️ Expired cache removed for: ${query}`);
                return null;
            }

            console.log(`✅ Using cached search results for: ${query}`);
            return cacheData.data;
        } catch (error) {
            console.warn('Cache retrieval failed:', error);
            return null;
        }
    }

    cacheVideoMetadata(videoId, data) {
        const cacheKey = this.CACHE_KEYS.VIDEO + videoId;
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            expires: Date.now() + this.CACHE_DURATION.VIDEO_METADATA,
            type: 'video',
            videoId: videoId,
        };

        try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`📦 Cached video metadata for: ${videoId}`);
        } catch (error) {
            console.warn('Cache storage failed:', error);
            this.clearOldestCache();
        }
    }

    getCachedVideoMetadata(videoId) {
        const cacheKey = this.CACHE_KEYS.VIDEO + videoId;

        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            if (Date.now() > cacheData.expires) {
                localStorage.removeItem(cacheKey);
                console.log(`🗑️ Expired video cache removed for: ${videoId}`);
                return null;
            }

            console.log(`✅ Using cached video metadata for: ${videoId}`);
            return cacheData.data;
        } catch (error) {
            console.warn('Cache retrieval failed:', error);
            return null;
        }
    }

    cleanExpiredCache() {
        const now = Date.now();
        let cleanedCount = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && (key.startsWith('yt_search_') || key.startsWith('yt_video_') || 
                       key.startsWith('yt_channel_') || key.startsWith('yt_playlist_'))) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const cacheData = JSON.parse(cached);

                        if (now > cacheData.expires) {
                            localStorage.removeItem(key);
                            cleanedCount++;
                            i--;
                        }
                    }
                } catch (error) {
                    localStorage.removeItem(key);
                    cleanedCount++;
                    i--;
                }
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
        }
    }

    clearOldestCache() {
        const cacheEntries = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && (key.startsWith('yt_search_') || key.startsWith('yt_video_') || 
                       key.startsWith('yt_channel_') || key.startsWith('yt_playlist_'))) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const cacheData = JSON.parse(cached);
                        cacheEntries.push({
                            key: key,
                            timestamp: cacheData.timestamp,
                        });
                    }
                } catch (error) {
                    localStorage.removeItem(key);
                }
            }
        }

        cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

        const removeCount = Math.ceil(cacheEntries.length * 0.25);
        for (let i = 0; i < removeCount; i++) {
            localStorage.removeItem(cacheEntries[i].key);
        }

        console.log(`🧹 Cleared ${removeCount} oldest cache entries to free space`);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
}

/**
 * Google AdSense Integration Manager
 */
class AdsManager {
    constructor() {
        this.adFrequency = 3; // Show ad every 3 shorts
        this.isPremium = false;
        this.adBlockId = 'ca-pub-XXXXXXXXXX'; // Replace with your AdSense publisher ID
        this.adSlotId = '1234567890'; // Replace with your ad slot ID

        this.init();
    }

    init() {
        this.isPremium = localStorage.getItem('isPremium') === 'true';

        if (!this.isPremium) {
            this.initializeAdSense();
        }

        console.log('📢 Ads Manager initialized');
    }

    initializeAdSense() {
        window.adsbygoogle = window.adsbygoogle || [];
        console.log('📢 AdSense initialized');
    }

    shouldShowAd(index) {
        if (this.isPremium) {
            return false;
        }
        return index > 0 && index % this.adFrequency === 0;
    }

    createAdCard(index) {
        const adId = `ad-${Date.now()}-${index}`;

        return `
            <div class="ad-card" data-ad-index="${index}">
                <div class="ad-content">
                    <div class="ad-label">
                        <i class="fas fa-ad"></i> Advertisement
                    </div>
                    
                    <ins class="adsbygoogle"
                         style="display:block; min-height: 300px;"
                         data-ad-client="${this.adBlockId}"
                         data-ad-slot="${this.adSlotId}"
                         data-ad-format="auto"
                         data-full-width-responsive="true"
                         id="${adId}"></ins>
                         
                    
                    <div style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                        <p>Support Smile Xplorer by viewing ads <!-- <button onclick="showPremiumModal()" style="background: none; border: none; color: transparent; text-decoration: underline; cursor: pointer;">upgrade to Premium</button> -->  for a moment <!--for ad-free experience!--></p>
                    </div>
                </div>
            </div>
        `;
    }

    initializeAds() {
        if (this.isPremium) return;

        try {
            const adElements = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');

            adElements.forEach((adElement) => {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            });

            console.log(`📢 Initialized ${adElements.length} new ads`);
        } catch (error) {
            console.warn('Ad initialization failed:', error);
        }
    }

    insertAdsIntoShorts(shorts) {
        if (this.isPremium) {
            console.log('👑 Premium user - no ads inserted');
            return shorts;
        }

        const shortsWithAds = [];

        shorts.forEach((short, index) => {
            shortsWithAds.push(short);

            if (this.shouldShowAd(index + 1)) {
                shortsWithAds.push({
                    isAd: true,
                    adType: 'feed',
                    position: index + 1,
                    id: `ad-${Date.now()}-${index}`,
                });
            }
        });

        console.log(`📢 Inserted ${shortsWithAds.filter(item => item.isAd).length} ads into ${shorts.length} shorts`);
        return shortsWithAds;
    }

    updatePremiumStatus(isPremium) {
        this.isPremium = isPremium;

        if (isPremium) {
            this.hideAllAds();
            console.log('👑 Premium activated - ads hidden');
        } else {
            this.showAllAds();
            console.log('📢 Premium deactivated - ads shown');
        }
    }

    hideAllAds() {
        const adCards = document.querySelectorAll('.ad-card');
        adCards.forEach((ad) => {
            ad.style.display = 'none';
        });
    }

    showAllAds() {
        const adCards = document.querySelectorAll('.ad-card');
        adCards.forEach((ad) => {
            ad.style.display = 'flex';
        });
    }
}

// Initialize managers
const cacheManager = new CacheManager();
const adsManager = new AdsManager();

// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyDBKjt_vLZJhVqq7hpwXbvEgsOoD9NDu4A'; // Replace with your YouTube API key

// Application State
let currentShorts = [];
let currentIndex = 0;
let userPlaylists = JSON.parse(localStorage.getItem('userPlaylists')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || [];
let watchLater = JSON.parse(localStorage.getItem('watchLater')) || [];
let isPremium = false; // Will be set after checking premium status
let currentCategory = 'trending';

// YouTube Player API
let players = {};
let isYouTubeAPIReady = false;

// Premium Management Functions
function checkPremiumStatus() {
    const premiumData = JSON.parse(localStorage.getItem('premiumData'));
    
    if (!premiumData) {
        return false;
    }
    
    const now = Date.now();
    const expirationDate = new Date(premiumData.expirationDate).getTime();
    
    if (now > expirationDate) {
        // Premium has expired
        localStorage.removeItem('premiumData');
        localStorage.setItem('isPremium', 'false');
        showNotification('Your premium subscription has expired', 'info');
        return false;
    }
    
    // Premium is still active
    localStorage.setItem('isPremium', 'true');
    return true;
}

function activatePremium() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days from now
    
    const premiumData = {
        activationDate: new Date().toISOString(),
        expirationDate: expirationDate.toISOString()
    };
    
    localStorage.setItem('premiumData', JSON.stringify(premiumData));
    localStorage.setItem('isPremium', 'true');
    isPremium = true;
    
    // Update ads manager
    adsManager.updatePremiumStatus(true);
    
    // Update UI
    updatePremiumUI();
    
    showNotification('Premium activated for 30 days! 🎉', 'success');
}

function getRemainingPremiumDays() {
    const premiumData = JSON.parse(localStorage.getItem('premiumData'));
    
    if (!premiumData) {
        return 0;
    }
    
    const now = new Date();
    const expirationDate = new Date(premiumData.expirationDate);
    const remainingTime = expirationDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, remainingDays);
}

// Load YouTube IFrame API
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube API Ready Callback
function onYouTubeIframeAPIReady() {
    isYouTubeAPIReady = true;
    console.log('YouTube API Ready');
    loadInitialShorts();
}

// Enhanced fetch with caching
async function fetchYouTubeShorts(query = 'shorts', maxResults = 10) {
    try {
        // Check cache first
        const cachedResults = cacheManager.getCachedSearchResults(query);
        if (cachedResults) {
            showNotification('Loaded from cache (faster!)', 'info');
            return cachedResults;
        }

        const searchQuery = encodeURIComponent(`${query} #shorts`);
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoDuration=short&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch YouTube data');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const detailsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
            );

            const detailsData = await detailsResponse.json();

            const processedShorts = detailsData.items.map(video => ({
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                channelTitle: video.snippet.channelTitle,
                channelId: video.snippet.channelId,
                publishedAt: video.snippet.publishedAt,
                thumbnails: video.snippet.thumbnails,
                viewCount: video.statistics.viewCount || '0',
                likeCount: video.statistics.likeCount || '0',
                commentCount: video.statistics.commentCount || '0'
            }));

            // Cache the results
            cacheManager.cacheSearchResults(query, processedShorts);

            return processedShorts;
        }

        return [];
    } catch (error) {
        console.error('Error fetching YouTube shorts:', error);
        showNotification('Failed to load YouTube shorts. Using demo content.', 'warning');
        return getDemoShorts();
    }
}

// Fetch fresh YouTube shorts without filtering
async function fetchFreshYouTubeShorts(query = 'shorts', maxResults = 10) {
    try {
        const searchQuery = encodeURIComponent(`${query} #shorts`);
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoDuration=short&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch YouTube data');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const detailsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
            );

            const detailsData = await detailsResponse.json();

            const processedShorts = detailsData.items.map(video => ({
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                channelTitle: video.snippet.channelTitle,
                channelId: video.snippet.channelId,
                publishedAt: video.snippet.publishedAt,
                thumbnails: video.snippet.thumbnails,
                viewCount: video.statistics.viewCount || '0',
                likeCount: video.statistics.likeCount || '0',
                commentCount: video.statistics.commentCount || '0'
            }));

            // Cache the results
            cacheManager.cacheSearchResults(query, processedShorts);

            return processedShorts;
        }

        return [];
    } catch (error) {
        console.error('Error fetching YouTube shorts:', error);
        showNotification('Failed to load YouTube shorts. Using demo content.', 'warning');
        return getDemoShorts();
    }
}

// Demo shorts for fallback
function getDemoShorts() {
    return [
        {
            id: 'dQw4w9WgXcQ',
            title: 'Amazing Short Video #1',
            description: 'This is a demo short video for testing purposes.',
            channelTitle: 'Demo Channel',
            channelId: 'demo1',
            publishedAt: new Date().toISOString(),
            thumbnails: { medium: { url: 'https://picsum.photos/320/180?random=1' } },
            viewCount: '1234567',
            likeCount: '12345',
            commentCount: '567'
        },
        {
            id: 'jNQXAC9IVRw',
            title: 'Incredible Short Video #2',
            description: 'Another demo short video with amazing content.',
            channelTitle: 'Demo Channel 2',
            channelId: 'demo2',
            publishedAt: new Date().toISOString(),
            thumbnails: { medium: { url: 'https://picsum.photos/320/180?random=2' } },
            viewCount: '987654',
            likeCount: '9876',
            commentCount: '432'
        }
    ];
}

// Create YouTube Player
function createYouTubePlayer(containerId, videoId, index) {
    if (!isYouTubeAPIReady) {
        setTimeout(() => createYouTubePlayer(containerId, videoId, index), 100);
        return;
    }

    players[index] = new YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 1,
            fs: 1,
            cc_load_policy: 0,
            iv_load_policy: 3,
            autohide: 0,
            origin: window.location.origin
        },
        events: {
            onReady: (event) => {
                console.log(`Player ${index} ready`);
                if (index === currentIndex) {
                    setTimeout(() => {
                        event.target.playVideo();
                    }, 500);
                }
            },
            onStateChange: (event) => {
                handlePlayerStateChange(event, index);
            },
            onError: (event) => {
                console.error(`Player ${index} error:`, event.data);
                showNotification('Video playback error', 'error');
                handlePlayerError(index);
            }
        }
    });
}

// Handle player state changes
function handlePlayerStateChange(event, index) {
    const state = event.data;

    if (state === YT.PlayerState.PLAYING && currentShorts[index] && !currentShorts[index].isAd) {
        addToWatchHistory(currentShorts[index]);
    }

    if (state === YT.PlayerState.ENDED && index === currentIndex) {
        setTimeout(() => {
            navigateShort(1);
        }, 1000);
    }
}

// Handle player errors
function handlePlayerError(index) {
    if (players[index]) {
        try {
            players[index].destroy();
            delete players[index];
        } catch (e) {
            console.error('Error destroying player:', e);
        }
        
        // Recreate the player after a delay
        setTimeout(() => {
            if (currentShorts[index] && !currentShorts[index].isAd) {
                createYouTubePlayer(`player-${index}`, currentShorts[index].id, index);
            }
        }, 2000);
    }
}

// Create short card HTML
function createShortCard(short, index) {
    if (short.isAd) {
        return adsManager.createAdCard(index);
    }

    const isLiked = favorites.includes(short.id);
    const isInWatchLater = watchLater.includes(short.id);

    return `
        <div class="short-card" data-index="${index}" data-video-id="${short.id}">
            <div class="youtube-player-container">
                <div id="player-${index}"></div>
                <div class="youtube-branding">
                    <i class="fab fa-youtube"></i> YouTube
                </div>
            </div>
            
            <div class="video-info-overlay">
                <div class="channel-info">
                    <div class="channel-avatar">
                        ${short.channelTitle ? short.channelTitle.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div class="channel-details">
                        <div class="channel-name">@${short.channelTitle ? short.channelTitle.toLowerCase().replace(/\s+/g, '') : 'unknown'}</div>
                        <div class="video-stats">
                            ${formatNumber(short.viewCount)} views • ${formatTimeAgo(short.publishedAt)}
                        </div>
                    </div>
                    <button class="subscribe-btn" onclick="handleSubscribe('${short.channelId}', this)">
                        Subscribe
                    </button>
                </div>
                
                <div class="video-title">${short.title || 'Untitled Video'}</div>
                <div class="video-description">${short.description || 'No description available'}</div>
            </div>
            
            <div class="action-buttons">
                <div style="position: relative;">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleFavorite(${index})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="action-count">${formatNumber(short.likeCount)}</div>
                </div>
                
                <div style="position: relative;">
                    <button class="action-btn" onclick="openComments('${short.id}')">
                        <i class="fas fa-comment"></i>
                    </button>
                    <div class="action-count">${formatNumber(short.commentCount)}</div>
                </div>
                
                <div style="position: relative;">
                    <button class="action-btn" onclick="shareVideo('${short.id}')">
                        <i class="fas fa-share"></i>
                    </button>
                    <div class="action-count">Share</div>
                </div>
            </div>
        </div>
    `;
}

// Display shorts with ads
function displayShorts(shorts) {
    const shortsWithAds = adsManager.insertAdsIntoShorts(shorts);
    const container = document.getElementById('shortsContainer');
    const shortsHTML = shortsWithAds.map((short, index) => createShortCard(short, index)).join('');
    container.innerHTML = shortsHTML;

    // Create YouTube players for non-ad shorts
    shortsWithAds.forEach((short, index) => {
        if (!short.isAd) {
            setTimeout(() => {
                createYouTubePlayer(`player-${index}`, short.id, index);
            }, index * 100);
        }
    });

    // Initialize ads
    setTimeout(() => {
        adsManager.initializeAds();
    }, 1000);

    currentShorts = shortsWithAds;
    currentIndex = 0;
    updateNavigationButtons();
}

// Navigation functions
function navigateShort(direction) {
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= currentShorts.length) {
        if (direction > 0) {
            loadMoreShorts();
        }
        return;
    }

    if (players[currentIndex] && !currentShorts[currentIndex].isAd) {
        players[currentIndex].pauseVideo();
    }

    currentIndex = newIndex;

    const container = document.getElementById('shortsContainer');
    const targetCard = container.children[currentIndex];
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
        if (players[currentIndex] && !currentShorts[currentIndex].isAd) {
            players[currentIndex].playVideo();
        }
    }, 500);

    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = false;
    }
}

// Load more shorts
async function loadMoreShorts() {
    showNotification('Loading more shorts...', 'info');

    const moreShorts = await fetchYouTubeShorts(currentCategory, 5);
    const startIndex = currentShorts.length;

    const moreShortsWithAds = adsManager.insertAdsIntoShorts(moreShorts);
    currentShorts = [...currentShorts, ...moreShortsWithAds];

    const container = document.getElementById('shortsContainer');
    const newShortsHTML = moreShortsWithAds.map((short, index) =>
        createShortCard(short, startIndex + index)
    ).join('');
    container.insertAdjacentHTML('beforeend', newShortsHTML);

    moreShortsWithAds.forEach((short, index) => {
        if (!short.isAd) {
            setTimeout(() => {
                createYouTubePlayer(`player-${startIndex + index}`, short.id, startIndex + index);
            }, index * 100);
        }
    });

    setTimeout(() => {
        adsManager.initializeAds();
    }, 1000);

    showNotification(`Loaded ${moreShorts.length} more shorts!`, 'success');
}

// Category loading
async function loadCategory(category, event) {
    currentCategory = category;

    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    showNotification(`Loading ${category} shorts...`, 'info');

    const shorts = await fetchYouTubeShorts(category, 10);
    displayShorts(shorts);

    showNotification(`Loaded ${shorts.length} ${category} shorts!`, 'success');
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length > 2) {
            searchTimeout = setTimeout(() => {
                searchShorts(query);
            }, 500);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                searchShorts(query);
            }
        }
    });
}

async function searchShorts(query) {
    showNotification(`Searching for "${query}"...`, 'info');

    const shorts = await fetchYouTubeShorts(query, 10);
    displayShorts(shorts);

    showNotification(`Found ${shorts.length} results for "${query}"`, 'success');
}

// Favorites management
function toggleFavorite(index) {
    if (index < 0 || index >= currentShorts.length) return;
    
    const short = currentShorts[index];
    if (short.isAd) return;

    const isLiked = favorites.includes(short.id);

    if (isLiked) {
        favorites = favorites.filter(id => id !== short.id);
        showNotification('Removed from favorites', 'info');
    } else {
        favorites.push(short.id);
        showNotification('Added to favorites!', 'success');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    const button = document.querySelector(`.short-card[data-index="${index}"] .action-btn:first-child`);
    if (button) {
        button.classList.toggle('liked', !isLiked);
    }
}

function loadFavorites() {
    if (favorites.length === 0) {
        showNotification('No favorites yet. Like some shorts to see them here!', 'info');
        return;
    }

    showNotification('Loading your favorites...', 'info');
    showNotification(`You have ${favorites.length} favorite shorts!`, 'success');
}

// Watch Later management
function toggleWatchLater(index) {
    if (index < 0 || index >= currentShorts.length) return;
    
    const short = currentShorts[index];
    if (short.isAd) return;

    const isInWatchLater = watchLater.includes(short.id);

    if (isInWatchLater) {
        watchLater = watchLater.filter(id => id !== short.id);
        showNotification('Removed from Watch Later', 'info');
    } else {
        watchLater.push(short.id);
        showNotification('Added to Watch Later!', 'success');
    }

    localStorage.setItem('watchLater', JSON.stringify(watchLater));

    const button = document.querySelector(`.short-card[data-index="${index}"] .action-btn:nth-child(4)`);
    if (button) {
        button.classList.toggle('liked', !isInWatchLater);
    }
}

function loadWatchLater() {
    if (watchLater.length === 0) {
        showNotification('No videos in Watch Later. Add some to watch them later!', 'info');
        return;
    }

    showNotification('Loading Watch Later...', 'info');
    showNotification(`You have ${watchLater.length} videos to watch later!`, 'success');
}

// Watch History management
function addToWatchHistory(short) {
    if (short.isAd) return;

    watchHistory = watchHistory.filter(item => item.id !== short.id);

    watchHistory.unshift({
        ...short,
        watchedAt: new Date().toISOString()
    });

    watchHistory = watchHistory.slice(0, 100);

    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
}

function loadWatchHistory() {
    if (watchHistory.length === 0) {
        showNotification('No watch history yet. Start watching some shorts!', 'info');
        return;
    }

    showNotification('Loading watch history...', 'info');
    showNotification(`You've watched ${watchHistory.length} shorts!`, 'success');
}

// Playlist management
function loadPlaylists() {
    const playlistsList = document.getElementById('playlistsList');
    if (!playlistsList) return;

    if (userPlaylists.length === 0) {
        playlistsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem;">No playlists yet. Create your first playlist!</p>';
        return;
    }

    const playlistsHTML = userPlaylists.map(playlist => `
        <div class="playlist-item" onclick="loadPlaylist('${playlist.id}')">
            <div class="playlist-thumbnail">
                <i class="fas fa-play"></i>
            </div>
            <div class="playlist-info">
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-count">${playlist.videos.length} videos</div>
            </div>
        </div>
    `).join('');

    playlistsList.innerHTML = playlistsHTML;
}

function showCreatePlaylistModal() {
    // Check premium limits
    if (!isPremium && userPlaylists.length >= 3) {
        showNotification('Free users can create up to 3 playlists. Upgrade to Premium for unlimited playlists!', 'warning');
        showPremiumModal();
        return;
    }

    const modal = document.getElementById('createPlaylistModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCreatePlaylistModal() {
    const modal = document.getElementById('createPlaylistModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    const form = document.getElementById('createPlaylistForm');
    if (form) {
        form.reset();
    }
}

function createPlaylist(name, description) {
    const playlist = {
        id: Date.now().toString(),
        name: name,
        description: description,
        videos: [],
        createdAt: new Date().toISOString()
    };

    userPlaylists.push(playlist);
    localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));

    loadPlaylists();
    showNotification(`Playlist "${name}" created!`, 'success');
}

function showAddToPlaylistModal(index) {
    if (userPlaylists.length === 0) {
        showNotification('Create a playlist first!', 'warning');
        showCreatePlaylistModal();
        return;
    }

    const short = currentShorts[index];
    if (short.isAd) return;

    const playlist = userPlaylists[0];

    if (!playlist.videos.find(v => v.id === short.id)) {
        playlist.videos.push(short);
        localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
        showNotification(`Added to "${playlist.name}"!`, 'success');
        loadPlaylists();
    } else {
        showNotification('Already in playlist!', 'info');
    }
}

function loadPlaylist(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (playlist.videos.length === 0) {
        showNotification('This playlist is empty!', 'info');
        return;
    }

    displayShorts(playlist.videos);
    showNotification(`Loaded playlist: ${playlist.name}`, 'success');
}

// Social features
function handleSubscribe(channelId, button) {
    showNotification('Redirecting to YouTube to subscribe...', 'info');

    window.open(`https://www.youtube.com/channel/${channelId}`, '_blank');

    if (button) {
        button.textContent = 'Subscribed';
        button.classList.add('subscribed');
    }
}

function openComments(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    showNotification('Opening YouTube comments...', 'info');
}

function shareVideo(videoId) {
    const shareUrl = `https://www.youtube.com/watch?v=${videoId}`;

    if (navigator.share) {
        navigator.share({
            title: 'Check out this YouTube Short!',
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl);
        showNotification('YouTube link copied to clipboard!', 'success');
    }
}

// Premium features
function showPremiumModal() {
    const remainingDays = getRemainingPremiumDays();
    const premiumInfo = document.getElementById('premiumInfo');
    
    if (premiumInfo) {
        if (remainingDays > 0) {
            premiumInfo.innerHTML = `<p>Your premium subscription is active and will expire in ${remainingDays} days.</p>`;
        } else {
            premiumInfo.innerHTML = `<p>Upgrade to Premium for an ad-free experience and exclusive features!</p>`;
        }
    }
    
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closePremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function subscribeToPremium() {
    // Activate premium for 30 days
    activatePremium();
    
    closePremiumModal();
}

function updatePremiumUI() {
    const premiumBtn = document.getElementById('premiumBtn');
    const premiumBtnText = document.getElementById('premiumBtnText');

    if (premiumBtn && premiumBtnText) {
        const remainingDays = getRemainingPremiumDays();

        if (isPremium) {
            premiumBtn.classList.add('active');
            premiumBtnText.textContent = `Premium (${remainingDays}d)`;
            premiumBtn.innerHTML = `<i class="fas fa-crown"></i> <span>Premium (${remainingDays}d)</span>`;
            document.body.classList.add('premium-active');
        } else {
            premiumBtn.classList.remove('active');
            premiumBtnText.textContent = 'Go Premium';
            premiumBtn.innerHTML = `<i class="fas fa-crown"></i> <span>Go Premium</span>`;
            document.body.classList.remove('premium-active');
        }
    }
}

// Utility functions
function formatNumber(num) {
    if (!num) return '0';
    
    const number = parseInt(num);
    if (isNaN(number)) return '0';
    
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + 'm ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + 'h ago';
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + 'd ago';
    if (diffInSeconds < 31536000) return Math.floor(diffInSeconds / 2592000) + 'mo ago';
    return Math.floor(diffInSeconds / 31536000) + 'y ago';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Event listeners
function setupEventListeners() {
    setupSearch();

    const createPlaylistForm = document.getElementById('createPlaylistForm');
    if (createPlaylistForm) {
        createPlaylistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('playlistName').value.trim();
            const description = document.getElementById('playlistDescription').value.trim();

            if (name) {
                createPlaylist(name, description);
                closeCreatePlaylistModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            navigateShort(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateShort(-1);
        }
    });

    const container = document.getElementById('shortsContainer');
    if (!container) return;
    
    let scrollTimeout;
    let lastScrollTop = container.scrollTop;

    container.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollTop = container.scrollTop;
            const cardHeight = container.clientHeight;
            const newIndex = Math.round(scrollTop / cardHeight);

            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < currentShorts.length) {
                if (players[currentIndex] && !currentShorts[currentIndex].isAd) {
                    players[currentIndex].pauseVideo();
                }

                currentIndex = newIndex;

                setTimeout(() => {
                    if (players[currentIndex] && !currentShorts[currentIndex].isAd) {
                        players[currentIndex].playVideo();
                    }
                }, 500);

                updateNavigationButtons();
            }

            lastScrollTop = scrollTop;
        }, 100);
    });
}

// Initialize application
async function loadInitialShorts() {
    const shorts = await fetchYouTubeShorts('trending shorts', 10);
    displayShorts(shorts);

    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

function init() {
    // Check premium status first
    isPremium = checkPremiumStatus();
    
    loadYouTubeAPI();
    setupEventListeners();
    loadPlaylists();
    updatePremiumUI();

    // Update ads manager with current premium status
    adsManager.updatePremiumStatus(isPremium);

    // Set up daily check for premium expiration
    setInterval(() => {
        const wasPremium = isPremium;
        isPremium = checkPremiumStatus();
        
        if (wasPremium && !isPremium) {
            // Premium just expired
            updatePremiumUI();
            adsManager.updatePremiumStatus(false);
        } else if (isPremium) {
            // Premium is still active, update UI with remaining days
            updatePremiumUI();
        }
    }, 24 * 60 * 60 * 1000); // Check once per day

    setTimeout(() => {
        showNotification('Welcome to ShortsHub - Legal YouTube Shorts Experience! 🎉', 'success');
    }, 2000);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Make functions globally available for onclick handlers
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.loadCategory = loadCategory;
window.loadFavorites = loadFavorites;
window.loadWatchHistory = loadWatchHistory;
window.loadWatchLater = loadWatchLater;
window.showCreatePlaylistModal = showCreatePlaylistModal;
window.closeCreatePlaylistModal = closeCreatePlaylistModal;
window.showPremiumModal = showPremiumModal;
window.closePremiumModal = closePremiumModal;
window.subscribeToPremium = subscribeToPremium;
window.navigateShort = navigateShort;
window.toggleFavorite = toggleFavorite;
window.toggleWatchLater = toggleWatchLater;
window.handleSubscribe = handleSubscribe;
window.openComments = openComments;
window.shareVideo = shareVideo;
window.showAddToPlaylistModal = showAddToPlaylistModal;
window.loadPlaylist = loadPlaylist;

// Security measures to prevent inspection (optional)
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
    }
});

// Function to display the modal
function showPremiumModal() {
  const modal = document.getElementById('premiumModal');
  if (modal) {
      modal.style.display = 'flex';
  }
}

// Function to close the modal
function closePremiumModal() {
  const modal = document.getElementById('premiumModal');
  if (modal) {
      modal.style.display = 'none';
  }
}

console.log('🎬 ShortsHub - Legal YouTube Shorts Experience Loaded');
console.log('✅ Fully compliant with YouTube Terms of Service');
console.log('✅ All videos remain publicly accessible');
console.log('✅ Premium features enhance browsing experience only');
console.log('📦 Smart caching system active (30-day YouTube ToS compliant)');
console.log('📢 Ad system initialized (Premium users see no ads)');
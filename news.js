    /* © SMILEX - This code is licensed and protected. */
    class LocationTimeManager {
        constructor() {
            this.locationDisplay = document.getElementById('locationDisplay');
            this.timeDisplay = document.getElementById('timeDisplay');
            this.locationIcon = document.getElementById('locationIcon');

            this.initializeLocationAndTime();
            this.startTimerUpdate();
        }

        async initializeLocationAndTime() {
            try {
                // Geolocation
                const position = await this.getCurrentPosition();
                const { latitude, longitude } = position.coords;
                
                // Reverse Geocoding
                const locationData = await this.reverseGeocode(latitude, longitude);
                this.updateLocationDisplay(locationData);

                // Weather
                const weatherData = await this.fetchWeather(latitude, longitude);
                this.updateWeatherIcon(weatherData);
            } catch (error) {
                this.handleLocationError(error);
            }
        }

        getCurrentPosition() {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
        }

        async reverseGeocode(latitude, longitude) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                return {
                    city: data.address.city || data.address.town || data.address.village || 'Unknown',
                    country: data.address.country || 'Unknown',
                    latitude,
                    longitude
                };
            } catch (error) {
                console.error('Geocoding error:', error);
                return { city: 'Unknown', country: 'Unknown' };
            }
        }

        async fetchWeather(latitude, longitude) {
            const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with API key
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                return await response.json();
            } catch (error) {
                console.error('Weather fetch error:', error);
                return null;
            }
        }

        updateLocationDisplay(locationData) {
            this.locationDisplay.textContent = `${locationData.city}, ${locationData.country}`;
        }

        updateWeatherIcon(weatherData) {
            if (weatherData && weatherData.weather) {
                const weatherCondition = weatherData.weather[0].main.toLowerCase();
                const iconMap = {
                    'clear': '☀️',
                    'clouds': '☁️',
                    'rain': '🌧️',
                    'drizzle': '🌦️',
                    'thunderstorm': '⛈️',
                    'snow': '❄️'
                };
                this.locationIcon.textContent = iconMap[weatherCondition] || '🌍';
            }
        }

        handleLocationError(error) {
            console.warn('Location error:', error);
            this.locationDisplay.textContent = 'Location unavailable';
            this.locationIcon.textContent = '🌍';
        }

        startTimerUpdate() {
            const updateTime = () => {
                const now = new Date();
                const options = {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                };
                this.timeDisplay.textContent = now.toLocaleString(undefined, options);
            };

            updateTime(); // Initial call
            setInterval(updateTime, 1000); // Update every second
        }
    }

    // Search Functionality
    class NewsSearch {
        constructor() {
            this.searchInput = document.getElementById('searchInput');
            this.searchButton = document.getElementById('searchButton');

            this.setupEventListeners();
        }

        setupEventListeners() {
            this.searchButton.addEventListener('click', () => this.performSearch());
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        performSearch() {
            const query = this.searchInput.value.trim();
            if (query) {
                console.log('Searching for:', query);
                // Implement actual search logic here
            }
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        new LocationTimeManager();
        new NewsSearch();
    });


class NewsHub {
    constructor() {
        this.page = 1;
        this.isLoading = false;
        this.searchTerm = '';

        // DOM Elements
        this.newsContainer = document.getElementById('newsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.previewModal = document.getElementById('newsPreviewModal');
        this.previewContent = document.getElementById('previewContent');
        this.closePreviewBtn = document.getElementById('closePreviewBtn');

        this.initializeEventListeners();
        this.loadInitialNews();
        this.setupInfiniteScroll();
    }

        /* © SMILEX - This code is licensed and protected. */

    initializeEventListeners() {
        this.searchButton.addEventListener('click', () => this.searchNews());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchNews();
        });
        this.closePreviewBtn.addEventListener('click', () => this.closePreview());
    }

        /* © SMILEX - This code is licensed and protected. */

    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                this.loadMoreNews();
            }
        });
    }

        /* © SMILEX - This code is licensed and protected. */

    async loadInitialNews() {
        this.page = 1;
        await this.fetchNews();
    }

    async loadMoreNews() {
        if (!this.isLoading) {
            this.page++;
            await this.fetchNews(this.searchTerm);
        }
    }

        /* © SMILEX - This code is licensed and protected. */

    async searchNews() {
        this.searchTerm = this.searchInput.value;
        this.newsContainer.innerHTML = ''; // Clear previous results
        this.page = 1;
        await this.fetchNews(this.searchTerm);
    }

    async fetchNews(query = '') {
        this.isLoading = true;
        this.showLoadingSpinner();

            /* © SMILEX - This code is licensed and protected. */

        try {
            const apiKey = 'dcb071f269784ec280990d91a82ecc23'; // Replace with actual API key
            const url = `https://newsapi.org/v2/everything?q=${query || 'technology'}&page=${this.page}&pageSize=10&apiKey=${apiKey}`;

                /* © SMILEX - This code is licensed and protected. */
            
            const response = await fetch(url);
            const data = await response.json();

                /* © SMILEX - This code is licensed and protected. */

            this.displayNews(data.articles);
        } catch (error) {
            console.error('News fetch error:', error);
            this.showErrorMessage();
        } finally {
            this.isLoading = false;
            this.hideLoadingSpinner();
        }
    }

        /* © SMILEX - This code is licensed and protected. */

    displayNews(articles) {
        articles.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.className = 'col-md-4';
            newsCard.innerHTML = `
                <div class="card news-card h-100">
                    <img 
                        src="${article.urlToImage || 'https://via.placeholder.com/350x200'}" 
                        class="card-img-top" 
                        alt="${article.title}"
                    >
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.description?.substring(0, 100) || 'No description available'}...</p>
                        <button class="btn btn-primary preview-btn" data-url="${article.url}">Preview</button>
                    </div>
                </div>
            `;

                /* © SMILEX - This code is licensed and protected. */

            // Add preview event listener
            const previewBtn = newsCard.querySelector('.preview-btn');
            previewBtn.addEventListener('click', () => this.showPreview(article));

            this.newsContainer.appendChild(newsCard);
        });
    }

        /* © SMILEX - This code is licensed and protected. */

    showPreview(article) {
        this.previewContent.innerHTML = `
            <h2>${article.title}</h2>
            <img 
                src="${article.urlToImage || 'https://via.placeholder.com/800x400'}" 
                class="img-fluid mb-3"
            >
            <p><strong>Source:</strong> ${article.source.name}</p>
            <p><strong>Published:</strong> ${new Date(article.publishedAt).toLocaleString()}</p>
            <p>${article.content || article.description}</p>
            <a href="${article.url}" target="_blank" class="btn btn-primary">Read Article</a>
        `;
        this.previewModal.style.display = 'block';
    }

        /* © SMILEX - This code is licensed and protected. */

    closePreview() {
        this.previewModal.style.display = 'none';
    }

    showLoadingSpinner() {
        this.loadingSpinner.style.display = 'block';
    }

        /* © SMILEX - This code is licensed and protected. */

    hideLoadingSpinner() {
        this.loadingSpinner.style.display = 'none';
    }

        /* © SMILEX - This code is licensed and protected. */

    showErrorMessage() {
        this.newsContainer.innerHTML = `
            <div class="col-12 text-center">
                <h3>Unable to fetch news. Please try again later.</h3>
            </div>
        `;
    }
}

// Initialize the News Hub
document.addEventListener('DOMContentLoaded', () => {
    new NewsHub();
});


class AdvancedLiveManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.setupErrorHandling();
    }

    initializeElements() {
        this.liveTrigger = document.getElementById('liveTrigger');
        this.liveModal = document.getElementById('liveModal');
        this.liveOverlay = document.getElementById('liveOverlay');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.proceedBtn = document.getElementById('proceedBtn');
    }

    bindEvents() {
        // Safe event binding with error prevention
        this.safeAddEvent(this.liveTrigger, 'click', () => this.showLiveModal());
        this.safeAddEvent(this.cancelBtn, 'click', () => this.hideLiveModal());
        this.safeAddEvent(this.liveOverlay, 'click', () => this.hideLiveModal());
        this.safeAddEvent(this.proceedBtn, 'click', () => this.navigateToLive());
    }

    safeAddEvent(element, event, handler) {
        try {
            if (element) {
                element.addEventListener(event, handler);
            }
        } catch (error) {
            console.error(`Event binding error: ${error.message}`);
        }
    }

    showLiveModal() {
        try {
            this.liveModal.classList.add('show');
            this.liveOverlay.classList.add('show');
        } catch (error) {
            console.error('Modal display error', error);
        }
    }

    hideLiveModal() {
        try {
            this.liveModal.classList.remove('show');
            this.liveOverlay.classList.remove('show');
        } catch (error) {
            console.error('Modal hide error', error);
        }
    }

    navigateToLive() {
        try {
            // Implement your live page navigation
            window.location.href = 'newslive.html';
        } catch (error) {
            console.error('Navigation error', error);
            alert('Unable to navigate. Please try again.');
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Unhandled error:', event.error);
            // Optional: Send error to monitoring service
        });
    }
}

// Safe initialization with error boundary
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AdvancedLiveManager();
    } catch (initError) {
        console.error('Initialization failed', initError);
    }
});



class AnimatedScrollController {
    constructor() {
        // DOM Elements
        this.upBtn = document.getElementById('upScrollBtn');
        this.downBtn = document.getElementById('downScrollBtn');
        this.scrollIndicator = document.getElementById('scrollIndicator');

        // Scroll State
        this.isScrolling = false;
        this.scrollInterval = null;
        this.scrollSpeed = 0;

        // Animation Configuration
        this.animationConfig = {
            maxScrollSpeed: 30,
            acceleration: 0.5,
            particleCount: 10,
            particleLifespan: 1000
        };

        // Initialize
        this.initializeEventListeners();
        this.setupScrollTracking();
    }

    initializeEventListeners() {
        // Down Scroll
        this.downBtn.addEventListener('mousedown', this.startDownScroll.bind(this));
        this.downBtn.addEventListener('mouseup', this.stopScroll.bind(this));
        this.downBtn.addEventListener('mouseleave', this.stopScroll.bind(this));

        // Up Scroll
        this.upBtn.addEventListener('click', this.quickScrollToTop.bind(this));

        // Touch Support
        this.downBtn.addEventListener('touchstart', this.startDownScroll.bind(this));
        this.downBtn.addEventListener('touchend', this.stopScroll.bind(this));
    }

    startDownScroll(event) {
        event.preventDefault();
        this.stopScroll();
        this.isScrolling = true;
        this.scrollSpeed = 1;

        // Particle Animation
        this.createScrollParticles(this.downBtn);

        this.scrollInterval = setInterval(() => {
            // Accelerate scroll
            this.scrollSpeed = Math.min(
                this.scrollSpeed + this.animationConfig.acceleration, 
                this.animationConfig.maxScrollSpeed
            );

            // Scroll the page
            window.scrollBy({
                top: this.scrollSpeed,
                behavior: 'auto'
            });

            // Stop if reached bottom
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                this.stopScroll();
            }
        }, 20);
    }

    quickScrollToTop(event) {
        event.preventDefault();
        this.stopScroll();

        // Particle Animation
        this.createScrollParticles(this.upBtn);

        // Smooth scroll with animation
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    stopScroll() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.isScrolling = false;
            this.scrollSpeed = 0;
        }
    }

    setupScrollTracking() {
        window.addEventListener('scroll', this.updateScrollIndicator.bind(this));
    }

    updateScrollIndicator() {
        const scrollPercentage = 
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        this.scrollIndicator.style.width = `${scrollPercentage}%`;
    }

    createScrollParticles(sourceBtn) {
        for (let i = 0; i < this.animationConfig.particleCount; i++) {
            this.createParticle(sourceBtn);
        }
    }

    createParticle(sourceBtn) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Get button position
        const rect = sourceBtn.getBoundingClientRect();
        
        // Randomize particle properties
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Starting position (center of button)
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;

        // Random direction and speed
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Animate particle
        let x = 0, y = 0;
        let opacity = 1;

        const animateParticle = () => {
            x += vx;
            y += vy;
            opacity -= 0.02;

            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                document.body.removeChild(particle);
            }
        };

        document.body.appendChild(particle);
        animateParticle();
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    new AnimatedScrollController();
});


 class AdvancedNewsHeadlineBar {
        constructor() {
            this.API_KEY = 'dcb071f269784ec280990d91a82ecc23'; 
            this.BASE_URL = 'https://newsapi.org/v2/top-headlines';
            
            this.categories = [
                'general', 'business', 'technology', 
                'science', 'sports', 'entertainment'
            ];
            this.currentCategoryIndex = 0;

            // DOM Elements
            this.headlineContent = document.getElementById('headlineContent');
            this.refreshButton = document.getElementById('refreshButton');
            this.categoryToggleButton = document.getElementById('categoryToggle');
            this.timeDisplay = document.getElementById('currentTime');

            // Setup event listeners and initial setup
            this.setupEventListeners();
            this.updateTime();
            this.startTimerUpdate();
            this.fetchLatestHeadlines();
        }

        setupEventListeners() {
            this.refreshButton?.addEventListener('click', () => this.fetchLatestHeadlines());
            this.categoryToggleButton?.addEventListener('click', () => this.cycleCategory());
        }

        updateTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], {
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true
            });
            this.timeDisplay.textContent = timeString;
        }

        startTimerUpdate() {
            setInterval(() => this.updateTime(), 1000);
        }

        cycleCategory() {
            this.currentCategoryIndex = 
                (this.currentCategoryIndex + 1) % this.categories.length;
            this.fetchLatestHeadlines();
        }

        async fetchLatestHeadlines() {
            const currentCategory = this.categories[this.currentCategoryIndex];
            
            try {
                const response = await fetch(
                    `${this.BASE_URL}?country=us&category=${currentCategory}&apiKey=${this.API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Clear previous headlines
                this.headlineContent.innerHTML = '';

                // Process and display headlines
                data.articles.slice(0, 5).forEach(article => {
                    this.addHeadline({
                        category: currentCategory.toUpperCase(),
                        headline: article.title,
                        source: article.source.name,
                        url: article.url
                    });
                });
            } catch (error) {
                console.error('Error fetching headlines:', error);
                this.displayErrorMessage(error);
            }
        }

        addHeadline(headline) {
            const newHeadlineElement = document.createElement('span');
            newHeadlineElement.classList.add('headline-item');
            newHeadlineElement.innerHTML = `
                <span class="live-indicator"></span>
                <span class="headline-category">${headline.category}</span>
                ${headline.headline} 
                <small>(${headline.source})</small>
            `;
            
            // Add click event to open article
            newHeadlineElement.addEventListener('click', () => {
                window.open(headline.url, '_blank');
            });

            this.headlineContent.appendChild(newHeadlineElement);
        }

        displayErrorMessage(error) {
            const errorElement = document.createElement('div');
            errorElement.classList.add('error-message');
            errorElement.textContent = `Error: ${error.message}. Unable to fetch news.`;
            this.headlineContent.appendChild(errorElement);
        }

        // Periodic auto-refresh
        startAutoRefresh() {
            setInterval(() => {
                this.fetchLatestHeadlines();
            }, 5 * 60 * 1000); // Refresh every 5 minutes
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        const newsBar = new AdvancedNewsHeadlineBar();
        newsBar.startAutoRefresh();
    });




    /* © SMILEX - This code is licensed and protected. */
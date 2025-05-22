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
            const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
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

    /* © SMILEX - This code is licensed and protected. */
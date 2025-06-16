  class CinemaVerseApp {
            constructor() {
                // Configuration
                this.API_KEY = '48ea0449a84effd8baed92d45fa6175f'; // Replace with your actual API key
                this.BASE_URL = 'https://api.themoviedb.org/3';
                this.IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
                this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
                this.REQUEST_DELAY = 1000; // 1 second between requests
                
                // State management
                this.cache = new Map();
                this.lastRequestTime = 0;
                this.isLoading = false;
                this.currentPage = 1;
                
                // Initialize app
                this.init();
            }

            async init() {
                try {
                    await this.showPreloader();
                    this.setupEventListeners();
                    await this.loadTrendingMovies();
                    this.hidePreloader();
                    this.showCacheStatus('Data loaded successfully', 'success');
                } catch (error) {
                    this.handleError(error, 'Failed to initialize the application');
                }
            }

            showPreloader() {
                return new Promise((resolve) => {
                    const progressFill = document.getElementById('progress-fill');
                    const loadingStatus = document.getElementById('loading-status');
                    
                    const steps = [
                        { progress: 20, status: 'Connecting to servers...' },
                        { progress: 40, status: 'Loading movie database...' },
                        { progress: 60, status: 'Preparing recommendations...' },
                        { progress: 80, status: 'Optimizing experience...' },
                        { progress: 100, status: 'Ready to stream!' }
                    ];

                    let currentStep = 0;
                    const updateProgress = () => {
                        if (currentStep < steps.length) {
                            const step = steps[currentStep];
                            progressFill.style.width = `${step.progress}%`;
                            loadingStatus.textContent = step.status;
                            currentStep++;
                            setTimeout(updateProgress, 800);
                        } else {
                            setTimeout(resolve, 500);
                        }
                    };

                    updateProgress();
                });
            }

            hidePreloader() {
                const preloader = document.getElementById('preloader');
                const mainContent = document.getElementById('main-content');
                
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                    mainContent.style.display = 'block';
                    mainContent.classList.add('fade-in');
                }, 800);
            }

            setupEventListeners() {
                const searchInput = document.getElementById('search-input');
                const searchBtn = document.getElementById('search-btn');
                const retryBtn = document.getElementById('retry-btn');

                // Search functionality
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchMovies();
                    }
                });

                searchBtn.addEventListener('click', () => {
                    this.searchMovies();
                });

                // Retry functionality
                retryBtn.addEventListener('click', () => {
                    this.hideError();
                    this.init();
                });

                // Infinite scroll (optional)
                window.addEventListener('scroll', () => {
                    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                        this.loadMoreMovies();
                    }
                });
            }

            async makeAPIRequest(endpoint, useCache = true) {
                // Rate limiting
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                if (timeSinceLastRequest < this.REQUEST_DELAY) {
                    await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest));
                }

                // Check cache first
                if (useCache && this.cache.has(endpoint)) {
                    const cached = this.cache.get(endpoint);
                    if (now - cached.timestamp < this.CACHE_DURATION) {
                        this.showCacheStatus('Using cached data', 'success');
                        return cached.data;
                    }
                }

                try {
                    this.lastRequestTime = Date.now();
                    const response = await fetch(`${this.BASE_URL}${endpoint}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    
                    // Cache the response
                    this.cache.set(endpoint, {
                        data: data,
                        timestamp: now
                    });

                    this.showCacheStatus('Data cached successfully', 'success');
                    return data;

                } catch (error) {
                    // Try to use stale cache data if available
                    if (this.cache.has(endpoint)) {
                        this.showCacheStatus('Using offline data', 'warning');
                        return this.cache.get(endpoint).data;
                    }
                    throw error;
                }
            }

            async loadTrendingMovies() {
                if (this.isLoading) return;
                
                this.isLoading = true;
                this.showLoading();

                try {
                    const data = await this.makeAPIRequest(`/trending/movie/week?api_key=${this.API_KEY}&page=${this.currentPage}`);
                    this.renderMovies(data.results);
                } catch (error) {
                    this.handleError(error, 'Failed to load trending movies. Please try again later.');
                } finally {
                    this.isLoading = false;
                    this.hideLoading();
                }
            }

            async searchMovies() {
                const query = document.getElementById('search-input').value.trim();
                if (!query) return;

                if (this.isLoading) return;
                
                this.isLoading = true;
                this.showLoading();
                this.clearMovies();

                try {
                    const data = await this.makeAPIRequest(`/search/movie?api_key=${this.API_KEY}&query=${encodeURIComponent(query)}`);
                    
                    if (data.results.length === 0) {
                        this.showNoResults();
                    } else {
                        this.renderMovies(data.results);
                    }
                } catch (error) {
                    this.handleError(error, 'Failed to search movies. Please check your connection and try again.');
                } finally {
                    this.isLoading = false;
                    this.hideLoading();
                }
            }

            async loadMoreMovies() {
                if (this.isLoading) return;
                
                this.currentPage++;
                await this.loadTrendingMovies();
            }

            renderMovies(movies) {
                const movieGrid = document.getElementById('movie-grid');
                
                movies.forEach(movie => {
                    if (!movie.poster_path) return; // Skip movies without posters
                    
                    const movieCard = this.createMovieCard(movie);
                    movieGrid.appendChild(movieCard);
                });
            }

            createMovieCard(movie) {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card fade-in';
                
                const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
                const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
                
                movieCard.innerHTML = `
                    <img src="${this.IMG_BASE_URL}${movie.poster_path}" 
                         alt="${movie.title}" 
                         class="movie-poster"
                         loading="lazy">
                    <div class="movie-overlay">
                        <h3 class="movie-title">${movie.title}</h3>
                        <div class="movie-info">
                            <span class="movie-rating">★ ${rating}</span>
                            <span class="movie-year">${releaseYear}</span>
                        </div>
                        <div class="movie-actions">
                            <button class="action-btn preview-btn" onclick="cinemaApp.previewMovie(${movie.id})">
                                <i class="fas fa-play"></i> Preview
                            </button>
                            <button class="action-btn watch-btn" onclick="cinemaApp.watchFullMovie(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')">
                                <i class="fas fa-film"></i> Watch Full
                            </button>
                        </div>
                    </div>
                `;

                return movieCard;
            }

            async previewMovie(movieId) {
                try {
                    const data = await this.makeAPIRequest(`/movie/${movieId}/videos?api_key=${this.API_KEY}`);
                    const trailer = data.results.find(video => 
                        video.site === 'YouTube' && 
                        (video.type === 'Trailer' || video.type === 'Teaser')
                    );

                    if (trailer) {
                        // Open YouTube trailer in a new tab
                        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
                    } else {
                        this.showNotification('No trailer available for this movie', 'warning');
                    }
                } catch (error) {
                    this.showNotification('Failed to load movie trailer', 'error');
                }
            }

            watchFullMovie(movieId, movieTitle) {
                // Create a URL for the full movie page
                const movieUrl = `movie-player.html?id=${movieId}&title=${encodeURIComponent(movieTitle)}`;
                
                // Store movie data in localStorage for the next page
                localStorage.setItem('selectedMovie', JSON.stringify({
                    id: movieId,
                    title: movieTitle,
                    timestamp: Date.now()
                }));

                // Redirect to the movie player page
                window.location.href = 'watch.html';
            }

            showLoading() {
                document.getElementById('loading-container').style.display = 'flex';
            }

            hideLoading() {
                document.getElementById('loading-container').style.display = 'none';
            }

            clearMovies() {
                document.getElementById('movie-grid').innerHTML = '';
                this.currentPage = 1;
            }

            showNoResults() {
                const movieGrid = document.getElementById('movie-grid');
                movieGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                        <i class="fas fa-search" style="font-size: 60px; color: var(--text-secondary); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No movies found</h3>
                        <p style="color: var(--text-secondary);">Try searching with different keywords</p>
                    </div>
                `;
            }

            handleError(error, message) {
                console.error('CinemaVerse Error:', error);
                this.showError(message);
                this.hideLoading();
            }

            showError(message) {
                document.getElementById('error-message').textContent = message;
                document.getElementById('error-overlay').style.display = 'flex';
            }

            hideError() {
                document.getElementById('error-overlay').style.display = 'none';
            }

            showCacheStatus(message, type = 'success') {
                const indicator = document.getElementById('cache-indicator');
                indicator.textContent = message;
                indicator.className = `cache-indicator ${type}`;
                indicator.classList.add('show');
                
                setTimeout(() => {
                    indicator.classList.remove('show');
                }, 3000);
            }

            showNotification(message, type = 'info') {
                // Create a temporary notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: ${type === 'error' ? 'var(--error-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--success-color)'};
                    color: white;
                    padding: 15px 20px;
                    border-radius: var(--border-radius);
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                `;
                notification.textContent = message;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 4000);
            }
        }

        // Initialize the application
        const cinemaApp = new CinemaVerseApp();

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

        // Prevent right-click context menu (optional security measure)
        document.addEventListener('contextmenu', e => e.preventDefault());
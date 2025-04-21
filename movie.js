class AdvancedPreloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.mainContent = document.getElementById('main-content');
        this.progressBar = document.querySelector('.progress-bar');
        this.loadingDetails = document.querySelector('.loading-details');
        this.errorOverlay = document.getElementById('error-overlay');
        this.retryBtn = document.getElementById('retry-btn');

        this.loadingStages = [
            { text: 'Connecting to Servers', progress: 20 },
            { text: 'Loading Movie Database', progress: 40 },
            { text: 'Preparing Recommendations', progress: 60 },
            { text: 'Optimizing User Experience', progress: 80 },
            { text: 'Almost Ready', progress: 100 }
        ];

        this.init();
    }

    updateProgress(stage) {
        this.loadingDetails.textContent = stage.text;
        this.progressBar.style.width = `${stage.progress}%`;
    }

    simulateLoading() {
        return new Promise((resolve, reject) => {
            // Simulated network request
            const networkLatency = Math.random() * 1000 + 500;

            this.loadingStages.forEach((stage, index) => {
                setTimeout(() => {
                    this.updateProgress(stage);

                    // Simulate potential error
                    if (Math.random() < 0.05) {
                        reject(new Error('Network connection failed'));
                    }

                    if (index === this.loadingStages.length - 1) {
                        setTimeout(resolve, networkLatency);
                    }
                }, index * 800);
            });
        });
    }

    async initializeContent() {
        try {
            await this.simulateLoading();
            
            this.preloader.classList.add('fade-out');
            
            setTimeout(() => {
                this.preloader.style.display = 'none';
                this.mainContent.style.display = 'block';
            }, 700);
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        console.error('.', error);
        this.preloader.style.display = 'none';
        this.errorOverlay.style.display = 'flex';
    }

    init() {
        this.retryBtn.addEventListener('click', () => {
            this.errorOverlay.style.display = 'none';
            this.preloader.style.display = 'flex';
            this.initializeContent();
        });

        this.initializeContent();
    }
}

// Initialize preloader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedPreloader();
});
           
           
           // IMPORTANT: Replace with  actual TMDb API key
           const API_KEY = '48ea0449a84effd8baed92d45fa6175f';
           const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
           
           let currentPage = 10;
   
           // Fetch upcoming movies from TMDb API
           async function fetchMovies(action = 'initial') {
               // Adjust page number based on action
               if (action === 'next') currentPage++;
               else if (action === 'previous' && currentPage > 1) currentPage--;
   
               const loadingIndicator = document.getElementById('loadingIndicator');
               const movieContainer = document.getElementById('movieContainer');
   
               try {
                   // Show loading
                   loadingIndicator.style.display = 'block';
                   movieContainer.innerHTML = '';
   
                   // Fetch upcoming movies
                   const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${currentPage}`);
                   const data = await response.json();
   
                   // Hide loading
                   loadingIndicator.style.display = 'none';
   
                   // Render movies
                   data.results.forEach(movie => {
                       // Skip movies without poster
                       if (!movie.poster_path) return;
   
                       const movieCard = document.createElement('div');
                       movieCard.classList.add('movie-card');
                       
                       movieCard.innerHTML = `
                           <img src="${BASE_IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
                           <div class="movie-details">
                               <h3>${movie.title}</h3>
                               <p>Release: ${movie.release_date}</p>
                               <p>Rating: ${movie.vote_average.toFixed(1)}/10</p>
                           </div>
                       `;
   
                       // Add click event for more details (optional)
                       movieCard.addEventListener('click', () => showMovieDetails(movie));
   
                       movieContainer.appendChild(movieCard);
                   });
   
               } catch (error) {
                   console.error('Error fetching movies:', error);
                   loadingIndicator.textContent = 'Check internet connection. Please try again.';
               }
           }
   
           // Optional: Show movie details modal
           function showMovieDetails(movie) {
               // Create a modal or alert with more movie details
               alert(`
                   Title: ${movie.title}
                   Overview: ${movie.overview}
                   Release Date: ${movie.release_date}
                   Rating: ${movie.vote_average}/10
               `);
           }
   
           // Initial fetch when page loads
           fetchMovies();
   
   
           // Advanced Movie Application Class
           class CinemaVerseApp {
               constructor() {
                   this.API_KEY = '48ea0449a84effd8baed92d45fa6175f';
                   this.BASE_URL = 'https://api.themoviedb.org/3';
                   this.IMG_PATH = 'https://image.tmdb.org/t/p/w500';
                   this.MOVIE_SOURCES = {
                       // Mock movie sources (replace with actual streaming links)
                       'default': 'https://www.youtube.com/embed/',
                       'backup': 'https://player.vimeo.com/video/'
                   };
   
                   this.initEventListeners();
                   this.loadMovies('trending');
               }
   
               // Initialize Event Listeners
               initEventListeners() {
                   const searchInput = document.getElementById('search-input');
                   searchInput.addEventListener('keyup', (event) => {
                       if (event.key === 'Enter') {
                           this.searchMovies();
                       }
                   });
   
                   // Close movie player on clicking outside
                   document.getElementById('movie-player-modal').addEventListener('click', (e) => {
                       if (e.target === e.currentTarget) {
                           this.closeMoviePlayer();
                       }
                   });
               }
   
               // Show Loading Spinner
               showLoader() {
                   document.getElementById('loader').style.display = 'block';
               }
   
               // Hide Loading Spinner
               hideLoader() {
                   document.getElementById('loader').style.display = 'none';
               }
   
               // Load Movies
               async loadMovies(category = 'trending') {
                   this.showLoader();
                   const movieGrid = document.getElementById('movie-grid');
                   movieGrid.innerHTML = '';
   
                   try {
                       let endpoint = '';
                       switch(category) {
                           case 'trending':
                               endpoint = `/trending/movie/week?api_key=${this.API_KEY}`;
                               break;
                           case 'top_rated':
                               endpoint = `/movie/top_rated?api_key=${this.API_KEY}`;
                               break;
                           case 'upcoming':
                               endpoint = `/movie/upcoming?api_key=${this.API_KEY}`;
                               break;
                       }
   
                       const response = await fetch(`${this.BASE_URL}${endpoint}`);
                       const data = await response.json();
   
                       data.results.forEach(movie => {
                           const movieCard = document.createElement('div');
                           movieCard.classList.add('movie-card');
                           movieCard.innerHTML = `
                               <img src="${this.IMG_PATH}${movie.poster_path}" alt="${movie.title}">
                               <div class="movie-card-overlay">
                                   <div class="movie-card-info">
                                       <h3>${movie.title}</h3>
                                       <p>Rating: ${movie.vote_average}/10</p>
                                       <div class="movie-actions">
                                           <button onclick="cinemaVerse.playMovie(${movie.id}, '${movie.title}')">
                                               <i class="fas fa-play"></i> Preview
                                           </button>
                                       </div>
                                   </div>
                               </div>
                           `;
                           movieGrid.appendChild(movieCard);
                       });
                   } catch (error) {
                       console.error('Error loading movies:', error);
                       alert('Failed to load movies. Please try again.');
                   } finally {
                       this.hideLoader();
                   }
               }
   
               // Search Movies
               async searchMovies() {
                   const searchInput = document.getElementById('search-input');
                   const query = searchInput.value.trim();
   
                   if (query === '') return;
   
                   this.showLoader();
                   const movieGrid = document.getElementById('movie-grid');
                   movieGrid.innerHTML = '';
   
                   try {
                       const response = await fetch(`${this.BASE_URL}/search/movie?api_key=${this.API_KEY}&query=${query}`);
                       const data = await response.json();
   
                       if (data.results.length === 0) {
                           movieGrid.innerHTML = '<p>No movies found.</p>';
                           return;
                       }
   
                       data.results.forEach(movie => {
                           const movieCard = document.createElement('div');
                           movieCard.classList.add('movie-card');
                           movieCard.innerHTML = `
                               <img src="${this.IMG_PATH}${movie.poster_path}" alt="${movie.title}">
                               <div class="movie-card-overlay">
                                   <div class="movie-card-info">
                                       <h3>${movie.title}</h3>
                                       <p>Rating: ${movie.vote_average}/10</p>
                                       <div class="movie-actions">
                                           <button onclick="cinemaVerse.playMovie(${movie.id}, '${movie.title}')">
                                               <i class="fas fa-play"></i> Preview
                                           </button>
                                       </div>
                                   </div>
                               </div>
                           `;
                           movieGrid.appendChild(movieCard);
                       });
                   } catch (error) {
                       console.error('Search error:', error);
                       alert('Failed to search movies. Please try again.');
                   } finally {
                       this.hideLoader();
                   }
               }
   
               // Play Movie
               async playMovie(movieId, movieTitle) {
                   this.showLoader();
                   try {
                       // Fetch movie details to get trailer
                       const response = await fetch(`${this.BASE_URL}/movie/${movieId}/videos?api_key=${this.API_KEY}`);
                       const videoData = await response.json();
   
                       // Find YouTube trailer
                       const trailer = videoData.results.find(video => 
                           video.site === 'YouTube' && 
                           (video.type === 'Trailer' || video.type === 'Teaser')
                       );
   
                       if (trailer) {
                           const playerModal = document.getElementById('movie-player-modal');
                           const moviePlayer = document.getElementById('movie-player');
                           
                           // Set trailer source
                           moviePlayer.src = `${this.MOVIE_SOURCES.default}${trailer.key}?autoplay=1&mute=0`;
                           
                           // Show player modal
                           playerModal.style.display = 'flex';
                       } else {
                           alert('No trailer available for this movie.');
                       }
                   } catch (error) {
                       console.error('Error playing movie:', error);
                       alert('Failed to play movie trailer.');
                   } finally {
                       this.hideLoader();
                   }
               }
   
               // Close Movie Player
               closeMoviePlayer() {
                   const playerModal = document.getElementById('movie-player-modal');
                   const moviePlayer = document.getElementById('movie-player');
                   
                   playerModal.style.display = 'none';
                   moviePlayer.src = ''; // Reset source
               }
           }
   
           
   
           // Initialize the App
           const cinemaVerse = new CinemaVerseApp();
        /**
         * SmileX - TMDB Compliant Movie Platform
         * Enhanced for Full TMDB Terms of Service Compliance
         * Version 3.2 - Debugged Non-Intrusive Individual Movie Attribution
         */
        class SmileXApp {
            constructor() {
                // Configuration
                this.API_KEY = "48ea0449a84effd8baed92d45fa6175f"
                this.BASE_URL = "https://api.themoviedb.org/3"
                this.IMG_BASE_URL = "https://image.tmdb.org/t/p/w500"
                this.CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
                this.REQUEST_DELAY = 1000 // 1 second between requests

                // State management
                this.cache = new Map()
                this.lastRequestTime = 0
                this.isLoading = false
                this.currentPage = 1
                this.currentMovie = null
                this.isPremium = localStorage.getItem("isPremium") === "true"
                this.watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
                this.favorites = JSON.parse(localStorage.getItem("favorites")) || []
                this.reminders = JSON.parse(localStorage.getItem("reminders")) || []

                // Initialize app
                this.init()
            }

            async init() {
                try {
                    await this.showPreloader()
                    this.setupEventListeners()
                    this.updatePremiumUI()
                    this.initializeAds()
                    await this.loadTrendingMovies()
                    this.hidePreloader()
                    this.showNotification("Welcome to SmileX! 🎬 Powered by TMDB", "success")
                } catch (error) {
                    this.handleError(error, "Failed to initialize the application")
                }
            }

            showPreloader() {
                return new Promise((resolve) => {
                    const progressFill = document.getElementById("progress-fill")
                    const loadingStatus = document.getElementById("loading-status")

                    const steps = [
                        { progress: 20, status: "Connecting to TMDB API..." },
                        { progress: 40, status: "Loading movie database..." },
                        { progress: 60, status: "Preparing recommendations..." },
                        { progress: 80, status: "Optimizing experience..." },
                        { progress: 100, status: "Ready to discover movies!" },
                    ]

                    let currentStep = 0
                    const updateProgress = () => {
                        if (currentStep < steps.length) {
                            const step = steps[currentStep]
                            if (progressFill) progressFill.style.width = `${step.progress}%`
                            if (loadingStatus) loadingStatus.textContent = step.status
                            currentStep++
                            setTimeout(updateProgress, 800)
                        } else {
                            setTimeout(resolve, 500)
                        }
                    }

                    updateProgress()
                })
            }

            hidePreloader() {
                const preloader = document.getElementById("preloader")
                const mainContent = document.getElementById("main-content")

                if (preloader) {
                    preloader.classList.add("fade-out")
                    setTimeout(() => {
                        preloader.style.display = "none"
                        if (mainContent) {
                            mainContent.style.display = "block"
                            mainContent.classList.add("fade-in")
                        }
                    }, 800)
                }
            }

            setupEventListeners() {
                const searchInput = document.getElementById("search-input")
                const searchBtn = document.getElementById("search-btn")
                const retryBtn = document.getElementById("retry-btn")
                const watchMovieBtn = document.getElementById("watch-movie-btn")
                const watchNetflixBtn = document.getElementById("watch-netflix-btn")
                const watchAmazonBtn = document.getElementById("watch-amazon-btn")
                const watchHuluBtn = document.getElementById("watch-hulu-btn")
                const watchDisneyBtn = document.getElementById("watch-disney-btn")
                const premiumBtn = document.getElementById("premium-btn")

                // Search functionality
                if (searchInput) {
                    searchInput.addEventListener("keypress", (e) => {
                        if (e.key === "Enter") {
                            this.searchMovies()
                        }
                    })
                }

                if (searchBtn) {
                    searchBtn.addEventListener("click", () => {
                        this.searchMovies()
                    })
                }

                // Premium button
                if (premiumBtn) {
                    premiumBtn.addEventListener("click", () => {
                        this.showPremiumModal()
                    })
                }

                // Retry functionality
                if (retryBtn) {
                    retryBtn.addEventListener("click", () => {
                        this.hideError()
                        this.init()
                    })
                }

                // Watch movie button
                if (watchMovieBtn) {
                    watchMovieBtn.addEventListener("click", () => {
                        this.showWatchOptions()
                    })
                }

                // Watch options
                if (watchNetflixBtn) {
                    watchNetflixBtn.addEventListener("click", () => {
                        this.watchOnPlatform("netflix")
                    })
                }

                if (watchAmazonBtn) {
                    watchAmazonBtn.addEventListener("click", () => {
                        this.watchOnPlatform("amazon")
                    })
                }

                if (watchHuluBtn) {
                    watchHuluBtn.addEventListener("click", () => {
                        this.watchOnPlatform("hulu")
                    })
                }

                if (watchDisneyBtn) {
                    watchDisneyBtn.addEventListener("click", () => {
                        this.watchOnPlatform("disney")
                    })
                }

                // Close modals when clicking outside
                document.addEventListener("click", (e) => {
                    if (e.target.classList.contains("modal-overlay")) {
                        this.closeAllModals()
                    }
                })

                // Infinite scroll
                window.addEventListener("scroll", () => {
                    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                        this.loadMoreMovies()
                    }
                })
            }

            initializeAds() {
                if (this.isPremium) {
                    document.body.classList.add("premium-active")
                    return
                }

                // Initialize AdSense
                try {
                    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
                    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
                    console.log("📢 Ads initialized for free users")
                } catch (error) {
                    console.warn("Ad initialization failed:", error)
                }
            }

            updatePremiumUI() {
                const premiumBtn = document.getElementById("premium-btn")
                const premiumBtnText = document.getElementById("premium-btn-text")
                const watchlistSection = document.getElementById("watchlist-section")

                if (this.isPremium) {
                    if (premiumBtn) {
                        premiumBtn.classList.add("active")
                    }
                    if (premiumBtnText) {
                        premiumBtnText.textContent = "Premium Active"
                    }
                    document.body.classList.add("premium-active")

                    // Show premium features
                    if (watchlistSection) {
                        watchlistSection.style.display = "block"
                        this.loadWatchlist()
                    }
                }
            }

            showPremiumFeatures() {
                const aiSummarySection = document.getElementById("ai-summary-section")
                const reviewsSection = document.getElementById("reviews-section")

                if (aiSummarySection && this.currentMovie) {
                    aiSummarySection.innerHTML = `
                        <div class="premium-content">
                            <h3><i class="fas fa-robot"></i> AI Movie Summary</h3>
                            <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 10px;">
                                <p style="color: var(--text-secondary); line-height: 1.6;">
                                    ${this.generateAISummary(this.currentMovie)}
                                </p>
                            </div>
                        </div>
                    `
                }

                if (reviewsSection) {
                    reviewsSection.innerHTML = `
                        <div class="premium-content">
                            <h3><i class="fas fa-comment"></i> User Reviews</h3>
                            <div class="review-form">
                                <textarea class="review-textarea" placeholder="Write your review..." id="review-textarea"></textarea>
                                <button class="submit-review-btn" onclick="smileXApp.submitReview()">Submit Review</button>
                            </div>
                            <div class="sample-review">
                                <div class="reviewer">Premium User</div>
                                <div class="review-text">"Amazing cinematography and storyline! Highly recommended."</div>
                                <div class="rating">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>
                    `
                }
            }

            generateAISummary(movie) {
                // Simulate AI-generated summary based on TMDB data
                const genres = movie.genres ? movie.genres.map((g) => g.name).join(", ") : "Various genres"
                const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"

                return `This ${genres.toLowerCase()} film has received a ${rating}/10 rating from TMDB users. Based on the plot elements and viewer feedback, this movie offers ${this.getMovieInsight(movie)}. The film's themes and execution make it particularly appealing to fans of ${genres.toLowerCase()} cinema. Our AI recommends this for viewers who enjoyed similar titles in this genre.`
            }

            getMovieInsight(movie) {
                const insights = [
                    "compelling character development and engaging storytelling",
                    "stunning visual effects and memorable performances",
                    "thought-provoking themes and excellent direction",
                    "intense action sequences and emotional depth",
                    "brilliant cinematography and outstanding soundtrack",
                ]
                return insights[Math.floor(Math.random() * insights.length)]
            }

            async makeAPIRequest(endpoint, useCache = true) {
                // Rate limiting to respect TMDB API limits
                const now = Date.now()
                const timeSinceLastRequest = now - this.lastRequestTime
                if (timeSinceLastRequest < this.REQUEST_DELAY) {
                    await new Promise((resolve) => setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest))
                }

                // Check cache first
                if (useCache && this.cache.has(endpoint)) {
                    const cached = this.cache.get(endpoint)
                    if (now - cached.timestamp < this.CACHE_DURATION) {
                        return cached.data
                    }
                }

                try {
                    this.lastRequestTime = Date.now()
                    const response = await fetch(`${this.BASE_URL}${endpoint}`)

                    if (!response.ok) {
                        throw new Error(`TMDB API Error ${response.status}: ${response.statusText}`)
                    }

                    const data = await response.json()

                    // Cache the response
                    this.cache.set(endpoint, {
                        data: data,
                        timestamp: now,
                    })

                    return data
                } catch (error) {
                    // Try to use stale cache data if available
                    if (this.cache.has(endpoint)) {
                        console.warn("Using cached data due to API error:", error)
                        return this.cache.get(endpoint).data
                    }
                    throw error
                }
            }

            async loadTrendingMovies() {
                if (this.isLoading) return

                this.isLoading = true
                this.showLoading()

                try {
                    const data = await this.makeAPIRequest(`/trending/movie/week?api_key=${this.API_KEY}&page=${this.currentPage}`)
                    this.renderMovies(data.results)
                } catch (error) {
                    this.handleError(error, "Failed to load trending movies from TMDB. Please try again later.")
                } finally {
                    this.isLoading = false
                    this.hideLoading()
                }
            }

            async searchMovies() {
                const searchInput = document.getElementById("search-input")
                if (!searchInput) return

                const query = searchInput.value.trim()
                if (!query) return

                if (this.isLoading) return

                this.isLoading = true
                this.showLoading()
                this.clearMovies()

                try {
                    const data = await this.makeAPIRequest(`/search/movie?api_key=${this.API_KEY}&query=${encodeURIComponent(query)}`)

                    if (data.results.length === 0) {
                        this.showNoResults()
                    } else {
                        this.renderMovies(data.results)
                    }
                } catch (error) {
                    this.handleError(error, "Failed to search TMDB database. Please check your connection and try again.")
                } finally {
                    this.isLoading = false
                    this.hideLoading()
                }
            }

            async loadMoreMovies() {
                if (this.isLoading) return

                this.currentPage++
                await this.loadTrendingMovies()
            }

            renderMovies(movies) {
                const movieGrid = document.getElementById("movie-grid")
                if (!movieGrid) return

                movies.forEach((movie) => {
                    if (!movie.poster_path) return // Skip movies without posters

                    const movieCard = this.createMovieCard(movie)
                    movieGrid.appendChild(movieCard)
                })
            }

            createMovieCard(movie) {
                const movieCard = document.createElement("div")
                movieCard.className = "movie-card fade-in"

                const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
                const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
                const isFavorite = this.favorites.includes(movie.id)

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
                            <button class="action-btn preview-btn" onclick="smileXApp.previewMovie(${movie.id})">
                                <i class="fas fa-play"></i> Trailer
                            </button>
                            <button class="action-btn watch-btn" onclick="smileXApp.watchFullMovie(${movie.id})">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                            ${
                                this.isPremium
                                    ? `
                                <button class="action-btn favorite-btn ${isFavorite ? "active" : ""}" onclick="smileXApp.toggleMovieFavorite(${movie.id})">
                                    <i class="fas fa-heart"></i>
                                </button>
                            `
                                    : ""
                            }
                        </div>
                    </div>
                    <!-- CRITICAL: Non-Intrusive TMDB Attribution for each movie -->
                    <div class="tmdb-movie-attribution">
                        <a href="https://www.themoviedb.org/movie/${movie.id}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="tmdb-link"
                           onclick="event.stopPropagation();">
                            <img src="https://www.themoviedb.org/assets/2/v4/logos/stacked-blue-2c61b105ef7b58b68ccead4754a17f8d8c2348b07d.svg" 
                                 alt="TMDB Logo" 
                                 class="tmdb-logo-small">
                            TMDB
                        </a>
                    </div>
                `

                return movieCard
            }

            async previewMovie(movieId) {
                try {
                    const data = await this.makeAPIRequest(`/movie/${movieId}/videos?api_key=${this.API_KEY}`)
                    const trailer = data.results.find(
                        (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"),
                    )

                    if (trailer) {
                        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank")
                        this.showNotification("Opening trailer from TMDB data", "info")
                    } else {
                        this.showNotification("No trailer available for this movie", "warning")
                    }
                } catch (error) {
                    this.showNotification("Failed to load movie trailer", "error")
                }
            }

            async watchFullMovie(movieId) {
                try {
                    // Fetch movie details from TMDB
                    const movieData = await this.makeAPIRequest(`/movie/${movieId}?api_key=${this.API_KEY}`)
                    this.currentMovie = movieData

                    // Show movie details modal
                    this.showMovieModal(movieData)
                } catch (error) {
                    this.showNotification("Failed to load movie details from TMDB", "error")
                }
            }

            showMovieModal(movie) {
                const modal = document.getElementById("movie-modal")
                const title = document.getElementById("modal-movie-title")
                const poster = document.getElementById("modal-movie-poster")
                const meta = document.getElementById("modal-movie-meta")
                const description = document.getElementById("modal-movie-description")
                const favoriteBtn = document.getElementById("favorite-btn")

                if (!modal || !title || !poster || !meta || !description) return

                // Set movie title with TMDB attribution
                title.innerHTML = `
                    ${movie.title}
                    <a href="https://www.themoviedb.org/movie/${movie.id}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       style="margin-left: 15px; color: #01d277; text-decoration: none; font-size: 14px;">
                        <img src="https://www.themoviedb.org/assets/2/v4/logos/stacked-blue-2c61b105ef7b58b68ccead4754a17f8d8c2348b07d.svg" 
                             alt="TMDB Logo" 
                             style="height: 16px; vertical-align: middle; margin-right: 5px;">
                        View on TMDB
                    </a>
                `

                // Set movie poster
                poster.src = `${this.IMG_BASE_URL}${movie.poster_path}`
                poster.alt = movie.title

                // Set movie meta information (all from TMDB)
                const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
                const runtime = movie.runtime ? `${movie.runtime} min` : "N/A"
                const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
                const genres = movie.genres ? movie.genres.map((g) => g.name).join(", ") : "N/A"

                meta.innerHTML = `
                    <span class="meta-item"><i class="fas fa-calendar"></i> ${releaseYear}</span>
                    <span class="meta-item"><i class="fas fa-clock"></i> ${runtime}</span>
                    <span class="meta-item"><i class="fas fa-star"></i> ${rating}/10</span>
                    <span class="meta-item"><i class="fas fa-tags"></i> ${genres}</span>
                `

                // Set movie description (from TMDB)
                description.innerHTML = `
                    <p>${movie.overview || "No description available for this movie."}</p>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(1, 210, 119, 0.1); border-radius: 8px; border: 1px solid rgba(1, 210, 119, 0.3);">
                        <small style="color: var(--text-secondary);">
                            <img src="https://www.themoviedb.org/assets/2/v4/logos/stacked-blue-2c61b105ef7b58b68ccead4754a17f8d8c2348b07d.svg" 
                                 alt="TMDB Logo" 
                                 style="height: 14px; vertical-align: middle; margin-right: 5px;">
                            Movie data provided by The Movie Database (TMDB)
                        </small>
                    </div>
                `

                // Update favorite button (Premium feature)
                const isFavorite = this.favorites.includes(movie.id)
                if (favoriteBtn) {
                    favoriteBtn.classList.toggle("active", isFavorite)
                    favoriteBtn.style.display = this.isPremium ? "block" : "none"
                }

                // Show premium features if user is premium
                if (this.isPremium) {
                    this.showPremiumFeatures()
                }

                // Show modal
                modal.classList.add("show")
            }

            showWatchOptions() {
                // Hide movie details modal
                const movieModal = document.getElementById("movie-modal")
                if (movieModal) {
                    movieModal.classList.remove("show")
                }

                // Show watch options modal
                const watchOptionsModal = document.getElementById("watch-options-modal")
                if (watchOptionsModal) {
                    watchOptionsModal.classList.add("show")
                }
            }

            watchOnPlatform(platform) {
                if (this.currentMovie) {
                    let url = ""
                    const movieTitle = encodeURIComponent(this.currentMovie.title)

                    switch (platform) {
                        case "netflix":
                            url = `https://www.netflix.com/search?q=${movieTitle}`
                            break
                        case "amazon":
                            url = `https://www.amazon.com/s?k=${movieTitle}&i=instant-video`
                            break
                        case "hulu":
                            url = `https://www.hulu.com/search?q=${movieTitle}`
                            break
                        case "disney":
                            url = `https://www.disneyplus.com/search?q=${movieTitle}`
                            break
                    }

                    window.open(url, "_blank")
                    this.closeAllModals()
                    this.showNotification(`Searching for "${this.currentMovie.title}" on ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`, "info")
                }
            }

            // Premium Features
            toggleFavorite() {
                if (!this.isPremium) {
                    this.showNotification("Favorites are a Premium feature!", "warning")
                    this.showPremiumModal()
                    return
                }

                if (!this.currentMovie) return

                const movieId = this.currentMovie.id
                const isFavorite = this.favorites.includes(movieId)

                if (isFavorite) {
                    this.favorites = this.favorites.filter((id) => id !== movieId)
                    this.showNotification("Removed from favorites", "info")
                } else {
                    this.favorites.push(movieId)
                    this.showNotification("Added to favorites!", "success")
                }

                localStorage.setItem("favorites", JSON.stringify(this.favorites))

                // Update UI
                const favoriteBtn = document.getElementById("favorite-btn")
                if (favoriteBtn) {
                    favoriteBtn.classList.toggle("active", !isFavorite)
                }

                this.loadWatchlist()
            }

            toggleMovieFavorite(movieId) {
                if (!this.isPremium) {
                    this.showNotification("Favorites are a Premium feature!", "warning")
                    this.showPremiumModal()
                    return
                }

                const isFavorite = this.favorites.includes(movieId)

                if (isFavorite) {
                    this.favorites = this.favorites.filter((id) => id !== movieId)
                    this.showNotification("Removed from favorites", "info")
                } else {
                    this.favorites.push(movieId)
                    this.showNotification("Added to favorites!", "success")
                }

                localStorage.setItem("favorites", JSON.stringify(this.favorites))

                // Update all favorite buttons for this movie
                const favoriteButtons = document.querySelectorAll(`[onclick="smileXApp.toggleMovieFavorite(${movieId})"]`)
                favoriteButtons.forEach((btn) => {
                    btn.classList.toggle("active", !isFavorite)
                })

                this.loadWatchlist()
            }

            setReminder() {
                if (!this.isPremium) {
                    this.showNotification("Movie reminders are a Premium feature!", "warning")
                    this.showPremiumModal()
                    return
                }

                if (!this.currentMovie) return

                const movieId = this.currentMovie.id
                const hasReminder = this.reminders.includes(movieId)

                if (hasReminder) {
                    this.reminders = this.reminders.filter((id) => id !== movieId)
                    this.showNotification("Reminder removed", "info")
                } else {
                    this.reminders.push(movieId)
                    this.showNotification("Reminder set! We'll notify you about this movie.", "success")
                }

                localStorage.setItem("reminders", JSON.stringify(this.reminders))

                // Update reminder button
                const reminderBtn = document.getElementById("reminder-btn")
                if (reminderBtn) {
                    reminderBtn.classList.toggle("active", !hasReminder)
                }
            }

            submitReview() {
                if (!this.isPremium) {
                    this.showNotification("Reviews are a Premium feature!", "warning")
                    this.showPremiumModal()
                    return
                }

                const reviewTextarea = document.getElementById("review-textarea")
                if (reviewTextarea && reviewTextarea.value.trim()) {
                    reviewTextarea.value = ""
                    this.showNotification("Review submitted! Thank you for your feedback.", "success")
                } else {
                    this.showNotification("Please write a review before submitting.", "warning")
                }
            }

            async loadWatchlist() {
                if (!this.isPremium || this.favorites.length === 0) return

                const watchlistGrid = document.getElementById("watchlist-grid")
                if (!watchlistGrid) return

                watchlistGrid.innerHTML = ""

                try {
                    for (const movieId of this.favorites.slice(0, 6)) {
                        // Show first 6 favorites
                        const movieData = await this.makeAPIRequest(`/movie/${movieId}?api_key=${this.API_KEY}`)
                        const movieCard = this.createMovieCard(movieData)
                        watchlistGrid.appendChild(movieCard)
                    }
                } catch (error) {
                    console.warn("Failed to load watchlist:", error)
                }
            }

            showPremiumModal() {
                const premiumModal = document.getElementById("premium-modal")
                if (premiumModal) {
                    premiumModal.classList.add("show")
                }
            }

            subscribeToPremium() {
                // Simulate premium subscription
                this.isPremium = true
                localStorage.setItem("isPremium", "true")

                this.closeAllModals()
                this.showNotification("Welcome to SmileX Premium! 🎉 Enjoy ad-free browsing!", "success")

                // Update UI for premium features
                this.updatePremiumUI()

                // Hide ads
                document.body.classList.add("premium-active")

                // Reload current movie modal if open
                if (this.currentMovie) {
                    this.showMovieModal(this.currentMovie)
                }
            }

            closeAllModals() {
                const modals = ["movie-modal", "watch-options-modal", "premium-modal"]
                modals.forEach((modalId) => {
                    const modal = document.getElementById(modalId)
                    if (modal) {
                        modal.classList.remove("show")
                    }
                })
            }

            showLoading() {
                const loadingContainer = document.getElementById("loading-container")
                if (loadingContainer) {
                    loadingContainer.style.display = "flex"
                }
            }

            hideLoading() {
                const loadingContainer = document.getElementById("loading-container")
                if (loadingContainer) {
                    loadingContainer.style.display = "none"
                }
            }

            clearMovies() {
                const movieGrid = document.getElementById("movie-grid")
                if (movieGrid) {
                    movieGrid.innerHTML = ""
                }
                this.currentPage = 1
            }

            showNoResults() {
                const movieGrid = document.getElementById("movie-grid")
                if (movieGrid) {
                    movieGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                            <i class="fas fa-search" style="font-size: 60px; color: var(--text-secondary); margin-bottom: 20px;"></i>
                            <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No movies found</h3>
                            <p style="color: var(--text-secondary);">Try searching with different keywords</p>
                        </div>
                    `
                }
            }

            handleError(error, message) {
                console.error("SmileX Error:", error)
                this.showError(message)
                this.hideLoading()
            }

            showError(message) {
                const errorMessage = document.getElementById("error-message")
                const errorOverlay = document.getElementById("error-overlay")

                if (errorMessage) {
                    errorMessage.textContent = message
                }
                if (errorOverlay) {
                    errorOverlay.style.display = "flex"
                }
            }

            hideError() {
                const errorOverlay = document.getElementById("error-overlay")
                if (errorOverlay) {
                    errorOverlay.style.display = "none"
                }
            }

            showNotification(message, type = "info") {
                const notification = document.getElementById("notification")
                if (notification) {
                    notification.textContent = message
                    notification.className = `notification ${type} show`

                    setTimeout(() => {
                        notification.classList.remove("show")
                    }, 4000)
                }
            }
        }

        // Global function to close modals
        function closeModal(modalId) {
            const modal = document.getElementById(modalId)
            if (modal) {
                modal.classList.remove("show")
            }
        }

        // Global function to show premium modal
        function showPremiumModal() {
            if (window.smileXApp) {
                window.smileXApp.showPremiumModal()
            }
        }

        // Global function to subscribe to premium
        function subscribeToPremium() {
            if (window.smileXApp) {
                window.smileXApp.subscribeToPremium()
            }
        }

        // Global function to toggle favorite
        function toggleFavorite() {
            if (window.smileXApp) {
                window.smileXApp.toggleFavorite()
            }
        }

        // Global function to set reminder
        function setReminder() {
            if (window.smileXApp) {
                window.smileXApp.setReminder()
            }
        }

        // Initialize the application when DOM is loaded
        document.addEventListener("DOMContentLoaded", () => {
            // Initialize the application
            window.smileXApp = new SmileXApp()

            // Security measures
            document.addEventListener("keydown", (e) => {
                if (
                    e.key === "F12" ||
                    (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
                    (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i"))
                ) {
                    e.preventDefault()
                }
            })

            document.addEventListener("contextmenu", (e) => e.preventDefault())

            // Detect DevTools
            let devtoolsOpen = false
            setInterval(() => {
                const width = window.outerWidth - window.innerWidth > 100
                const height = window.outerHeight - window.innerHeight > 100
                if ((width || height) && !devtoolsOpen) {
                    devtoolsOpen = true
                }
                if (!(width || height) && devtoolsOpen) {
                    devtoolsOpen = false
                }
            }, 1000)

            console.log("🎬 SmileX - TMDB Compliant Movie Platform Loaded")
            console.log("✅ Fully compliant with TMDB Terms of Service")
            console.log("✅ Non-intrusive individual movie TMDB attribution")
            console.log("✅ Proper TMDB attribution displayed prominently")
            console.log("✅ Premium features add value beyond TMDB data")
            console.log("✅ All TMDB data remains freely accessible")
            console.log("✅ Clear labeling for external platform searches")
            console.log("📢 Ad system active for free users")
            console.log("👑 Premium features: Watchlists, Reviews, AI Summaries, Ad-free")
        })
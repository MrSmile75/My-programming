        class SmileXGamingHub {
            constructor() {
                this.initializeProperties();
                this.setupEventListeners();
                this.loadUserData();
                this.loadInitialGames();
                this.setupDailyReset();
            }

            initializeProperties() {
                // Core properties
                this.page = 1;
                this.currentGenre = 'action';
                this.isLoading = false;
                this.currentGame = null;
                this.gameTimer = null;
                this.gameStartTime = null;
                this.gameTimeLimit = null;
                this.searchQuery = '';

                // API Configuration - RAWG API
                this.apiKey = 'e8a2d63c9df84ddbbdbde50f0163b1a1';
                this.baseUrl = 'https://api.rawg.io/api';
                this.requestCount = 0;
                this.maxRequestsPerMinute = 20;
                this.requestQueue = [];

                // User Data
                this.userData = {
                    isPremium: false,
                    sessionsRemaining: 3,
                    lastReset: new Date().toDateString(),
                    gameProgress: {},
                    cachedGames: {},
                    lastCacheUpdate: null,
                    totalPlayTime: 0
                };

                // DOM Elements
                this.initializeDOMElements();
            }

            initializeDOMElements() {
                this.gamesContainer = document.getElementById('gamesContainer');
                this.searchInput = document.getElementById('searchInput');
                this.searchButton = document.getElementById('searchButton');
                this.genreButtons = document.querySelectorAll('.genre-btn');
                this.loadingOverlay = document.getElementById('loadingOverlay');
                this.previewModal = document.getElementById('gamePreviewModal');
                this.previewContent = document.getElementById('previewContent');
                this.closePreviewBtn = document.getElementById('closePreviewBtn');
                this.playGameBtn = document.getElementById('playGameBtn');
                this.playOptionsModal = document.getElementById('playOptionsModal');
                this.play2HoursBtn = document.getElementById('play2HoursBtn');
                this.playUnlimitedBtn = document.getElementById('playUnlimitedBtn');
                this.cancelPlayBtn = document.getElementById('cancelPlayBtn');
                this.gameTimerElement = document.getElementById('gameTimer');
                this.timerDisplay = document.getElementById('timerDisplay');
                this.statusBar = document.getElementById('statusBar');
                this.statusText = document.getElementById('statusText');
                this.premiumBtn = document.getElementById('premiumBtn');
                this.upgradeBtn = document.getElementById('upgradeBtn');
                this.errorContainer = document.getElementById('errorContainer');
                this.cacheStatus = document.getElementById('cacheStatus');
                this.cacheText = document.getElementById('cacheText');
                this.mainContent = document.getElementById('mainContent');
                this.premiumContent = document.getElementById('premiumContent');
                this.scrollTopBtn = document.getElementById('scrollTopBtn');
            }

            setupEventListeners() {
                // Search functionality
                this.searchButton.addEventListener('click', () => this.performSearch());
                this.searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.performSearch();
                });

                // Real-time search
                this.searchInput.addEventListener('input', () => {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        if (this.searchInput.value.trim()) {
                            this.performSearch();
                        }
                    }, 500);
                });

                // Genre filters
                this.genreButtons.forEach(btn => {
                    btn.addEventListener('click', () => this.selectGenre(btn));
                });

                // Modal controls
                this.closePreviewBtn.addEventListener('click', () => this.closePreview());
                this.playGameBtn.addEventListener('click', () => this.showPlayOptions());
                this.cancelPlayBtn.addEventListener('click', () => this.hidePlayOptions());

                // Play options
                this.play2HoursBtn.addEventListener('click', () => this.startGame(2));
                this.playUnlimitedBtn.addEventListener('click', () => this.startGame(0));

                // Premium controls
                this.premiumBtn.addEventListener('click', () => this.showPremiumPage());
                this.upgradeBtn.addEventListener('click', () => this.showPremiumPage());

                // Infinite scroll
                window.addEventListener('scroll', () => this.handleScroll());

                // Scroll to top
                this.scrollTopBtn.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });

                window.addEventListener('scroll', () => {
                    if (window.pageYOffset > 300) {
                        this.scrollTopBtn.style.display = 'block';
                    } else {
                        this.scrollTopBtn.style.display = 'none';
                    }
                });
            }

            // User Data Management
            loadUserData() {
                const saved = localStorage.getItem('smileXGamingData');
                if (saved) {
                    this.userData = { ...this.userData, ...JSON.parse(saved) };
                }
                this.updateStatusDisplay();
                this.checkDailyReset();
                this.updateCacheStatus();
            }

            saveUserData() {
                localStorage.setItem('smileXGamingData', JSON.stringify(this.userData));
                this.updateCacheStatus();
            }

            checkDailyReset() {
                const today = new Date().toDateString();
                if (this.userData.lastReset !== today && !this.userData.isPremium) {
                    this.userData.sessionsRemaining = 3;
                    this.userData.lastReset = today;
                    this.saveUserData();
                    this.updateStatusDisplay();
                    this.showNotification('Daily gaming sessions reset! You have 3 new sessions.', 'success');
                }
            }

            setupDailyReset() {
                setInterval(() => this.checkDailyReset(), 60000);
            }

            updateStatusDisplay() {
                if (this.userData.isPremium) {
                    this.statusBar.className = 'status-bar premium';
                    this.statusText.innerHTML = '<i class="fas fa-crown me-2"></i>Premium User - Unlimited Gaming Power!';
                    this.upgradeBtn.style.display = 'none';
                } else {
                    this.statusBar.className = 'status-bar';
                    this.statusText.innerHTML = `<i class="fas fa-user me-2"></i>Free User: ${this.userData.sessionsRemaining} gaming sessions remaining today`;
                    this.upgradeBtn.style.display = 'inline-block';
                }
            }

            updateCacheStatus() {
                const cacheCount = Object.keys(this.userData.cachedGames).length;
                this.cacheText.textContent = `Cache: ${cacheCount} games stored`;
            }

            // API Rate Limiting and Caching
            async makeAPIRequest(url) {
                return new Promise((resolve, reject) => {
                    const now = Date.now();
                    
                    this.requestQueue = this.requestQueue.filter(time => now - time < 60000);
                    
                    if (this.requestQueue.length >= this.maxRequestsPerMinute) {
                        setTimeout(() => this.makeAPIRequest(url).then(resolve).catch(reject), 3000);
                        return;
                    }

                    this.requestQueue.push(now);
                    
                    fetch(url)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP ${response.status}`);
                            return response.json();
                        })
                        .then(resolve)
                        .catch(reject);
                });
            }

            getCachedData(key) {
                const cached = this.userData.cachedGames[key];
                if (cached && Date.now() - cached.timestamp < 600000) { // 10 minutes cache
                    return cached.data;
                }
                return null;
            }

            setCachedData(key, data) {
                // Limit cache size
                const cacheKeys = Object.keys(this.userData.cachedGames);
                if (cacheKeys.length >= 100) {
                    const oldestKey = cacheKeys.reduce((oldest, key) => 
                        this.userData.cachedGames[key].timestamp < this.userData.cachedGames[oldest].timestamp ? key : oldest
                    );
                    delete this.userData.cachedGames[oldestKey];
                }

                this.userData.cachedGames[key] = {
                    data: data,
                    timestamp: Date.now()
                };
                this.saveUserData();
            }

            // Game Loading
            async loadInitialGames() {
                this.gamesContainer.innerHTML = '';
                this.page = 1;
                await this.fetchGames();
            }

            async fetchGames() {
                if (this.isLoading) return;
                
                this.isLoading = true;
                this.showLoadingOverlay();
                this.clearErrorMessage();

                const cacheKey = this.searchQuery ? 
                    `search_${this.searchQuery}_${this.page}` : 
                    `${this.currentGenre}_${this.page}`;
                
                const cachedData = this.getCachedData(cacheKey);

                if (cachedData) {
                    this.displayGames(cachedData, true);
                    this.isLoading = false;
                    this.hideLoadingOverlay();
                    return;
                }

                try {
                    let url;
                    if (this.searchQuery) {
                        url = `${this.baseUrl}/games?key=${this.apiKey}&search=${encodeURIComponent(this.searchQuery)}&page=${this.page}&page_size=12`;
                    } else {
                        url = `${this.baseUrl}/games?key=${this.apiKey}&genres=${this.currentGenre}&page=${this.page}&page_size=12`;
                    }
                    
                    const data = await this.makeAPIRequest(url);
                    
                    this.setCachedData(cacheKey, data.results);
                    this.displayGames(data.results, false);
                    
                    if (this.searchQuery) {
                        this.showNotification(`Found ${data.results.length} games for "${this.searchQuery}"`, 'success');
                    }
                } catch (error) {
                    console.error('Games fetch error:', error);
                    this.showErrorMessage('Unable to load games. Please check your connection and try again.');
                } finally {
                    this.isLoading = false;
                    this.hideLoadingOverlay();
                }
            }

            displayGames(games, fromCache = false) {
                games.forEach(game => {
                    const gameCard = this.createGameCard(game, fromCache);
                    this.gamesContainer.appendChild(gameCard);
                });
            }

            createGameCard(game, fromCache = false) {
                const gameCard = document.createElement('div');
                gameCard.className = 'col-lg-4 col-md-6 col-sm-12';
                
                const progress = this.userData.gameProgress[game.id] || 0;
                const rating = game.rating ? parseFloat(game.rating).toFixed(1) : 'N/A';
                
                gameCard.innerHTML = `
                    <div class="card game-card h-100 text-white">
                        ${fromCache ? '<div class="cached-badge"><i class="fas fa-database me-1"></i>Cached</div>' : ''}
                        <img 
                            src="${game.background_image || '/placeholder.svg?height=280&width=400'}" 
                            class="card-img-top game-card-img" 
                            alt="${game.name}"
                            onerror="this.src='/placeholder.svg?height=280&width=400'"
                        >
                        <span class="platform-badge">
                            <i class="fas fa-desktop me-1"></i>
                            ${game.platforms ? game.platforms[0]?.platform.name || 'PC' : 'Multi-Platform'}
                        </span>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${this.truncateText(game.name, 45)}</h5>
                            <p class="card-text flex-grow-1">${this.truncateText(game.description_raw || 'An amazing gaming experience awaits! Dive into this incredible world of adventure and excitement.', 120)}</p>
                            
                            ${progress > 0 ? `
                                <div class="progress-container">
                                    <div class="progress-bar" style="width: ${progress}%"></div>
                                </div>
                                <small class="text-muted mb-2">Progress: ${progress}%</small>
                            ` : ''}
                            
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    <span class="badge bg-primary me-2">
                                        <i class="fas fa-star me-1"></i>${rating}
                                    </span>
                                    ${game.metacritic ? `<span class="badge bg-success">MC: ${game.metacritic}</span>` : ''}
                                </div>
                                <button class="btn btn-outline-light preview-btn">
                                    <i class="fas fa-eye me-1"></i>Preview
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                const previewBtn = gameCard.querySelector('.preview-btn');
                previewBtn.addEventListener('click', () => this.showPreview(game));

                return gameCard;
            }

            async showPreview(game) {
                this.currentGame = game;
                
                let detailedGame = game;
                try {
                    const detailCacheKey = `detail_${game.id}`;
                    const cachedDetail = this.getCachedData(detailCacheKey);
                    
                    if (cachedDetail) {
                        detailedGame = cachedDetail;
                    } else {
                        const url = `${this.baseUrl}/games/${game.id}?key=${this.apiKey}`;
                        detailedGame = await this.makeAPIRequest(url);
                        this.setCachedData(detailCacheKey, detailedGame);
                    }
                } catch (error) {
                    console.warn('Could not fetch detailed game info:', error);
                }

                const progress = this.userData.gameProgress[game.id] || 0;
                const rating = detailedGame.rating ? parseFloat(detailedGame.rating).toFixed(1) : 'N/A';

                this.previewContent.innerHTML = `
                    <div class="row">
                        <div class="col-md-8">
                            <img 
                                src="${detailedGame.background_image || '/placeholder.svg?height=400&width=700'}" 
                                class="img-fluid rounded mb-4"
                                alt="${detailedGame.name}"
                                style="width: 100%; height: 400px; object-fit: cover;"
                                onerror="this.src='/placeholder.svg?height=400&width=700'"
                            >
                        </div>
                        <div class="col-md-4">
                            <h2 class="mb-3">${detailedGame.name}</h2>
                            <div class="mb-4">
                                <span class="badge bg-primary me-2 p-2">
                                    <i class="fas fa-star me-1"></i>Rating: ${rating}
                                </span>
                                ${detailedGame.metacritic ? `
                                    <span class="badge bg-success p-2">
                                        <i class="fas fa-trophy me-1"></i>Metacritic: ${detailedGame.metacritic}
                                    </span>
                                ` : ''}
                            </div>
                            
                            ${progress > 0 ? `
                                <div class="mb-4">
                                    <h6><i class="fas fa-chart-line me-2"></i>Your Progress</h6>
                                    <div class="progress-container">
                                        <div class="progress-bar" style="width: ${progress}%"></div>
                                    </div>
                                    <small class="text-muted">${progress}% Complete</small>
                                </div>
                            ` : ''}
                            
                            <h6><i class="fas fa-gamepad me-2"></i>Available Platforms</h6>
                            <div class="mb-4">
                                ${detailedGame.platforms ? detailedGame.platforms.slice(0, 4).map(p => 
                                    `<span class="badge bg-secondary me-1 mb-2 p-2">${p.platform.name}</span>`
                                ).join('') : '<span class="badge bg-secondary p-2">Multi-Platform</span>'}
                            </div>
                            
                            ${detailedGame.genres ? `
                                <h6><i class="fas fa-tags me-2"></i>Game Genres</h6>
                                <div class="mb-4">
                                    ${detailedGame.genres.slice(0, 4).map(g => 
                                        `<span class="badge bg-info me-1 mb-2 p-2">${g.name}</span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="mt-4">
                        <h4><i class="fas fa-info-circle me-2"></i>About This Game</h4>
                        <p class="lead">${detailedGame.description_raw || detailedGame.description || 'Embark on an incredible gaming adventure! This game offers hours of entertainment with stunning graphics, engaging gameplay, and immersive storytelling that will keep you coming back for more. Experience cutting-edge gaming technology and join millions of players worldwide in this epic journey.'}</p>
                        
                        <div class="row mt-4">
                            ${detailedGame.released ? `
                                <div class="col-md-6">
                                    <p><strong><i class="fas fa-calendar me-2"></i>Release Date:</strong> ${new Date(detailedGame.released).toLocaleDateString()}</p>
                                </div>
                            ` : ''}
                            
                            ${detailedGame.developers && detailedGame.developers.length > 0 ? `
                                <div class="col-md-6">
                                    <p><strong><i class="fas fa-code me-2"></i>Developer:</strong> ${detailedGame.developers[0].name}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
                
                this.previewModal.style.display = 'block';
            }

            showPlayOptions() {
                if (!this.userData.isPremium && this.userData.sessionsRemaining <= 0) {
                    this.showNotification('No gaming sessions remaining today! Upgrade to Premium for unlimited gaming.', 'warning');
                    return;
                }
                
                this.previewModal.style.display = 'none';
                this.playOptionsModal.style.display = 'flex';
            }

            hidePlayOptions() {
                this.playOptionsModal.style.display = 'none';
                this.previewModal.style.display = 'block';
            }

            startGame(hours) {
                if (!this.userData.isPremium) {
                    if (hours === 0) {
                        this.showNotification('Unlimited gaming is a Premium feature! Upgrade now for endless fun.', 'warning');
                        return;
                    }
                    
                    if (this.userData.sessionsRemaining <= 0) {
                        this.showNotification('No gaming sessions remaining today! Come back tomorrow or upgrade to Premium.', 'warning');
                        return;
                    }
                    
                    this.userData.sessionsRemaining--;
                    this.saveUserData();
                    this.updateStatusDisplay();
                }

                this.playOptionsModal.style.display = 'none';
                this.previewModal.style.display = 'none';
                
                if (hours > 0) {
                    this.startGameTimer(hours);
                }
                
                const message = hours > 0 ? 
                    `🎮 Starting ${this.currentGame.name}! You have ${hours} hours of gaming time. Enjoy!` :
                    `🎮 Starting ${this.currentGame.name}! Enjoy unlimited gaming with Premium!`;
                
                this.showNotification(message, 'success');
                this.simulateGameProgress();
            }

            startGameTimer(hours) {
                this.gameTimeLimit = hours * 60 * 60;
                this.gameStartTime = Date.now();
                this.gameTimerElement.style.display = 'block';
                
                this.gameTimerInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
                    const remaining = this.gameTimeLimit - elapsed;
                    
                    if (remaining <= 0) {
                        this.endGame();
                        return;
                    }
                    
                    const hours = Math.floor(remaining / 3600);
                    const minutes = Math.floor((remaining % 3600) / 60);
                    const seconds = remaining % 60;
                    
                    this.timerDisplay.textContent = 
                        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    // Warning when 5 minutes left
                    if (remaining === 300) {
                        this.showNotification('⏰ 5 minutes remaining in your gaming session!', 'warning');
                    }
                }, 1000);
            }

            endGame() {
                if (this.gameTimerInterval) {
                    clearInterval(this.gameTimerInterval);
                    this.gameTimerInterval = null;
                }
                
                this.gameTimerElement.style.display = 'none';
                this.showNotification('🎮 Gaming session completed! Your progress has been saved. Thanks for playing!', 'info');
                
                if (this.currentGame) {
                    const currentProgress = this.userData.gameProgress[this.currentGame.id] || 0;
                    this.userData.gameProgress[this.currentGame.id] = Math.min(100, currentProgress + Math.random() * 25 + 10);
                    this.userData.totalPlayTime += 2;
                    this.saveUserData();
                }
            }

            simulateGameProgress() {
                if (!this.currentGame) return;
                
                const progressInterval = setInterval(() => {
                    if (!this.gameTimerInterval && this.gameTimeLimit) {
                        clearInterval(progressInterval);
                        return;
                    }
                    
                    const currentProgress = this.userData.gameProgress[this.currentGame.id] || 0;
                    if (currentProgress < 100) {
                        this.userData.gameProgress[this.currentGame.id] = Math.min(100, currentProgress + Math.random() * 8 + 2);
                        this.saveUserData();
                    }
                }, 15000);
            }

            // Search Functionality
            performSearch() {
                const searchTerm = this.searchInput.value.trim();
                if (!searchTerm) {
                    this.showNotification('Please enter a game name to search', 'warning');
                    return;
                }
                
                this.searchQuery = searchTerm;
                this.currentGenre = '';
                this.gamesContainer.innerHTML = '';
                this.page = 1;
                
                // Update genre buttons
                this.genreButtons.forEach(btn => btn.classList.remove('active'));
                
                this.fetchGames();
            }

            // Genre Selection
            selectGenre(btn) {
                this.genreButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentGenre = btn.dataset.genre;
                this.searchQuery = '';
                this.searchInput.value = '';
                this.loadInitialGames();
                this.showNotification(`Loading ${btn.textContent.trim()} games...`, 'info');
            }

            // Premium Management
            showPremiumPage() {
                this.mainContent.style.display = 'none';
                this.premiumContent.style.display = 'block';
                window.scrollTo(0, 0);
            }

            showMainPage() {
                this.mainContent.style.display = 'block';
                this.premiumContent.style.display = 'none';
                window.scrollTo(0, 0);
            }

            // Utility Methods
            truncateText(text, length) {
                if (!text) return '';
                return text.length > length ? text.substring(0, length) + '...' : text;
            }

            showLoadingOverlay() {
                this.loadingOverlay.style.display = 'flex';
            }

            hideLoadingOverlay() {
                this.loadingOverlay.style.display = 'none';
            }

            showErrorMessage(message) {
                this.errorContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle me-3"></i>
                        <strong>Oops!</strong> ${message}
                        <button class="btn btn-light ms-3" onclick="location.reload()">
                            <i class="fas fa-redo me-2"></i>Retry
                        </button>
                    </div>
                `;
            }

            clearErrorMessage() {
                this.errorContainer.innerHTML = '';
            }

            closePreview() {
                this.previewModal.style.display = 'none';
            }

            handleScroll() {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                    if (!this.isLoading && (this.currentGenre || this.searchQuery)) {
                        this.page++;
                        this.fetchGames();
                    }
                }
            }

            showNotification(message, type = 'info') {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} me-3"></i>
                    ${message}
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideInRight 0.4s ease reverse';
                    setTimeout(() => notification.remove(), 400);
                }, 4000);
            }
        }

        // Global functions for premium activation
        function activatePremium() {
            if (window.gamingHub) {
                window.gamingHub.userData.isPremium = true;
                window.gamingHub.saveUserData();
                window.gamingHub.updateStatusDisplay();
                window.gamingHub.showNotification('🎉 Welcome to Premium! You now have unlimited gaming access!', 'success');
                window.gamingHub.showMainPage();
            }
        }

        function showMainPage() {
            if (window.gamingHub) {
                window.gamingHub.showMainPage();
            }
        }

        // Initialize the SmileX Gaming Hub
        document.addEventListener('DOMContentLoaded', () => {
            window.gamingHub = new SmileXGamingHub();
        });

          // Prevent right-click (optional)
        document.addEventListener('contextmenu', e => e.preventDefault());
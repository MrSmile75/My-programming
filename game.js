class GameHubPro {
    constructor() {
        this.apiKey = 'e8a2d63c9df84ddbbdbde50f0163b1a1';
        this.baseUrl = 'https://api.rawg.io/api';
        this.currentGenre = 'action';
        this.currentGame = null;
        this.page = 1;
        this.isLoading = false;
        
        this.userData = this.loadUserData();
        this.gameCache = new Map();
        this.cacheTimeout = 10 * 60 * 1000;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.updateUI();
        this.loadGames();
        this.generateRecommendations();
        this.setupScrollToTop();
        
        setInterval(() => this.clearExpiredCache(), 60000);
        this.trackActivity('App Initialized', 'User started GameHub Pro');
        
        // Check premium status on initialization
        this.checkPremiumExpiry();
    }

    loadUserData() {
        const defaultData = {
            isPremium: false,
            premiumExpiry: null,
            favorites: [],
            collections: [],
            notes: {},
            ratings: {},
            playHistory: [],
            preferences: {
                genres: ['action', 'adventure'],
                platforms: []
            },
            stats: {
                totalGames: 0,
                totalHours: 0
            }
        };

        try {
            const saved = localStorage.getItem('gameHubProData');
            const parsedData = saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
            
            // Check if premium has expired
            if (parsedData.isPremium && parsedData.premiumExpiry) {
                const now = new Date();
                const expiryDate = new Date(parsedData.premiumExpiry);
                
                if (now > expiryDate) {
                    // Premium has expired
                    parsedData.isPremium = false;
                    parsedData.premiumExpiry = null;
                    
                    // Save the updated data
                    localStorage.setItem('gameHubProData', JSON.stringify(parsedData));
                }
            }
            
            return parsedData;
        } catch (error) {
            console.error('Error loading user data:', error);
            return defaultData;
        }
    }

    checkPremiumExpiry() {
        if (this.userData.isPremium && this.userData.premiumExpiry) {
            const now = new Date();
            const expiryDate = new Date(this.userData.premiumExpiry);
            
            if (now > expiryDate) {
                // Premium has expired
                this.userData.isPremium = false;
                this.userData.premiumExpiry = null;
                this.saveUserData();
                this.updateUI();
                this.showNotification('Your premium subscription has expired.', 'info');
            }
        }
    }

    setupScrollEffects() {
        let ticking = false;
        
        const updateScrollEffects = () => {
            const scrolled = window.pageYOffset;
            const navbar = document.getElementById('mainNavbar');
            
            if (scrolled > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
    }

    saveUserData() {
        try {
            localStorage.setItem('gameHubProData', JSON.stringify(this.userData));
            this.updateStats();
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchGames());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchGames();
            });

            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.trim().length > 2) {
                        this.searchGames();
                    } else if (e.target.value.trim().length === 0) {
                        this.loadGames();
                    }
                }, 500);
            });
        }

        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentGenre = e.target.dataset.genre;
                this.page = 1;
                this.loadGames();
                this.trackActivity('Genre Selected', `User selected ${this.currentGenre} genre`);
            });
        });

        const favoriteModalBtn = document.getElementById('favoriteModalBtn');
        const addToCollectionBtn = document.getElementById('addToCollectionBtn');
        
        if (favoriteModalBtn) {
            favoriteModalBtn.addEventListener('click', () => this.toggleFavorite());
        }
        if (addToCollectionBtn) {
            addToCollectionBtn.addEventListener('click', () => this.showCollectionSelector());
        }

        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                const homeSection = document.getElementById('homeSection');
                if (!this.isLoading && homeSection && homeSection.style.display !== 'none') {
                    this.page++;
                    this.loadGames(true);
                }
            }
        });
    }

    setupScrollToTop() {
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollTopBtn.style.display = 'block';
                } else {
                    scrollTopBtn.style.display = 'none';
                }
            });

            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    async loadGames(append = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const container = document.getElementById('gamesContainer');
        
        if (!container) {
            this.isLoading = false;
            return;
        }
        
        if (!append) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <h4>Loading Games...</h4>
                        <p class="text-muted">Discovering the best games for you</p>
                    </div>
                </div>
            `;
        }

        try {
            const cacheKey = `${this.currentGenre}_${this.page}`;
            let games;

            if (this.gameCache.has(cacheKey)) {
                const cached = this.gameCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    games = cached.data;
                }
            }

            if (!games) {
                const url = `${this.baseUrl}/games?key=${this.apiKey}&genres=${this.currentGenre}&page=${this.page}&page_size=12&ordering=-rating`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                games = data.results || [];
                
                this.gameCache.set(cacheKey, {
                    data: games,
                    timestamp: Date.now()
                });
            }

            this.displayGames(games, append);
            this.trackActivity('Games Loaded', `Loaded ${games.length} games for ${this.currentGenre} genre`);
        } catch (error) {
            console.error('Error loading games:', error);
            this.showNotification('Error loading games. Please try again.', 'error');
            
            if (!append) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
                        <h4>Oops! Something went wrong</h4>
                        <p class="text-muted">Unable to load games. Please check your connection and try again.</p>
                        <button class="btn btn-primary" onclick="gameHub.loadGames()">
                            <i class="fas fa-refresh me-2"></i>Try Again
                        </button>
                    </div>
                `;
            }
        } finally {
            this.isLoading = false;
        }
    }

    displayGames(games, append = false) {
        const container = document.getElementById('gamesContainer');
        
        if (!container) return;
        
        if (!append) {
            container.innerHTML = '';
        }

        if (!games || games.length === 0) {
            if (!append) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                        <h4>No games found</h4>
                        <p class="text-muted">Try a different genre or search term.</p>
                    </div>
                `;
            }
            return;
        }

        games.forEach(game => {
            const gameCard = this.createGameCard(game);
            container.appendChild(gameCard);
        });

        const adBanner = document.getElementById('adBanner');
        if (adBanner) {
            if (!this.userData.isPremium && !append) {
                adBanner.classList.remove('hidden');
            } else if (this.userData.isPremium) {
                adBanner.classList.add('hidden');
            }
        }
    }

    createGameCard(game) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 col-sm-12';
        
        const isFavorited = this.userData.favorites.includes(game.id);
        const userRating = this.userData.ratings[game.id];
        
        col.innerHTML = `
            <div class="card game-card h-100">
                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="gameHub.quickToggleFavorite(${game.id})">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="rating-badge">
                    <i class="fas fa-star me-1"></i>${game.rating ? game.rating.toFixed(1) : 'N/A'}
                </div>
                <img src="${game.background_image || '/placeholder.svg?height=240&width=400'}" 
                     class="card-img-top game-card-img" alt="${game.name}"
                     onerror="this.src='/placeholder.svg?height=240&width=400'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${game.name}</h5>
                    <p class="card-text flex-grow-1">${this.truncateText(game.description_raw || 'An amazing gaming experience awaits! Discover new worlds, epic adventures, and unforgettable stories.', 100)}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            ${game.metacritic ? `<span class="badge bg-success">MC: ${game.metacritic}</span>` : ''}
                            ${userRating ? `<span class="badge bg-warning">Your: ${userRating}<i class="fas fa-star ms-1"></i></span>` : ''}
                        </div>
                        <small class="text-muted">${game.released || 'TBA'}</small>
                    </div>
                    
                    <div class="d-flex gap-2 mb-3">
                        <button class="btn btn-primary btn-sm flex-grow-1" onclick="gameHub.showGameDetails(${game.id})">
                            <i class="fas fa-info-circle me-1"></i>Details
                        </button>
                        <button class="btn btn-outline-light btn-sm" onclick="gameHub.showNotesModal(${game.id})" 
                                ${!this.userData.isPremium ? 'disabled title="Premium Feature"' : ''}>
                            <i class="fas fa-sticky-note me-1"></i>Notes
                        </button>
                    </div>

                    <!--

                    <div class="d-flex gap-1 flex-wrap">

                    
                        <a href="https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn flex-fill text-center" 
                           onclick="gameHub.trackAffiliateClick('Steam', '${game.name}')">
                            <i class="fab fa-steam me-1"></i>Steam
                        </a>
                        <a href="https://www.epicgames.com/store/browse?q=${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn flex-fill text-center"
                           onclick="gameHub.trackAffiliateClick('Epic', '${game.name}')">
                            <i class="fas fa-gamepad me-1"></i>Epic
                        </a>
                        <a href="https://www.gog.com/games?search=${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn flex-fill text-center"
                           onclick="gameHub.trackAffiliateClick('GOG', '${game.name}')">
                            <i class="fas fa-compact-disc me-1"></i>GOG
                        </a>
                    </div>
                </div>
            </div>

            -->

        
        `;

        
    
        
        return col;
    }

    async showGameDetails(gameId) {
        try {
            const cacheKey = `detail_${gameId}`;
            let game;

            if (this.gameCache.has(cacheKey)) {
                const cached = this.gameCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    game = cached.data;
                }
            }

            if (!game) {
                const response = await fetch(`${this.baseUrl}/games/${gameId}?key=${this.apiKey}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                game = await response.json();
                
                this.gameCache.set(cacheKey, {
                    data: game,
                    timestamp: Date.now()
                });
            }

            this.currentGame = game;
            this.displayGameModal(game);
            this.trackActivity('Game Details Viewed', `User viewed details for ${game.name}`);
        } catch (error) {
            console.error('Error loading game details:', error);
            this.showNotification('Error loading game details.', 'error');
        }
    }

    displayGameModal(game) {
        const isFavorited = this.userData.favorites.includes(game.id);
        const userNotes = this.userData.notes[game.id];
        const userRating = this.userData.ratings[game.id];
        
        const modalTitle = document.getElementById('gameModalTitle');
        const modalBody = document.getElementById('gameModalBody');
        
        if (modalTitle) modalTitle.textContent = game.name;
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${game.background_image || '/placeholder.svg?height=400&width=600'}" 
                             class="img-fluid rounded mb-3" alt="${game.name}"
                             onerror="this.src='/placeholder.svg?height=400&width=600'">
                    </div>
                    <div class="col-md-6">
                        <h4>${game.name}</h4>
                        <div class="mb-3">
                            <span class="badge bg-primary me-2">
                                <i class="fas fa-star me-1"></i>Rating: ${game.rating || 'N/A'}/5
                            </span>
                            ${game.metacritic ? `<span class="badge bg-success me-2">Metacritic: ${game.metacritic}</span>` : ''}
                            ${userRating ? `<span class="badge bg-warning">Your Rating: ${userRating}<i class="fas fa-star ms-1"></i></span>` : ''}
                        </div>
                        
                        <p><strong>Released:</strong> ${game.released || 'TBA'}</p>
                        <p><strong>Developer:</strong> ${game.developers ? game.developers.map(d => d.name).join(', ') : 'Unknown'}</p>
                        <p><strong>Publisher:</strong> ${game.publishers ? game.publishers.map(p => p.name).join(', ') : 'Unknown'}</p>
                        <p><strong>Platforms:</strong> ${game.platforms ? game.platforms.map(p => p.platform.name).join(', ') : 'Various'}</p>
                        <p><strong>Genres:</strong> ${game.genres ? game.genres.map(g => g.name).join(', ') : 'Various'}</p>
                        
                        ${game.esrb_rating ? `<p><strong>ESRB Rating:</strong> ${game.esrb_rating.name}</p>` : ''}
                        ${game.playtime ? `<p><strong>Average Playtime:</strong> ${game.playtime} hours</p>` : ''}
                        
                        ${userNotes ? `
                            <div class="alert alert-info">
                                <h6><i class="fas fa-sticky-note me-2"></i>Your Notes:</h6>
                                <p class="mb-0">${userNotes}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="mt-4">
                    <h5>About This Game</h5>
                    <div class="game-description" style="max-height: 200px; overflow-y: auto;">
                        ${game.description || game.description_raw || 'No description available.'}
                    </div>
                </div>
                
                ${game.tags && game.tags.length > 0 ? `
                    <div class="mt-3">
                        <h6>Tags:</h6>
                        <div class="d-flex flex-wrap gap-1">
                            ${game.tags.slice(0, 10).map(tag => `
                                <span class="badge bg-secondary">${tag.name}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                
<!--
                <div class="mt-4">
                    <h5><i class="fas fa-shopping-cart me-2"></i>Where to Buy</h5>
                    <div class="d-flex gap-2 flex-wrap">
                        <a href="https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn" onclick="gameHub.trackAffiliateClick('Steam', '${game.name}')">
                            <i class="fab fa-steam me-1"></i>Buy on Steam
                        </a>
                        <a href="https://www.epicgames.com/store/browse?q=${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn" onclick="gameHub.trackAffiliateClick('Epic', '${game.name}')">
                            <i class="fas fa-gamepad me-1"></i>Epic Games Store
                        </a>
                        <a href="https://www.gog.com/games?search=${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn" onclick="gameHub.trackAffiliateClick('GOG', '${game.name}')">
                            <i class="fas fa-compact-disc me-1"></i>GOG
                        </a>
                        <a href="https://www.xbox.com/games/store/search?q=${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn" onclick="gameHub.trackAffiliateClick('Xbox', '${game.name}')">
                            <i class="fab fa-xbox me-1"></i>Xbox Store
                        </a>
                        <a href="https://store.playstation.com/search/${encodeURIComponent(game.name)}" 
                           target="_blank" class="affiliate-btn" onclick="gameHub.trackAffiliateClick('PlayStation', '${game.name}')">
                            <i class="fab fa-playstation me-1"></i>PlayStation Store
                        </a>
                    </div>
                </div>

                -->
            `;

            
        }
        
        const favoriteBtn = document.getElementById('favoriteModalBtn');
        if (favoriteBtn) {
            favoriteBtn.innerHTML = isFavorited ? 
                '<i class="fas fa-heart-broken me-1"></i>Remove from Favorites' : 
                '<i class="fas fa-heart me-1"></i>Add to Favorites';
        }
        
        const modal = new bootstrap.Modal(document.getElementById('gameModal'));
        modal.show();
    }

    quickToggleFavorite(gameId) {
        const index = this.userData.favorites.indexOf(gameId);
        if (index > -1) {
            this.userData.favorites.splice(index, 1);
            this.showNotification('Removed from favorites', 'info');
            this.trackActivity('Game Unfavorited', `User removed game ${gameId} from favorites`);
        } else {
            this.userData.favorites.push(gameId);
            this.showNotification('Added to favorites!', 'success');
            this.trackActivity('Game Favorited', `User added game ${gameId} to favorites`);
        }
        
        this.saveUserData();
        this.updateFavoriteButtons();
        this.updateFavoritesCount();
    }

    toggleFavorite() {
        if (!this.currentGame) return;
        
        this.quickToggleFavorite(this.currentGame.id);
        
        const favoriteBtn = document.getElementById('favoriteModalBtn');
        if (favoriteBtn) {
            const isFavorited = this.userData.favorites.includes(this.currentGame.id);
            favoriteBtn.innerHTML = isFavorited ? 
                '<i class="fas fa-heart-broken me-1"></i>Remove from Favorites' : 
                '<i class="fas fa-heart me-1"></i>Add to Favorites';
        }
    }

    updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/\d+/);
                if (match) {
                    const gameId = parseInt(match[0]);
                    const isFavorited = this.userData.favorites.includes(gameId);
                    btn.classList.toggle('favorited', isFavorited);
                }
            }
        });
    }

    updateFavoritesCount() {
        const countElement = document.getElementById('favoritesCount');
        if (countElement) {
            const count = this.userData.favorites.length;
            countElement.textContent = `${count} game${count !== 1 ? 's' : ''}`;
        }
    }

    async searchGames() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        if (!query) {
            this.loadGames();
            return;
        }
        
        this.isLoading = true;
        const container = document.getElementById('gamesContainer');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <h4>Searching for "${query}"...</h4>
                        <p class="text-muted">Finding the best matches</p>
                    </div>
                </div>
            `;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/games?key=${this.apiKey}&search=${encodeURIComponent(query)}&page_size=12&ordering=-rating`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.displayGames(data.results || []);
            this.showNotification(`Found ${(data.results || []).length} games for "${query}"`, 'success');
            this.trackActivity('Search Performed', `User searched for "${query}"`);
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Search failed. Please try again.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    createCollection() {
        if (!this.userData.isPremium) {
            this.showNotification('Collections are a Premium feature!', 'warning');
            this.showPremiumMenu();
            return;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('collectionModal'));
        modal.show();
    }

    saveCollection() {
        const nameInput = document.getElementById('collectionName');
        const descInput = document.getElementById('collectionDescription');
        
        if (!nameInput || !descInput) return;
        
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        
        if (!name) {
            this.showNotification('Please enter a collection name', 'warning');
            return;
        }
        
        const collection = {
            id: Date.now(),
            name,
            description,
            games: [],
            created: new Date().toISOString()
        };
        
        this.userData.collections.push(collection);
        this.saveUserData();
        this.displayCollections();
        
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('collectionModal'));
        if (modalInstance) {
            modalInstance.hide();
        }
        
        this.showNotification('Collection created successfully!', 'success');
        this.trackActivity('Collection Created', `User created collection "${name}"`);
        
        nameInput.value = '';
        descInput.value = '';
    }

    showNotesModal(gameId) {
        if (!this.userData.isPremium) {
            this.showNotification('Notes & Reviews are a Premium feature!', 'warning');
            this.showPremiumMenu();
            return;
        }
        
        this.currentGame = { id: gameId };
        
        const notesInput = document.getElementById('gameNotes');
        const ratingSelect = document.getElementById('gameRating');
        
        if (notesInput) notesInput.value = this.userData.notes[gameId] || '';
        if (ratingSelect) ratingSelect.value = this.userData.ratings[gameId] || '';
        
        const modal = new bootstrap.Modal(document.getElementById('notesModal'));
        modal.show();
    }

    saveNotes() {
        if (!this.currentGame) return;
        
        const notesInput = document.getElementById('gameNotes');
        const ratingSelect = document.getElementById('gameRating');
        
        if (!notesInput || !ratingSelect) return;
        
        const notes = notesInput.value.trim();
        const rating = ratingSelect.value;
        
        if (notes) {
            this.userData.notes[this.currentGame.id] = notes;
        }
        
        if (rating) {
            this.userData.ratings[this.currentGame.id] = parseInt(rating);
        }
        
        this.saveUserData();
        
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('notesModal'));
        if (modalInstance) {
            modalInstance.hide();
        }
        
        this.showNotification('Notes saved successfully!', 'success');
        this.trackActivity('Notes Saved', `User saved notes for game ${this.currentGame.id}`);
        
        const homeSection = document.getElementById('homeSection');
        if (homeSection && homeSection.style.display !== 'none') {
            this.loadGames();
        }
    }

    async generateRecommendations() {
        if (!this.userData.isPremium) return;
        
        try {
            const favoriteGenres = this.userData.preferences.genres.length > 0 ? 
                this.userData.preferences.genres : ['action', 'adventure'];
            
            const recommendations = [];
            
            for (const genre of favoriteGenres.slice(0, 2)) {
                const response = await fetch(`${this.baseUrl}/games?key=${this.apiKey}&genres=${genre}&ordering=-rating&page_size=3`);
                
                if (response.ok) {
                    const data = await response.json();
                    recommendations.push(...(data.results || []));
                }
            }
            
            this.displayRecommendations(recommendations);
            this.trackActivity('Recommendations Generated', 'AI recommendations generated for user');
        } catch (error) {
            console.error('Error generating recommendations:', error);
        }
    }

    displayRecommendations(games) {
        const container = document.getElementById('recommendationsContainer');
        if (!container) return;
        
        if (!this.userData.isPremium) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-robot fa-4x mb-4 text-warning"></i>
                    <h4>AI Recommendations Available with Premium</h4>
                    <p class="text-muted">Get personalized game recommendations based on your preferences and gaming history!</p>
                    <button class="btn btn-warning" onclick="gameHub.showPremiumMenu()">
                        <i class="fas fa-crown me-2"></i>Upgrade to Premium
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        if (!games || games.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-magic fa-3x mb-3 text-muted"></i>
                    <h4>No recommendations available</h4>
                    <p class="text-muted">Add some games to your favorites to get personalized recommendations!</p>
                </div>
            `;
            return;
        }
        
        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'card mb-3';
            card.innerHTML = `
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <img src="${game.background_image || '/placeholder.svg?height=100&width=150'}" 
                             class="rounded me-3" style="width: 150px; height: 100px; object-fit: cover;" 
                             alt="${game.name}"
                             onerror="this.src='/placeholder.svg?height=100&width=150'">
                        <div class="flex-grow-1">
                            <h5>${game.name}</h5>
                            <p class="mb-2">${this.truncateText(game.description_raw || 'Recommended based on your gaming preferences!', 120)}</p>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-primary">Rating: ${game.rating || 'N/A'}</span>
                                <span class="badge bg-success">Recommended</span>
                                <button class="btn btn-primary btn-sm ms-auto" onclick="gameHub.showGameDetails(${game.id})">
                                    <i class="fas fa-info-circle me-1"></i>View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    showSection(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const premiumMenu = document.getElementById('premiumMenu');
        if (premiumMenu) {
            premiumMenu.style.display = 'none';
        }
        
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        switch (sectionName) {
            case 'favorites':
                this.displayFavorites();
                break;
            case 'collections':
                this.displayCollections();
                break;
            case 'dashboard':
                this.updateStats();
                break;
            case 'recommendations':
                this.generateRecommendations();
                break;
            case 'home':
                this.page = 1;
                this.loadGames();
                break;
        }
        
        this.trackActivity('Section Viewed', `User navigated to ${sectionName} section`);
    }

    showPremiumMenu() {
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const premiumMenu = document.getElementById('premiumMenu');
        if (premiumMenu) {
            premiumMenu.style.display = 'block';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.trackActivity('Premium Menu Viewed', 'User viewed premium features menu');
    }

    displayFavorites() {
        const container = document.getElementById('favoritesContainer');
        if (!container) return;
        
        this.updateFavoritesCount();
        
        if (this.userData.favorites.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-heart fa-4x mb-4 text-danger"></i>
                        <h4>No Favorite Games Yet</h4>
                        <p class="text-muted">Start exploring and click the heart icon on games you love!</p>
                        <button class="btn btn-primary" onclick="gameHub.showSection('home')">
                            <i class="fas fa-search me-2"></i>Discover Games
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.userData.favorites.forEach(async (gameId) => {
            try {
                const cacheKey = `detail_${gameId}`;
                let game;

                if (this.gameCache.has(cacheKey)) {
                    const cached = this.gameCache.get(cacheKey);
                    if (Date.now() - cached.timestamp < this.cacheTimeout) {
                        game = cached.data;
                    }
                }

                if (!game) {
                    const response = await fetch(`${this.baseUrl}/games/${gameId}?key=${this.apiKey}`);
                    
                    if (response.ok) {
                        game = await response.json();
                        
                        this.gameCache.set(cacheKey, {
                            data: game,
                            timestamp: Date.now()
                        });
                    }
                }
                
                if (game) {
                    const gameCard = this.createGameCard(game);
                    container.appendChild(gameCard);
                }
            } catch (error) {
                console.error('Error loading favorite game:', error);
            }
        });
    }

    displayCollections() {
        const container = document.getElementById('collectionsContainer');
        if (!container) return;
        
        if (this.userData.collections.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-folder-open fa-4x mb-4 text-primary"></i>
                    <h4>No Collections Yet</h4>
                    <p class="text-muted">Create custom collections to organize your games by theme, genre, or any way you like!</p>
                    <button class="btn btn-primary" onclick="gameHub.createCollection()">
                        <i class="fas fa-plus me-2"></i>Create Your First Collection
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.userData.collections.forEach(collection => {
            const card = document.createElement('div');
            card.className = 'collection-card';
            card.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5><i class="fas fa-folder me-2"></i>${collection.name}</h5>
                        <p class="text-muted mb-2">${collection.description}</p>
                        <div class="d-flex align-items-center gap-3">
                            <small class="text-muted">
                                <i class="fas fa-gamepad me-1"></i>${collection.games.length} games
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>Created ${new Date(collection.created).toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-light btn-sm" onclick="gameHub.viewCollection(${collection.id})">
                            <i class="fas fa-eye me-1"></i>View
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="gameHub.deleteCollection(${collection.id})">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    updateStats() {
        const elements = {
            totalGames: document.getElementById('totalGames'),
            totalFavorites: document.getElementById('totalFavorites'),
            totalCollections: document.getElementById('totalCollections'),
            totalHours: document.getElementById('totalHours')
        };
        
        if (elements.totalGames) elements.totalGames.textContent = this.userData.playHistory.length;
        if (elements.totalFavorites) elements.totalFavorites.textContent = this.userData.favorites.length;
        if (elements.totalCollections) elements.totalCollections.textContent = this.userData.collections.length;
        if (elements.totalHours) elements.totalHours.textContent = this.userData.stats.totalHours;
        
        const recentActivity = document.getElementById('recentActivity');
        if (recentActivity) {
            if (this.userData.playHistory.length === 0) {
                recentActivity.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-history fa-3x mb-3"></i>
                        <p>No recent activity. Start exploring games to see your activity here!</p>
                    </div>
                `;
            } else {
                const recent = this.userData.playHistory.slice(-5).reverse();
                recentActivity.innerHTML = recent.map(activity => `
                    <div class="d-flex justify-content-between align-items-center py-3 border-bottom border-secondary">
                        <div>
                            <div class="fw-bold">${activity.action}</div>
                            <small class="text-muted">${activity.description}</small>
                        </div>
                        <small class="text-muted">${new Date(activity.timestamp).toLocaleDateString()}</small>
                    </div>
                `).join('');
            }
        }
    }

    togglePremium() {
        if (this.userData.isPremium) {
            // If already premium, disable it
            this.userData.isPremium = false;
            this.userData.premiumExpiry = null;
            this.showNotification('Premium features disabled', 'info');
            this.trackActivity('Premium Deactivated', 'User downgraded from premium');
        } else {
            // Enable premium for 30 days
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            
            this.userData.isPremium = true;
            this.userData.premiumExpiry = expiryDate.toISOString();
            
            this.showNotification('Welcome to Premium! Enjoy 30 days of unlimited features!', 'success');
            this.generateRecommendations();
            this.trackActivity('Premium Activated', `User upgraded to premium until ${expiryDate.toLocaleDateString()}`);
        }
        
        this.saveUserData();
        this.updateUI();
    }

    updateUI() {
        const elements = {
            statusBar: document.getElementById('statusBar'),
            statusText: document.getElementById('statusText'),
            upgradeBtn: document.getElementById('upgradeBtn'),
            adBanner: document.getElementById('adBanner'),
            createCollectionBtn: document.getElementById('createCollectionBtn')
        };
        
        if (this.userData.isPremium) {
            if (elements.statusBar) elements.statusBar.classList.add('premium');
            if (elements.statusText) {
                // Show remaining premium days
                const expiryDate = new Date(this.userData.premiumExpiry);
                const now = new Date();
                const diffTime = Math.abs(expiryDate - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                elements.statusText.innerHTML = `<i class="fas fa-crown me-2"></i>Premium User - ${diffDays} days remaining`;
            }
            if (elements.upgradeBtn) elements.upgradeBtn.style.display = 'none';
            if (elements.adBanner) elements.adBanner.classList.add('hidden');
            if (elements.createCollectionBtn) elements.createCollectionBtn.classList.remove('premium-only');
        } else {
            if (elements.statusBar) elements.statusBar.classList.remove('premium');
            if (elements.statusText) {
                elements.statusText.innerHTML = '<i class="fas fa-gamepad me-2"></i>Free User - Discover Amazing Games | Upgrade to Premium for Unlimited Features';
            }
            if (elements.upgradeBtn) elements.upgradeBtn.style.display = 'inline-block';
            if (elements.adBanner) elements.adBanner.classList.remove('hidden');
            if (elements.createCollectionBtn) elements.createCollectionBtn.classList.add('premium-only');
        }
    }

    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.gameCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.gameCache.delete(key);
            }
        }
    }

    truncateText(text, length) {
        return text && text.length > length ? text.substring(0, length) + '...' : text || '';
    }

    trackActivity(action, description) {
        this.userData.playHistory.push({
            action,
            description,
            timestamp: new Date().toISOString()
        });
        
        if (this.userData.playHistory.length > 50) {
            this.userData.playHistory = this.userData.playHistory.slice(-50);
        }
        
        this.saveUserData();
    }

    trackAffiliateClick(platform, gameName) {
        this.trackActivity('Affiliate Click', `User clicked ${platform} link for ${gameName}`);
        this.showNotification(`Opening ${platform} store...`, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.4s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 3000);
    }

    viewCollection(collectionId) {
        const collection = this.userData.collections.find(c => c.id === collectionId);
        if (!collection) return;
        
        this.showNotification(`Viewing collection: ${collection.name}`, 'info');
        this.trackActivity('Collection Viewed', `User viewed collection "${collection.name}"`);
    }

    deleteCollection(collectionId) {
        if (confirm('Are you sure you want to delete this collection?')) {
            const index = this.userData.collections.findIndex(c => c.id === collectionId);
            if (index > -1) {
                const collection = this.userData.collections[index];
                this.userData.collections.splice(index, 1);
                this.saveUserData();
                this.displayCollections();
                this.showNotification('Collection deleted successfully', 'success');
                this.trackActivity('Collection Deleted', `User deleted collection "${collection.name}"`);
            }
        }
    }

    showCollectionSelector() {
        if (!this.userData.isPremium) {
            this.showNotification('Collections are a Premium feature!', 'warning');
            this.showPremiumMenu();
            return;
        }
        
        if (this.userData.collections.length === 0) {
            this.showNotification('Create a collection first!', 'warning');
            this.createCollection();
            return;
        }
        
        this.showNotification('Collection selector feature coming soon!', 'info');
    }
}

let gameHub;
document.addEventListener('DOMContentLoaded', () => {
    gameHub = new GameHubPro();
});

function showSection(section) {
    if (gameHub) gameHub.showSection(section);
}

function showPremiumMenu() {
    if (gameHub) gameHub.showPremiumMenu();
}

function createCollection() {
    if (gameHub) gameHub.createCollection();
}

function saveCollection() {
    if (gameHub) gameHub.saveCollection();
}

function saveNotes() {
    if (gameHub) gameHub.saveNotes();
}

function togglePremium() {
    if (gameHub) gameHub.togglePremium();
}
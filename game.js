      /* © SMILEX - This code is licensed and protected. */
      class UltimateGameHub {
        constructor() {
            this.initializeProperties();
            this.setupEventListeners();
            this.loadInitialGames();
        }

        initializeProperties() {
            // Core properties
            this.page = 1;
            this.currentGenre = 'action';
            this.isLoading = false;

             /* © SMILEX - This code is licensed and protected. */

            // DOM Element References
            this.gamesContainer = document.getElementById('gamesContainer');
            this.searchInput = document.getElementById('searchInput');
            this.searchButton = document.getElementById('searchButton');
            this.genreButtons = document.querySelectorAll('.genre-btn');
            this.loadingOverlay = document.getElementById('loadingOverlay');
            this.previewModal = document.getElementById('gamePreviewModal');
            this.previewContent = document.getElementById('previewContent');
            this.closePreviewBtn = document.getElementById('closePreviewBtn');
            this.playGameBtn = document.getElementById('playGameBtn');
        }

         /* © SMILEX - This code is licensed and protected. */

        setupEventListeners() {
            // Search functionality
            this.searchButton.addEventListener('click', () => this.searchGames());
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchGames();
            });

            // Genre filters
            this.genreButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all buttons
                    this.genreButtons.forEach(b => b.classList.remove('active'));
                    
                    // Add active class to clicked button
                    btn.classList.add('active');
                    
                    this.currentGenre = btn.dataset.genre;
                    this.loadGenreGames();
                });
            });

             /* © SMILEX - This code is licensed and protected. */

            // Preview modal close
            this.closePreviewBtn.addEventListener('click', () => this.closePreview());

            // Play game button
            this.playGameBtn.addEventListener('click', () => this.playGame());

            // Infinite scroll
            window.addEventListener('scroll', () => {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                    this.loadMoreGames();
                }
            });
        }

         /* © SMILEX - This code is licensed and protected. */

        async loadInitialGames() {
            this.gamesContainer.innerHTML = ''; // Clear previous games
            this.page = 1;
            await this.fetchGames();
        }

         /* © SMILEX - This code is licensed and protected. */

        async loadGenreGames() {
            this.gamesContainer.innerHTML = '';
            this.page = 1;
            await this.fetchGames();
        }

        async loadMoreGames() {
            if (!this.isLoading) {
                this.page++;
                await this.fetchGames();
            }
        }

         /* © SMILEX - This code is licensed and protected. */

        async fetchGames() {
            this.isLoading = true;
            this.showLoadingOverlay();

             /* © SMILEX - This code is licensed and protected. */

            try {
                // Using RAWG Video Games Database API
                 /* © SMILEX - This code is licensed and protected. */
                const apiKey = ''; // Replace with actual key
                const url = `https://api.rawg.io/api/games?key=${apiKey}&genres=${this.currentGenre}&page=${this.page}&page_size=12`;
                
                const response = await fetch(url);
                const data = await response.json();

                 /* © SMILEX - This code is licensed and protected. */

                this.displayGames(data.results);
            } catch (error) {
                console.error('Games fetch error:', error);
                this.showErrorMessage();
            } finally {
                this.isLoading = false;
                this.hideLoadingOverlay();
            }
        }

         /* © SMILEX - This code is licensed and protected. */

        displayGames(games) {
            games.forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.className = 'col-md-4';
                gameCard.innerHTML = `
                    <div class="card game-card h-100 text-white">
                        <img 
                            src="${game.background_image || 'https://via.placeholder.com/400x300'}" 
                            class="card-img-top game-card-img" 
                            alt="${game.name}"
                        >
                        <span class="platform-badge">
                            ${game.platforms ? game.platforms[0]?.platform.name : 'Multi-Platform'}
                        </span>
                        <div class="card-body">
                            <h5 class="card-title">${this.truncateText(game.name, 40)}</h5>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-primary">${game.rating || 'N/A'} Rating</span>
                                <button class="btn btn-sm btn-outline-light preview-btn">Preview</button>
                            </div>
                        </div>
                    </div>
                `;

                const previewBtn = gameCard.querySelector('.preview-btn');
                previewBtn.addEventListener('click', () => this.showPreview(game));

                this.gamesContainer.appendChild(gameCard);
            });
        }

         /* © SMILEX - This code is licensed and protected. */

        showPreview(game) {
            this.currentGame = game;
            this.previewContent.innerHTML = `
                <div class="row">
                    <div class="col-md-8">
                        <img 
                            src="${game.background_image}" 
                            class="img-fluid rounded mb-3"
                            alt="${game.name}"
                        >
                    </div>
                    <div class="col-md-4">
                        <h2>${game.name}</h2>
                        <div class="mb-3">
                            <span class="badge bg-primary me-2">Rating: ${game.rating || 'N/A'}</span>
                            <span class="badge bg-success">
                                Metacritic: ${game.metacritic || 'N/A'}
                            </span>
                        </div>
                        <h4>Platforms</h4>
                        <ul class="list-unstyled">
                            ${game.platforms ? game.platforms.map(p => 
                                `<li>${p.platform.name}</li>`
                            ).join('') : 'No platform info'}
                        </ul>
                    </div>
                </div>
                <div class="mt-3">
                    <h4>Game Description</h4>
                    <p>${this.fetchGameDescription(game)}</p>
                </div>
            `;
            this.previewModal.style.display = 'block';
        }

         /* © SMILEX - This code is licensed and protected. */

        fetchGameDescription(game) {
            // In a real-world scenario, you'd fetch detailed description from an additional API call
            return "Detailed game description would be loaded here. This is a placeholder description for the game.";
        }

        playGame() {
            if (this.currentGame) {
                // In a real implementation, this would launch the game
                // For now, we'll simulate with an alert
                alert(`Launching ${this.currentGame.name}. In a real app, this would start the game!`);
            }
        }

         /* © SMILEX - This code is licensed and protected. */

        // Utility Methods
        truncateText(text, length) {
            return text && text.length > length 
                ? text.substring(0, length) + '...' 
                : text || '';
        }

        showLoadingOverlay() {
            this.loadingOverlay.style.display = 'flex';
        }

        hideLoadingOverlay() {
            this.loadingOverlay.style.display = 'none';
        }

        showErrorMessage() {
            this.gamesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>Unable to fetch games. Please try again later.</h3>
                </div>
            `;
        }

         /* © SMILEX - This code is licensed and protected. */

        closePreview() {
            this.previewModal.style.display = 'none';
        }

        searchGames() {
            const searchTerm = this.searchInput.value.trim();
            if (searchTerm) {
                this.currentGenre = ''; // Reset genre
                this.gamesContainer.innerHTML = ''; // Clear previous results
                this.page = 1;
                this.fetchSearchedGames(searchTerm);
            }
        }

         /* © SMILEX - This code is licensed and protected. */

        async fetchSearchedGames(searchTerm) {
            this.isLoading = true;
            this.showLoadingOverlay();

            try {
                const apiKey = 'YOUR_RAWG_API_KEY'; // Replace with actual key
                const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${searchTerm}&page=${this.page}&page_size=12`;
                
                const response = await fetch(url);
                const data = await response.json();

                this.displayGames(data.results);
            } catch (error) {
                console.error('Game search error:', error);
                this.showErrorMessage();
            } finally {
                this.isLoading = false;
                this.hideLoadingOverlay();
            }
        }
    }

    // Initialize the Ultimate Game Hub
    document.addEventListener('DOMContentLoaded', () => {
        new UltimateGameHub();
    });
     /* © SMILEX - This code is licensed and protected. */

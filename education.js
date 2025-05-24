      /* © SMILEX - This code is licensed and protected. */
      class StarBackground {
        constructor() {
            this.starField = document.getElementById('starField');
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.createStars();
            this.setupEventListeners();
        }

        createStars() {
            const starCount = Math.floor(this.width / 20);
            for (let i = 0; i < starCount; i++) {
                const star = this.createSingleStar();
                this.starField.appendChild(star);
            }
        }

        createSingleStar() {
            const star = document.createElement('div');
            star.classList.add('star');

            const y = Math.random() * this.height;
            const size = Math.random() * 2;
            const animationDuration = (Math.random() * 10 + 5) + 's';

            star.style.cssText = `
                top: ${y}px;
                left: -10px;
                width: ${size}px;
                height: ${size}px;
                animation-duration: ${animationDuration};
                opacity: ${Math.random()};
            `;

            star.addEventListener('animationend', () => {
                this.starField.removeChild(star);
                this.starField.appendChild(this.createSingleStar());
            });

            return star;
        }

        setupEventListeners() {
            window.addEventListener('resize', () => {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.starField.innerHTML = '';
                this.createStars();
            });
        }
    }

    // Search functionality
    document.addEventListener('DOMContentLoaded', () => {
        new StarBackground();

        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        const searchResults = document.getElementById('searchResults');

        // Mock search data (replace with actual data source)
        const stories = [
            { title: "Cosmic Journey", author: "Alex Star" },
            { title: "Whispers of the Galaxy", author: "Luna Nebula" },
            { title: "Starlight Chronicles", author: "Nova Horizon" },
            { title: "Quantum Dreams", author: "Stella Cosmos" }
        ];

        function performSearch() {
            const query = searchInput.value.trim().toLowerCase();
            
            // Filter stories based on search query
            const filteredStories = stories.filter(story => 
                story.title.toLowerCase().includes(query) || 
                story.author.toLowerCase().includes(query)
            );

            // Clear previous results
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';

            // Display results if query is not empty
            if (query && filteredStories.length > 0) {
                filteredStories.forEach(story => {
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('search-result-item');
                    resultItem.innerHTML = `
                        <strong>${story.title}</strong>
                        <br>
                        <small>by ${story.author}</small>
                    `;
                    resultItem.addEventListener('click', () => {
                        // Handle story selection
                        console.log('Selected story:', story);
                        searchInput.value = story.title;
                        searchResults.style.display = 'none';
                    });
                    searchResults.appendChild(resultItem);
                });
                searchResults.style.display = 'block';
            }
        }

        // Search on button click
        searchButton.addEventListener('click', performSearch);

        // Search on input
        searchInput.addEventListener('input', performSearch);

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    });


      class StoryRealm {
        constructor() {
            this.page = 1;
            this.isLoading = false;
            this.hasMore = true;

            this.initializeElements();
            this.setupEventListeners();
            this.loadInitialStories();
        }
         /* © SMILEX - This code is licensed and protected. */

        initializeElements() {
            this.searchInput = document.getElementById('searchInput');
            this.searchButton = document.getElementById('searchButton');
            this.storiesContainer = document.getElementById('storiesContainer');
            this.loadingSpinner = document.getElementById('loadingSpinner');
            this.storyModal = new bootstrap.Modal(document.getElementById('storyModal'));
        }

         /* © SMILEX - This code is licensed and protected. */

        setupEventListeners() {
            this.searchButton.addEventListener('click', () => this.searchStories());
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchStories();
            });

            window.addEventListener('scroll', this.handleInfiniteScroll.bind(this));
        }

        async loadInitialStories() {
            this.page = 1;
            await this.fetchStories();
        }

         /* © SMILEX - This code is licensed and protected. */

        async searchStories() {
            const query = this.searchInput.value.trim();
            this.page = 1;
            this.hasMore = true;
            this.storiesContainer.innerHTML = '';
            await this.fetchStories(query);
        }

         /* © SMILEX - This code is licensed and protected. */

        async fetchStories(query = '') {
            if (this.isLoading || !this.hasMore) return;

            this.isLoading = true;
            this.showLoadingSpinner();

             /* © SMILEX - This code is licensed and protected. */

            try {
                const stories = await this.fetchStoriesFromAPI(query, this.page);
                
                if (stories.length === 0) {
                    this.hasMore = false;
                } else {
                    this.displayStories(stories);
                    this.page++;
                }
            } catch (error) {
                this.handleError(error);
            } finally {
                this.isLoading = false;
                this.hideLoadingSpinner();
            }
        }

         /* © SMILEX - This code is licensed and protected. */

        async fetchStoriesFromAPI(query, page) {
            // Combine multiple APIs for rich story content
            const apis = [
                `https://openlibrary.org/search.json?q=${query || 'fiction'}&page=${page}`,
                `https://gutendex.com/books/?page=${page}&topic=${query || 'fiction'}`
            ];

             /* © SMILEX - This code is licensed and protected. */

            const responses = await Promise.all(
                apis.map(url => fetch(url).then(res => res.json()))
            );

            // Merge and transform results
            return responses.flatMap(response => 
                response.docs ? 
                    response.docs.map(this.transformStory) : 
                    response.results?.map(this.transformGutenbergStory) || []
            ).filter(story => story.title && story.coverImage);
        }

         /* © SMILEX - This code is licensed and protected. */

        transformStory(story) {
            return {
                title: story.title,
                author: story.author_name?.[0] || 'Unknown Author',
                coverImage: story.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${story.cover_i}-M.jpg`
                    : 'https://via.placeholder.com/250x350.png?text=Story+Cover',
                description: story.first_sentence?.[0] || 'No description available'
            };
        }

         /* © SMILEX - This code is licensed and protected. */

        transformGutenbergStory(story) {
            return {
                title: story.title,
                author: story.authors?.[0]?.name || 'Unknown Author',
                coverImage: story.formats['image/jpeg'] || 
                    'https://via.placeholder.com/250x350.png?text=Story+Cover',
                description: 'Classic literature story'
            };
        }

         /* © SMILEX - This code is licensed and protected. */

        displayStories(stories) {
            stories.forEach(story => {
                const card = document.createElement('div');
                card.className = 'col-md-3 mb-4';
                card.innerHTML = `
                    <div class="card story-card h-100">
                        <img src="${story.coverImage}" 
                             class="card-img-top story-card-img" 
                             alt="${story.title} cover">
                        <div class="card-body">
                            <h5 class="card-title">${this.truncateText(story.title, 40)}</h5>
                            <p class="card-text text-muted">
                                ${this.truncateText(story.author, 30)}
                            </p>
                        </div>
                    </div>
                `;
                card.addEventListener('click', () => this.showStoryDetails(story));
                this.storiesContainer.appendChild(card);
            });
        }

         /* © SMILEX - This code is licensed and protected. */

        showStoryDetails(story) {
            const modalBody = document.querySelector('#storyModal .modal-body');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <img src="${story.coverImage}" class="img-fluid" alt="${story.title} cover">
                    </div>
                    <div class="col-md-8">
                        <h2>${story.title}</h2>
                        <p><strong>Author:</strong> ${story.author}</p>
                        <p>${story.description}</p>
                    </div>
                </div>
            `;
            this.storyModal.show();
        }
         /* © SMILEX - This code is licensed and protected. */

        handleInfiniteScroll() {
            if (this.isLoading || !this.hasMore) return;

            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                this.fetchStories(this.searchInput.value.trim());
            }
        }
         /* © SMILEX - This code is licensed and protected. */

        truncateText(text, length) {
            return text && text.length > length 
                ? text.substring(0, length) + '...' 
                : text;
        }
         /* © SMILEX - This code is licensed and protected. */

        showLoadingSpinner() {
            this.loadingSpinner.style.display = 'block';
        }

        hideLoadingSpinner() {
            this.loadingSpinner.style.display = 'none';
        }
         /* © SMILEX - This code is licensed and protected. */

        handleError(error) {
            console.error('Story fetch error:', error);
            this.storiesContainer.innerHTML += `
                <div class="col-12 text-center text-danger">
                    <p>Unable to retrieve stories. Please try again.</p>
                </div>
            `;
        }
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', () => new StoryRealm());


    class AdvancedScrollController {
        constructor() {
            // DOM Elements
            this.upBtn = document.getElementById('upScrollBtn');
            this.downBtn = document.getElementById('downScrollBtn');
            this.scrollProgress = document.getElementById('scrollProgress');
            this.scrollIndicator = document.getElementById('scrollIndicator');

            // Scroll State
            this.isScrolling = false;
            this.scrollInterval = null;
            this.scrollSpeed = 0;
            this.maxScrollSpeed = 50;

            // Performance Optimization
            this.scrollThrottle = this.createThrottle();

            // Initialize
            this.initializeEventListeners();
            this.setupScrollTracking();
        }

        // Enhanced Event Listeners
        initializeEventListeners() {
            // Scroll Buttons
            this.downBtn.addEventListener('mousedown', this.startDownScroll.bind(this));
            this.downBtn.addEventListener('mouseup', this.stopScroll.bind(this));
            this.downBtn.addEventListener('mouseleave', this.stopScroll.bind(this));

            this.upBtn.addEventListener('click', this.handleUpScroll.bind(this));

            // Touch Support
            this.downBtn.addEventListener('touchstart', this.startDownScroll.bind(this));
            this.downBtn.addEventListener('touchend', this.stopScroll.bind(this));
            this.upBtn.addEventListener('touchstart', this.handleUpScroll.bind(this));

            // Keyboard Accessibility
            document.addEventListener('keydown', this.handleKeyboardScroll.bind(this));
        }

        // Dynamic Scroll Down
        startDownScroll(event) {
            event.preventDefault();
            this.isScrolling = true;
            this.scrollSpeed = 1;

            const incrementSpeed = () => {
                if (this.scrollSpeed < this.maxScrollSpeed) {
                    this.scrollSpeed += 0.5;
                }
            };

            this.scrollInterval = setInterval(() => {
                window.scrollBy({
                    top: this.scrollSpeed,
                    behavior: 'smooth'
                });

                incrementSpeed();

                // Stop if reached bottom
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                    this.stopScroll();
                }
            }, 20);
        }

        // Smooth Up Scroll
        handleUpScroll() {
            // Multiple scroll strategies
            const scrollOptions = [
                { behavior: 'smooth', top: 0 },
                { behavior: 'auto', top: 0 }
            ];

            // Try smooth scroll, fallback to instant
            try {
                window.scrollTo(scrollOptions[0]);
            } catch {
                window.scrollTo(scrollOptions[1]);
            }
        }

        // Stop Scrolling
        stopScroll() {
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.isScrolling = false;
                this.scrollSpeed = 0;
            }
        }

        // Scroll Tracking
        setupScrollTracking() {
            window.addEventListener('scroll', this.scrollThrottle(() => {
                // Progress Bar
                const scrollPercentage = 
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                
                this.scrollProgress.style.width = `${scrollPercentage}%`;

                // Scroll Indicator
                this.updateScrollIndicator(scrollPercentage);
            }));
        }

        // Scroll Indicator
        updateScrollIndicator(percentage) {
            this.scrollIndicator.style.display = 'block';
            this.scrollIndicator.textContent = `Scroll: ${percentage.toFixed(2)}%`;

            // Auto-hide after 2 seconds
            clearTimeout(this.indicatorTimeout);
            this.indicatorTimeout = setTimeout(() => {
                this.scrollIndicator.style.display = 'none';
            }, 2000);
        }

        // Keyboard Scroll Support
        handleKeyboardScroll(event) {
            switch(event.key) {
                case 'ArrowDown':
                    this.startDownScroll(event);
                    break;
                case 'ArrowUp':
                    this.handleUpScroll();
                    break;
            }
        }

        // Performance Throttle
        createThrottle(delay = 50) {
            let lastExecution = 0;
            return (callback) => {
                return (...args) => {
                    const now = Date.now();
                    if (now - lastExecution >= delay) {
                        callback(...args);
                        lastExecution = now;
                    }
                };
            };
        }
    }

    // Initialize on DOM Load
    document.addEventListener('DOMContentLoaded', () => {
        new AdvancedScrollController();
    });


    class TournamentReminder {
        constructor() {
            this.initializeElements();
            this.setupEventListeners();
            this.checkTournamentEligibility();
        }
    
        initializeElements() {
            this.reminderBtn = document.getElementById('tournamentReminder');
            this.modal = new bootstrap.Modal(document.getElementById('tournamentModal'));
            this.joinBtn = document.getElementById('joinTournament');
            this.dismissBtn = document.getElementById('dismissTournament');

                 /* © SMILEX - This code is licensed and protected. */
        }
    
        setupEventListeners() {
            this.reminderBtn.addEventListener('click', () => this.showModal());
            this.joinBtn.addEventListener('click', () => this.joinTournament());
            this.dismissBtn.addEventListener('click', () => this.dismissTournament());
        }
    
        showModal() {
            this.modal.show();
            this.trackInteraction('modal_shown');
        }

             /* © SMILEX - This code is licensed and protected. */
    
        joinTournament() {
            // Implement tournament registration logic
            window.location.href = 'tournament.html';
            this.trackInteraction('tournament_joined');
        }
    
        dismissTournament() {
            this.modal.hide();
            this.trackInteraction('tournament_dismissed');
        }
    
        checkTournamentEligibility() {
            const lastInteraction = this.getLastInteractionTime();
            const currentTime = new Date().getTime();
    
            // Show reminder if not shown in last 24 hours
            if (!lastInteraction || (currentTime - lastInteraction > 86400000)) {
                setTimeout(() => this.showModal(), 3000);
            }
        }
    
        trackInteraction(type) {
            const interactions = JSON.parse(localStorage.getItem('tournamentInteractions') || '[]');
            interactions.push({
                type,
                timestamp: new Date().getTime()
            });
            localStorage.setItem('tournamentInteractions', JSON.stringify(interactions));
        }
    
        getLastInteractionTime() {
            const interactions = JSON.parse(localStorage.getItem('tournamentInteractions') || '[]');
            return interactions.length > 0 
                ? interactions[interactions.length - 1].timestamp 
                : null;
        }
    }
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        new TournamentReminder();
    });
     /* © SMILEX - This code is licensed and protected. */


        class UnlimitedStoryPlatform {
            constructor() {
                // Configuration
                this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
                this.REQUEST_DELAY = 800; // 800ms between requests
                this.MAX_RETRIES = 3;
                this.AUTO_LOAD_INTERVAL = 3000; // Load new stories every 3 seconds
                
                // API Configuration
                this.APIs = [
                    {
                        name: 'OpenLibrary',
                        baseUrl: 'https://openlibrary.org/search.json',
                        transform: this.transformOpenLibraryStory.bind(this)
                    },
                    {
                        name: 'Gutenberg',
                        baseUrl: 'https://gutendex.com/books',
                        transform: this.transformGutenbergStory.bind(this)
                    },
                    {
                        name: 'NewsAPI',
                        baseUrl: 'https://newsapi.org/v2/everything',
                        transform: this.transformNewsStory.bind(this)
                    }
                ];
                
                // State management
                this.cache = new Map();
                this.lastRequestTime = 0;
                this.isLoading = false;
                this.currentPage = 1;
                this.currentAPIIndex = 0;
                this.stories = new Set(); // Use Set to avoid duplicates
                this.searchQuery = '';
                this.autoLoadTimer = null;
                this.storyCounter = 0;
                
                // Search topics for continuous loading
                this.searchTopics = [
                    'fiction', 'adventure', 'mystery', 'romance', 'fantasy', 'science',
                    'history', 'biography', 'drama', 'comedy', 'thriller', 'horror',
                    'poetry', 'philosophy', 'art', 'music', 'travel', 'nature',
                    'technology', 'space', 'ocean', 'mountain', 'forest', 'city',
                    'love', 'friendship', 'family', 'courage', 'hope', 'dreams'
                ];
                this.currentTopicIndex = 0;
                
                // Initialize immediately
                this.init();
            }

            async init() {
                console.log('Initializing...');
                this.setupEventListeners();
                this.createStarBackground();
                
                // Start continuous loading immediately
                this.startContinuousLoading();
            }

            setupEventListeners() {
                const searchInput = document.getElementById('searchInput');
                const searchButton = document.getElementById('searchButton');
                const closeReader = document.getElementById('close-reader');

                // Search functionality
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch();
                    }
                });

                searchButton.addEventListener('click', () => {
                    this.performSearch();
                });

                // Clear search when input is empty
                searchInput.addEventListener('input', (e) => {
                    if (e.target.value.trim() === '') {
                        this.clearSearch();
                    }
                });

                // Close story reader
                closeReader.addEventListener('click', () => {
                    this.closeStoryReader();
                });

                // Close reader on overlay click
                document.getElementById('story-overlay').addEventListener('click', (e) => {
                    if (e.target === e.currentTarget) {
                        this.closeStoryReader();
                    }
                });

                // Manual load more on scroll
                window.addEventListener('scroll', this.throttle(() => {
                    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                        this.loadMoreStories();
                    }
                }, 1000));

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.closeStoryReader();
                    }
                });
            }

            createStarBackground() {
                const starField = document.getElementById('starField');
                const starCount = Math.floor(window.innerWidth / 20);
                
                for (let i = 0; i < starCount; i++) {
                    const star = document.createElement('div');
                    star.classList.add('star');
                    
                    const y = Math.random() * 200;
                    const size = Math.random() * 2 + 1;
                    const duration = (Math.random() * 10 + 5) + 's';
                    
                    star.style.cssText = `
                        top: ${y}px;
                        left: -10px;
                        width: ${size}px;
                        height: ${size}px;
                        animation-duration: ${duration};
                    `;
                    
                    starField.appendChild(star);
                    
                    star.addEventListener('animationend', () => {
                        star.remove();
                        if (starField.children.length < starCount) {
                            this.createStarBackground();
                        }
                    });
                }
            }

            startContinuousLoading() {
                console.log('Starting continuous story loading...');
                this.updateSearchInfo('Loading stories continuously...');
                
                // Load initial batch
                this.loadStoriesFromAllAPIs();
                
                // Set up continuous loading
                this.autoLoadTimer = setInterval(() => {
                    if (!this.searchQuery) { // Only auto-load when not searching
                        this.loadStoriesFromAllAPIs();
                    }
                }, this.AUTO_LOAD_INTERVAL);
            }

            stopContinuousLoading() {
                if (this.autoLoadTimer) {
                    clearInterval(this.autoLoadTimer);
                    this.autoLoadTimer = null;
                }
            }

            async loadStoriesFromAllAPIs() {
                if (this.isLoading) return;
                
                this.isLoading = true;
                this.showAutoLoadIndicator();
                
                try {
                    // Get current search topic for variety
                    const topic = this.searchQuery || this.searchTopics[this.currentTopicIndex];
                    this.currentTopicIndex = (this.currentTopicIndex + 1) % this.searchTopics.length;
                    
                    // Load from multiple APIs simultaneously
                    const promises = this.APIs.map(api => this.fetchFromAPI(api, topic));
                    const results = await Promise.allSettled(promises);
                    
                    let newStoriesCount = 0;
                    results.forEach((result, index) => {
                        if (result.status === 'fulfilled' && result.value.length > 0) {
                            const addedCount = this.addStoriesToDisplay(result.value);
                            newStoriesCount += addedCount;
                            console.log(`Loaded ${addedCount} stories from ${this.APIs[index].name}`);
                        }
                    });
                    
                    if (newStoriesCount > 0) {
                        this.showStatus(`Loaded ${newStoriesCount} new stories`, 'success');
                    }
                    
                } catch (error) {
                    console.error('Error loading stories:', error);
                    this.showStatus('Error loading some stories', 'warning');
                } finally {
                    this.isLoading = false;
                    this.hideAutoLoadIndicator();
                }
            }

            async fetchFromAPI(api, query) {
                try {
                    let url;
                    
                    switch (api.name) {
                        case 'OpenLibrary':
                            url = `${api.baseUrl}?q=${encodeURIComponent(query)}&limit=20&page=${Math.floor(Math.random() * 10) + 1}`;
                            break;
                        case 'Gutenberg':
                            url = `${api.baseUrl}?search=${encodeURIComponent(query)}&page=${Math.floor(Math.random() * 10) + 1}`;
                            break;
                        case 'NewsAPI':
                            // Skip NewsAPI for now as it requires API key
                            return [];
                        default:
                            return [];
                    }
                    
                    const response = await this.makeAPIRequest(url);
                    
                    if (api.name === 'OpenLibrary' && response.docs) {
                        return response.docs.map(api.transform).filter(story => story.title && story.coverImage);
                    } else if (api.name === 'Gutenberg' && response.results) {
                        return response.results.map(api.transform).filter(story => story.title);
                    }
                    
                    return [];
                    
                } catch (error) {
                    console.error(`Error fetching from ${api.name}:`, error);
                    return [];
                }
            }

            async makeAPIRequest(url, useCache = true) {
                // Check cache first
                if (useCache && this.cache.has(url)) {
                    const cached = this.cache.get(url);
                    const now = Date.now();
                    if (now - cached.timestamp < this.CACHE_DURATION) {
                        return cached.data;
                    }
                }

                // Rate limiting
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                if (timeSinceLastRequest < this.REQUEST_DELAY) {
                    await new Promise(resolve => 
                        setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest)
                    );
                }

                // Make request with retry logic
                for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
                    try {
                        this.lastRequestTime = Date.now();
                        
                        const response = await fetch(url);
                        
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }

                        const data = await response.json();
                        
                        // Cache the response
                        this.cache.set(url, {
                            data: data,
                            timestamp: now
                        });

                        return data;

                    } catch (error) {
                        console.error(`Attempt ${attempt} failed for ${url}:`, error);
                        if (attempt === this.MAX_RETRIES) {
                            throw error;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }

            transformOpenLibraryStory(story) {
                const publishYear = story.first_publish_year || 'Unknown';
                const author = story.author_name?.[0] || 'Unknown Author';
                const subject = story.subject?.[0] || 'Fiction';
                
                return {
                    id: `ol_${story.key?.replace('/works/', '') || Math.random().toString(36)}`,
                    title: story.title || 'Untitled Story',
                    author: author,
                    description: story.first_sentence?.[0] || `A captivating ${subject.toLowerCase()} story by ${author}. This work explores themes of human nature, relationships, and the complexities of life through engaging narrative and compelling characters.`,
                    genre: subject,
                    publishYear: publishYear,
                    coverImage: story.cover_i 
                        ? `https://covers.openlibrary.org/b/id/${story.cover_i}-M.jpg`
                        : `https://via.placeholder.com/300x400/1a1a1a/6a11cb?text=${encodeURIComponent(story.title?.substring(0, 20) || 'Story')}`,
                    content: this.generateStoryContent(story.title, author, story.first_sentence?.[0]),
                    source: 'OpenLibrary'
                };
            }

            transformGutenbergStory(story) {
                const author = story.authors?.[0]?.name || 'Unknown Author';
                const subject = story.subjects?.[0] || 'Classic Literature';
                
                return {
                    id: `gb_${story.id}`,
                    title: story.title || 'Untitled Classic',
                    author: author,
                    description: `A timeless classic from Project Gutenberg. This ${subject.toLowerCase()} work has been preserved for future generations and offers insights into ${story.subjects?.slice(0, 2).join(' and ') || 'human experience'}.`,
                    genre: subject,
                    publishYear: story.authors?.[0]?.birth_year || 'Classic',
                    coverImage: story.formats?.['image/jpeg'] || 
                        `https://via.placeholder.com/300x400/1a1a1a/2575fc?text=${encodeURIComponent(story.title?.substring(0, 20) || 'Classic')}`,
                    content: this.generateStoryContent(story.title, author),
                    source: 'Project Gutenberg'
                };
            }

            transformNewsStory(article) {
                return {
                    id: `news_${article.url?.split('/').pop() || Math.random().toString(36)}`,
                    title: article.title || 'News Story',
                    author: article.author || article.source?.name || 'News Reporter',
                    description: article.description || 'A current news story with important information and insights.',
                    genre: 'News',
                    publishYear: new Date(article.publishedAt).getFullYear(),
                    coverImage: article.urlToImage || 
                        'https://via.placeholder.com/300x400/1a1a1a/ff6b6b?text=News+Story',
                    content: this.generateNewsContent(article.title, article.content || article.description),
                    source: 'News API'
                };
            }

            generateStoryContent(title, author, firstSentence = '') {
                const templates = [
                    `<h1>${title}</h1>
                    <p><em>by ${author}</em></p>
                    
                    <h2>Chapter 1</h2>
                    <p>${firstSentence || 'In a world where stories come alive, our tale begins with an extraordinary discovery that will change everything.'}</p>
                    
                    <p>The morning sun cast long shadows across the landscape as our protagonist embarked on a journey that would test their courage, wisdom, and determination. Little did they know that this adventure would reveal truths about themselves and the world around them that they never could have imagined.</p>
                    
                    <h2>Chapter 2</h2>
                    <p>As the story unfolds, we discover that every choice has consequences, every action ripples through time, and every character we meet has their own story to tell. The narrative weaves together themes of love, loss, hope, and redemption in ways that speak to the universal human experience.</p>
                    
                    <p>Through trials and triumphs, our characters learn that the greatest adventures are not just about reaching a destination, but about the transformation that occurs along the way. Each page reveals new depths of meaning and connection.</p>
                    
                    <p><em>Continue reading to discover how this remarkable story unfolds...</em></p>`,
                    
                    `<h1>${title}</h1>
                    <p><em>A story by ${author}</em></p>
                    
                    <p>${firstSentence || 'This is a tale of wonder and discovery, where the impossible becomes possible and dreams take flight.'}</p>
                    
                    <p>In the pages that follow, you'll encounter characters who face challenges that mirror our own struggles and triumphs. Their journeys remind us that courage isn't the absence of fear, but the decision to move forward despite it.</p>
                    
                    <p>The narrative explores the depths of human emotion and the power of storytelling to connect us across time and space. Each chapter builds upon the last, creating a tapestry of meaning that resonates long after the final page is turned.</p>
                    
                    <p>Whether you're seeking adventure, romance, mystery, or simply a moment of escape from the everyday world, this story offers something special for every reader.</p>`
                ];
                
                return templates[Math.floor(Math.random() * templates.length)];
            }

            generateNewsContent(title, content) {
                return `
                    <h1>${title}</h1>
                    <p><em>Current News Story</em></p>
                    
                    <p>${content || 'This news story provides important information about current events and their impact on our world.'}</p>
                    
                    <p>Stay informed about the latest developments and understand how these events shape our society and future. News stories help us stay connected to the world around us and make informed decisions.</p>
                `;
            }

            addStoriesToDisplay(newStories) {
                let addedCount = 0;
                
                newStories.forEach(story => {
                    // Check for duplicates
                    if (!this.stories.has(story.id)) {
                        this.stories.add(story.id);
                        this.displaySingleStory(story);
                        addedCount++;
                        this.storyCounter++;
                    }
                });
                
                this.updateStoryCounter();
                return addedCount;
            }

            displaySingleStory(story) {
                const container = document.getElementById('storiesContainer');
                const storyCard = this.createStoryCard(story);
                container.appendChild(storyCard);
            }

            createStoryCard(story) {
                const col = document.createElement('div');
                col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
                
                col.innerHTML = `
                    <div class="story-card fade-in">
                        <img src="${story.coverImage}" 
                             class="story-card-img" 
                             alt="${story.title} cover"
                             loading="lazy"
                             onerror="this.src='https://via.placeholder.com/300x400/1a1a1a/6a11cb?text=Story+Cover'">
                        <div class="story-card-body">
                            <h5 class="story-title">${this.truncateText(story.title, 60)}</h5>
                            <p class="story-author">by ${this.truncateText(story.author, 30)}</p>
                            <div class="story-meta">
                                <span class="story-genre">${story.genre}</span>
                                <span>${story.source}</span>
                            </div>
                            <p class="story-description">${this.truncateText(story.description, 150)}</p>
                            <div class="story-actions">
                                <button class="action-btn preview-btn" onclick="storyPlatform.previewStory('${story.id}')">
                                    <i class="fas fa-eye"></i> Preview
                                </button>
                                <button class="action-btn read-btn" onclick="storyPlatform.readStory('${story.id}')">
                                    <i class="fas fa-book-open"></i> Read
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Store story data for later use
                col.dataset.storyData = JSON.stringify(story);
                
                return col;
            }

            performSearch() {
                const query = document.getElementById('searchInput').value.trim();
                if (!query) return;
                
                console.log('Performing search for:', query);
                this.searchQuery = query;
                this.stopContinuousLoading();
                this.clearStories();
                this.updateSearchInfo(`Searching for "${query}"...`, true);
                
                // Perform search across all APIs
                this.searchAllAPIs(query);
            }

            async searchAllAPIs(query) {
                this.isLoading = true;
                this.showAutoLoadIndicator();
                
                try {
                    const promises = this.APIs.map(api => this.fetchFromAPI(api, query));
                    const results = await Promise.allSettled(promises);
                    
                    let totalResults = 0;
                    results.forEach((result, index) => {
                        if (result.status === 'fulfilled' && result.value.length > 0) {
                            const addedCount = this.addStoriesToDisplay(result.value);
                            totalResults += addedCount;
                        }
                    });
                    
                    this.updateSearchInfo(`Found ${totalResults} stories for "${query}"`, true);
                    
                    if (totalResults === 0) {
                        this.showNoResults(query);
                    }
                    
                } catch (error) {
                    console.error('Search error:', error);
                    this.showStatus('Search failed. Please try again.', 'error');
                } finally {
                    this.isLoading = false;
                    this.hideAutoLoadIndicator();
                }
            }

            clearSearch() {
                this.searchQuery = '';
                this.clearStories();
                this.updateSearchInfo('Resuming continuous loading...');
                this.startContinuousLoading();
            }

            loadMoreStories() {
                if (this.searchQuery) {
                    this.searchAllAPIs(this.searchQuery);
                } else {
                    this.loadStoriesFromAllAPIs();
                }
            }

            previewStory(storyId) {
                const storyElement = document.querySelector(`[data-story-data*='"id":"${storyId}"']`);
                if (storyElement) {
                    const story = JSON.parse(storyElement.dataset.storyData);
                    this.showStatus(`Preview: "${story.title}" by ${story.author} - ${story.genre}`, 'success');
                    storyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            readStory(storyId) {
                const storyElement = document.querySelector(`[data-story-data*='"id":"${storyId}"']`);
                if (storyElement) {
                    const story = JSON.parse(storyElement.dataset.storyData);
                    this.openStoryReader(story);
                }
            }

            openStoryReader(story) {
                const overlay = document.getElementById('story-overlay');
                const title = document.getElementById('reader-title');
                const content = document.getElementById('reader-content');
                
                title.textContent = story.title;
                content.innerHTML = story.content;
                
                overlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                this.showStatus(`Reading: "${story.title}"`, 'success');
            }

            closeStoryReader() {
                const overlay = document.getElementById('story-overlay');
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            clearStories() {
                document.getElementById('storiesContainer').innerHTML = '';
                this.stories.clear();
                this.storyCounter = 0;
                this.updateStoryCounter();
            }

            showNoResults(query) {
                const container = document.getElementById('storiesContainer');
                container.innerHTML = `
                    <div class="col-12">
                        <div class="no-results">
                            <i class="fas fa-search"></i>
                            <h3>No stories found for "${query}"</h3>
                            <p>Try searching with different keywords or clear the search to resume auto-loading.</p>
                        </div>
                    </div>
                `;
            }

            updateSearchInfo(message, isActive = false) {
                const searchInfo = document.getElementById('search-info');
                searchInfo.textContent = message;
                searchInfo.className = isActive ? 'search-info active' : 'search-info';
            }

            updateStoryCounter() {
                document.getElementById('story-count').textContent = this.storyCounter;
            }

            showAutoLoadIndicator() {
                document.getElementById('auto-load-indicator').style.display = 'block';
            }

            hideAutoLoadIndicator() {
                document.getElementById('auto-load-indicator').style.display = 'none';
            }

            showStatus(message, type = 'success') {
                const indicator = document.getElementById('status-indicator');
                const icons = {
                    success: 'check',
                    warning: 'exclamation-triangle',
                    error: 'times'
                };
                
                indicator.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${message}`;
                indicator.className = `status-indicator ${type}`;
                indicator.classList.add('show');
                
                setTimeout(() => {
                    indicator.classList.remove('show');
                }, 3000);
            }

            truncateText(text, length) {
                if (!text) return 'N/A';
                return text.length > length ? text.substring(0, length) + '...' : text;
            }

            throttle(func, delay) {
                let timeoutId;
                let lastExecTime = 0;
                return function (...args) {
                    const currentTime = Date.now();
                    
                    if (currentTime - lastExecTime > delay) {
                        func.apply(this, args);
                        lastExecTime = currentTime;
                    } else {
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => {
                            func.apply(this, args);
                            lastExecTime = Date.now();
                        }, delay - (currentTime - lastExecTime));
                    }
                };
            }
        }

        // Initialize the platform immediately
        const storyPlatform = new UnlimitedStoryPlatform();

        // Prevent right-click (optional)
        document.addEventListener('contextmenu', e => e.preventDefault());
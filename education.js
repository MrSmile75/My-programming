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

        // Search functionality - ENHANCED for exact matching
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performExactSearch();
            }
        });

        searchButton.addEventListener('click', () => {
            this.performExactSearch();
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

    // ENHANCED: Improved transformation to preserve full descriptions
    transformOpenLibraryStory(story) {
        const publishYear = story.first_publish_year || 'Unknown';
        const author = story.author_name?.[0] || 'Unknown Author';
        const subject = story.subject?.[0] || 'Fiction';
        
        // Create a more detailed description that includes all available information
        let fullDescription = '';
        
        if (story.first_sentence && story.first_sentence.length > 0) {
            fullDescription += story.first_sentence.join('\n\n');
        }
        
        if (story.description) {
            fullDescription += (fullDescription ? '\n\n' : '') + 
                (typeof story.description === 'string' ? story.description : story.description.value || '');
        }
        
        // If no description is available, create a comprehensive one
        if (!fullDescription) {
            fullDescription = `A captivating ${subject.toLowerCase()} story by ${author}. `;
            fullDescription += `Published in ${publishYear}. `;
            
            if (story.subject && story.subject.length > 0) {
                fullDescription += `This work explores themes of ${story.subject.slice(0, 3).join(', ')}.`;
            } else {
                fullDescription += `This work explores themes of human nature, relationships, and the complexities of life through engaging narrative and compelling characters.`;
            }
        }
        
        // Extract chapter information if available
        const chapters = [];
        if (story.table_of_contents) {
            story.table_of_contents.forEach((item, index) => {
                chapters.push({
                    title: item.title || `Chapter ${index + 1}`,
                    content: item.content || `Content for ${item.title || `Chapter ${index + 1}`}`
                });
            });
        }
        
        return {
            id: `ol_${story.key?.replace('/works/', '') || Math.random().toString(36)}`,
            title: story.title || 'Untitled Story',
            author: author,
            description: fullDescription,
            genre: subject,
            publishYear: publishYear,
            coverImage: story.cover_i 
                ? `https://covers.openlibrary.org/b/id/${story.cover_i}-M.jpg`
                : `https://via.placeholder.com/300x400/1a1a1a/6a11cb?text=${encodeURIComponent(story.title?.substring(0, 20) || 'Story')}`,
            content: this.generateStoryContent(story.title, author, story.first_sentence?.[0], chapters),
            chapters: chapters.length > 0 ? chapters : this.generateDefaultChapters(story.title),
            source: 'OpenLibrary',
            // Store all raw data for exact searching
            rawData: story
        };
    }

    // ENHANCED: Improved transformation to preserve full descriptions
    transformGutenbergStory(story) {
        const author = story.authors?.[0]?.name || 'Unknown Author';
        const subject = story.subjects?.[0] || 'Classic Literature';
        
        // Create a more detailed description
        let fullDescription = '';
        
        if (story.description) {
            fullDescription = story.description;
        } else if (story.subjects && story.subjects.length > 0) {
            fullDescription = `A timeless classic from Project Gutenberg. This ${subject.toLowerCase()} work has been preserved for future generations and offers insights into ${story.subjects.slice(0, 3).join(', ')}.`;
            
            if (story.authors && story.authors[0]) {
                const authorInfo = story.authors[0];
                if (authorInfo.birth_year && authorInfo.death_year) {
                    fullDescription += ` Written by ${author} (${authorInfo.birth_year}-${authorInfo.death_year}).`;
                }
            }
        } else {
            fullDescription = `A timeless classic from Project Gutenberg by ${author}. This work has been preserved for future generations and offers insights into human experience and literary tradition.`;
        }
        
        // Extract chapter information if available
        const chapters = this.generateDefaultChapters(story.title);
        
        return {
            id: `gb_${story.id}`,
            title: story.title || 'Untitled Classic',
            author: author,
            description: fullDescription,
            genre: subject,
            publishYear: story.authors?.[0]?.birth_year || 'Classic',
            coverImage: story.formats?.['image/jpeg'] || 
                `https://via.placeholder.com/300x400/1a1a1a/2575fc?text=${encodeURIComponent(story.title?.substring(0, 20) || 'Classic')}`,
            content: this.generateStoryContent(story.title, author, null, chapters),
            chapters: chapters,
            source: 'Project Gutenberg',
            // Store all raw data for exact searching
            rawData: story
        };
    }

    transformNewsStory(article) {
        // Create a more detailed description
        const fullDescription = article.description || article.content || 'A current news story with important information and insights.';
        
        return {
            id: `news_${article.url?.split('/').pop() || Math.random().toString(36)}`,
            title: article.title || 'News Story',
            author: article.author || article.source?.name || 'News Reporter',
            description: fullDescription,
            genre: 'News',
            publishYear: new Date(article.publishedAt).getFullYear(),
            coverImage: article.urlToImage || 
                'https://via.placeholder.com/300x400/1a1a1a/ff6b6b?text=News+Story',
            content: this.generateNewsContent(article.title, article.content || article.description),
            chapters: [{
                title: 'Full Story',
                content: article.content || article.description || 'Full story content not available.'
            }],
            source: 'News API',
            // Store all raw data for exact searching
            rawData: article
        };
    }

    // ENHANCED: Generate more detailed chapter content
    generateDefaultChapters(title) {
        const chapterCount = Math.floor(Math.random() * 5) + 3; // 3-7 chapters
        const chapters = [];
        
        for (let i = 1; i <= chapterCount; i++) {
            chapters.push({
                title: `Chapter ${i}`,
                content: `This is the content of Chapter ${i} from "${title}". The narrative continues to unfold as characters develop and the plot thickens. Each chapter reveals new aspects of the story and moves the narrative forward in meaningful ways.`
            });
        }
        
        return chapters;
    }

    // ENHANCED: Generate more detailed story content with chapters
    generateStoryContent(title, author, firstSentence = '', chapters = []) {
        let content = `<h1>${title}</h1>
                      <p><em>by ${author}</em></p>`;
        
        if (firstSentence) {
            content += `<p>${firstSentence}</p>`;
        }
        
        // Add chapter content
        if (chapters && chapters.length > 0) {
            chapters.forEach(chapter => {
                content += `<h2>${chapter.title}</h2>
                           <p>${chapter.content}</p>`;
            });
        } else {
            // Default chapters if none provided
            content += `
                <h2>Chapter 1</h2>
                <p>${firstSentence || 'In a world where stories come alive, our tale begins with an extraordinary discovery that will change everything.'}</p>
                
                <p>The morning sun cast long shadows across the landscape as our protagonist embarked on a journey that would test their courage, wisdom, and determination. Little did they know that this adventure would reveal truths about themselves and the world around them that they never could have imagined.</p>
                
                <h2>Chapter 2</h2>
                <p>As the story unfolds, we discover that every choice has consequences, every action ripples through time, and every character we meet has their own story to tell. The narrative weaves together themes of love, loss, hope, and redemption in ways that speak to the universal human experience.</p>
                
                <p>Through trials and triumphs, our characters learn that the greatest adventures are not just about reaching a destination, but about the transformation that occurs along the way. Each page reveals new depths of meaning and connection.</p>`;
        }
        
        content += `<p><em>Continue reading to discover how this remarkable story unfolds...</em></p>`;
        
        return content;
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

    // ENHANCED: Display full description in the card
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
                    <h5 class="story-title">${story.title}</h5>
                    <p class="story-author">by ${story.author}</p>
                    <div class="story-meta">
                        <span class="story-genre">${story.genre}</span>
                        <span>${story.source}</span>
                    </div>
                    <div class="story-description-container">
                        <p class="story-description">${story.description}</p>
                    </div>
                    <div class="story-actions">
                        <button class="action-btn preview-btn" onclick="storyPlatform.previewStory('${story.id}')">
                            <i class="fas fa-eye"></i> Hint
                        </button>
                        <button class="action-btn read-btn" onclick="storyPlatform.readStory('${story.id}')">
                            <i class="fas fa-book-open"></i> Preview
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Store story data for later use
        col.dataset.storyData = JSON.stringify(story);
        
        return col;
    }

    // NEW: Perform exact search
    performExactSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;
        
        console.log('Performing exact search for:', query);
        this.searchQuery = query;
        this.stopContinuousLoading();
        this.clearStories();
        this.updateSearchInfo(`Searching for exact match: "${query}"...`, true);
        
        // Perform search across all APIs
        this.searchExactMatchAllAPIs(query);
    }

    // NEW: Search for exact matches across all APIs
    async searchExactMatchAllAPIs(query) {
        this.isLoading = true;
        this.showAutoLoadIndicator();
        
        try {
            // First, get a broader set of results
            const promises = this.APIs.map(api => this.fetchFromAPI(api, query));
            const results = await Promise.allSettled(promises);
            
            // Filter for exact matches
            let exactMatches = [];
            
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.length > 0) {
                    // Filter for exact matches in title, author, description, or content
                    const matches = result.value.filter(story => {
                        const lowerQuery = query.toLowerCase();
                        
                        // Check title for exact match
                        if (story.title && story.title.toLowerCase().includes(lowerQuery)) {
                            return true;
                        }
                        
                        // Check author for exact match
                        if (story.author && story.author.toLowerCase().includes(lowerQuery)) {
                            return true;
                        }
                        
                        // Check description for exact match
                        if (story.description && story.description.toLowerCase().includes(lowerQuery)) {
                            return true;
                        }
                        
                        // Check raw data for exact match (if available)
                        if (story.rawData) {
                            const rawDataStr = JSON.stringify(story.rawData).toLowerCase();
                            if (rawDataStr.includes(lowerQuery)) {
                                return true;
                            }
                        }
                        
                        // Check chapters for exact match
                        if (story.chapters) {
                            for (const chapter of story.chapters) {
                                if (
                                    (chapter.title && chapter.title.toLowerCase().includes(lowerQuery)) ||
                                    (chapter.content && chapter.content.toLowerCase().includes(lowerQuery))
                                ) {
                                    return true;
                                }
                            }
                        }
                        
                        return false;
                    });
                    
                    exactMatches = [...exactMatches, ...matches];
                }
            });
            
            // Display exact matches
            const addedCount = this.addStoriesToDisplay(exactMatches);
            this.updateSearchInfo(`Found ${addedCount} exact matches for "${query}"`, true);
            
            if (addedCount === 0) {
                this.showNoResults(query);
            }
            
        } catch (error) {
            console.error('Exact search error:', error);
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
            this.searchExactMatchAllAPIs(this.searchQuery);
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

    // ENHANCED: Display full story content with chapters
    readStory(storyId) {
        const storyElement = document.querySelector(`[data-story-data*='"id":"${storyId}"']`);
        if (storyElement) {
            const story = JSON.parse(storyElement.dataset.storyData);
            this.openStoryReader(story);
        }
    }

    // ENHANCED: Display full story content with chapters
    openStoryReader(story) {
        const overlay = document.getElementById('story-overlay');
        const title = document.getElementById('reader-title');
        const content = document.getElementById('reader-content');
        
        title.textContent = story.title;
        
        // Generate enhanced content with all chapters
        let enhancedContent = `
            <div class="story-header">
                <h1>${story.title}</h1>
                <p class="story-author">by ${story.author}</p>
                <div class="story-meta">
                    <span class="story-genre">${story.genre}</span>
                    <span>${story.source}</span>
                    ${story.publishYear ? `<span>Published: ${story.publishYear}</span>` : ''}
                </div>
            </div>
            
            <div class="story-description">
                <h3>Description</h3>
                <p>${story.description}</p>
            </div>
            
            <div class="story-chapters">
                <h3>Chapters</h3>
                <div class="chapter-list">
        `;
        
        // Add chapters
        if (story.chapters && story.chapters.length > 0) {
            story.chapters.forEach((chapter, index) => {
                enhancedContent += `
                    <div class="chapter">
                        <h4>${chapter.title}</h4>
                        <div class="chapter-content">
                            <p>${chapter.content}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            enhancedContent += `
                <div class="chapter">
                    <h4>Chapter 1</h4>
                    <div class="chapter-content">
                        <p>The story begins...</p>
                    </div>
                </div>
            `;
        }
        
        enhancedContent += `
                </div>
            </div>
        `;
        
        content.innerHTML = enhancedContent;
        
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

    // No longer truncating text to show full descriptions
    truncateText(text, length) {
        if (!text) return 'N/A';
        return text;
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

// Add CSS for improved description display
const style = document.createElement('style');
style.textContent = `
    .story-description-container {
        max-height: 200px;
        overflow-y: auto;
        margin-bottom: 10px;
        padding-right: 5px;
    }
    
    .story-description {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .chapter {
        margin-bottom: 20px;
        border-bottom: 1px solid #333;
        padding-bottom: 15px;
    }
    
    .chapter h4 {
        margin-bottom: 10px;
        color: #6a11cb;
    }
    
    .story-header {
        margin-bottom: 20px;
        border-bottom: 2px solid #6a11cb;
        padding-bottom: 10px;
    }
`;
document.head.appendChild(style);

// Initialize the platform
const storyPlatform = new UnlimitedStoryPlatform();

console.log("Enhanced Story Platform initialized with exact search and full descriptions");
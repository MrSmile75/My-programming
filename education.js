       class InfiniteStoryHub {
            constructor() {
                // Configuration
                this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
                this.REQUEST_DELAY = 800; // 800ms between requests
                this.MAX_RETRIES = 3;
                this.AUTO_LOAD_INTERVAL = 4000; // Load new books every 4 seconds
                this.BOOKS_PER_LOAD = 15; // Number of books to load per batch
                
                // API Configuration
                this.APIs = {
                    openLibrary: {
                        name: 'Open Library',
                        searchUrl: 'https://openlibrary.org/search.json',
                        embedUrl: 'https://openlibrary.org/embed',
                        transform: this.transformOpenLibraryBook.bind(this),
                        status: 'ready',
                        currentPage: 1
                    },
                    internetArchive: {
                        name: 'Internet Archive',
                        searchUrl: 'https://archive.org/advancedsearch.php',
                        transform: this.transformInternetArchiveBook.bind(this),
                        status: 'ready',
                        currentPage: 1
                    },
                    gutenberg: {
                        name: 'Project Gutenberg',
                        searchUrl: 'https://gutendex.com/books',
                        transform: this.transformGutenbergBook.bind(this),
                        status: 'ready',
                        currentPage: 1
                    }
                };
                
                // Popular search topics for infinite loading
                this.searchTopics = [
                    'fiction', 'adventure', 'mystery', 'romance', 'fantasy', 'science',
                    'history', 'biography', 'drama', 'comedy', 'thriller', 'horror',
                    'poetry', 'philosophy', 'art', 'music', 'travel', 'nature',
                    'technology', 'space', 'ocean', 'mountain', 'forest', 'city',
                    'love', 'friendship', 'family', 'courage', 'hope', 'dreams',
                    'classic', 'literature', 'novel', 'story', 'tale', 'book',
                    'education', 'learning', 'knowledge', 'wisdom', 'culture',
                    'society', 'human', 'life', 'world', 'universe', 'earth'
                ];
                
                // State management
                this.cache = new Map();
                this.lastRequestTime = 0;
                this.isLoading = false;
                this.allBooks = new Map(); // All loaded books
                this.searchResults = new Map(); // Search-specific results
                this.currentBook = null;
                this.bookCount = 0;
                this.currentTopicIndex = 0;
                this.autoLoadTimer = null;
                this.isSearchMode = false;
                
                // Initialize
                this.init();
            }

            async init() {
                console.log('🚀 Initializing Infinite Story Hub...');
                this.setupEventListeners();
                this.createStarBackground();
                this.updateAPIStatus();
                this.startInfiniteLoading();
                console.log('✅ Infinite Story Hub initialized successfully!');
            }

            setupEventListeners() {
                // Search functionality
                const searchInput = document.getElementById('searchInput');
                const searchButton = document.getElementById('searchButton');

                if (searchInput && searchButton) {
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
                }

                // Modal event listeners
                this.setupModalEventListeners();

                // Embed reader event listeners
                const embedCloseBtn = document.getElementById('embed-close-btn');
                if (embedCloseBtn) {
                    embedCloseBtn.addEventListener('click', () => this.closeEmbedReader());
                }

                // Infinite scroll
                window.addEventListener('scroll', this.throttle(() => {
                    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                        if (!this.isSearchMode) {
                            this.loadMoreBooks();
                        }
                    }
                }, 1000));

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.closeReadOptions();
                        this.closeEmbedReader();
                        this.backToStories();
                    }
                });
            }

            setupModalEventListeners() {
                const closeModalBtn = document.getElementById('close-read-options');
                const modalOverlay = document.getElementById('read-options-modal-overlay');
                const readEmbedBtn = document.getElementById('read-embed-btn');
                const readSourceBtn = document.getElementById('read-source-btn');
                const readWebBtn = document.getElementById('read-web-btn');
                const readArchiveBtn = document.getElementById('read-archive-btn');

                if (closeModalBtn) {
                    closeModalBtn.addEventListener('click', () => this.closeReadOptions());
                }

                if (modalOverlay) {
                    modalOverlay.addEventListener('click', (e) => {
                        if (e.target === modalOverlay) {
                            this.closeReadOptions();
                        }
                    });
                }

                if (readEmbedBtn) {
                    readEmbedBtn.addEventListener('click', () => this.readWithEmbed());
                }

                if (readSourceBtn) {
                    readSourceBtn.addEventListener('click', () => this.readFromSource());
                }

                if (readWebBtn) {
                    readWebBtn.addEventListener('click', () => this.readOnWeb());
                }

                if (readArchiveBtn) {
                    readArchiveBtn.addEventListener('click', () => this.readFromArchive());
                }
            }

            createStarBackground() {
                const starField = document.getElementById('starField');
                if (!starField) return;

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

            startInfiniteLoading() {
                console.log('📚 Starting infinite book loading...');
                this.updateSearchInfo('Continuously loading books from all sources...');
                
                // Load initial batch
                this.loadBooksFromAllAPIs();
                
                // Set up continuous loading
                this.autoLoadTimer = setInterval(() => {
                    if (!this.isSearchMode && !this.isLoading) {
                        this.loadBooksFromAllAPIs();
                    }
                }, this.AUTO_LOAD_INTERVAL);
            }

            stopInfiniteLoading() {
                if (this.autoLoadTimer) {
                    clearInterval(this.autoLoadTimer);
                    this.autoLoadTimer = null;
                }
            }

            async loadBooksFromAllAPIs() {
                if (this.isLoading) return;
                
                this.isLoading = true;
                this.showAutoLoadIndicator(true);
                
                try {
                    // Get current search topic for variety
                    const topic = this.searchTopics[this.currentTopicIndex];
                    this.currentTopicIndex = (this.currentTopicIndex + 1) % this.searchTopics.length;
                    
                    // Load from multiple APIs simultaneously
                    const promises = [
                        this.loadFromOpenLibrary(topic),
                        this.loadFromInternetArchive(topic),
                        this.loadFromGutenberg(topic)
                    ];
                    
                    const results = await Promise.allSettled(promises);
                    
                    let newBooksCount = 0;
                    results.forEach((result, index) => {
                        const apiKeys = ['openLibrary', 'internetArchive', 'gutenberg'];
                        const apiKey = apiKeys[index];
                        
                        if (result.status === 'fulfilled' && result.value.length > 0) {
                            const addedCount = this.addBooksToDisplay(result.value);
                            newBooksCount += addedCount;
                            this.setAPIStatus(apiKey, 'active');
                            console.log(`📖 Loaded ${addedCount} books from ${this.APIs[apiKey].name}`);
                        } else {
                            this.setAPIStatus(apiKey, 'error');
                        }
                    });
                    
                    if (newBooksCount > 0) {
                        this.showStatus(`Loaded ${newBooksCount} new books`, 'success');
                    }
                    
                } catch (error) {
                    console.error('❌ Error loading books:', error);
                    this.showStatus('Error loading some books', 'warning');
                } finally {
                    this.isLoading = false;
                    this.showAutoLoadIndicator(false);
                }
            }

            async loadFromOpenLibrary(query) {
                try {
                    this.setAPIStatus('openLibrary', 'loading');
                    const page = this.APIs.openLibrary.currentPage;
                    const url = `${this.APIs.openLibrary.searchUrl}?q=${encodeURIComponent(query)}&limit=${this.BOOKS_PER_LOAD}&page=${page}`;
                    const response = await this.makeAPIRequest(url);
                    
                    this.APIs.openLibrary.currentPage++;
                    
                    if (response.docs && response.docs.length > 0) {
                        return response.docs.map(this.APIs.openLibrary.transform).filter(book => book.title);
                    }
                    return [];
                } catch (error) {
                    console.error('❌ Open Library loading error:', error);
                    this.setAPIStatus('openLibrary', 'error');
                    return [];
                }
            }

            async loadFromInternetArchive(query) {
                try {
                    this.setAPIStatus('internetArchive', 'loading');
                    const page = this.APIs.internetArchive.currentPage;
                    const url = `${this.APIs.internetArchive.searchUrl}?q=${encodeURIComponent(query)}&fl=identifier,title,creator,description,date,subject&rows=${this.BOOKS_PER_LOAD}&page=${page}&output=json`;
                    const response = await this.makeAPIRequest(url);
                    
                    this.APIs.internetArchive.currentPage++;
                    
                    if (response.response && response.response.docs && response.response.docs.length > 0) {
                        return response.response.docs.map(this.APIs.internetArchive.transform).filter(book => book.title);
                    }
                    return [];
                } catch (error) {
                    console.error('❌ Internet Archive loading error:', error);
                    this.setAPIStatus('internetArchive', 'error');
                    return [];
                }
            }

            async loadFromGutenberg(query) {
                try {
                    this.setAPIStatus('gutenberg', 'loading');
                    const page = this.APIs.gutenberg.currentPage;
                    const url = `${this.APIs.gutenberg.searchUrl}?search=${encodeURIComponent(query)}&page=${page}`;
                    const response = await this.makeAPIRequest(url);
                    
                    this.APIs.gutenberg.currentPage++;
                    
                    if (response.results && response.results.length > 0) {
                        return response.results.map(this.APIs.gutenberg.transform).filter(book => book.title);
                    }
                    return [];
                } catch (error) {
                    console.error('❌ Project Gutenberg loading error:', error);
                    this.setAPIStatus('gutenberg', 'error');
                    return [];
                }
            }

            async performExactSearch() {
                const searchInput = document.getElementById('searchInput');
                if (!searchInput) return;

                const query = searchInput.value.trim();
                if (!query) {
                    this.showStatus('Please enter a search term', 'warning');
                    return;
                }
                
                console.log(`🔍 Performing exact search for: "${query}"`);
                this.isSearchMode = true;
                this.stopInfiniteLoading();
                this.clearResults();
                this.showLoading(true);
                this.updateSearchInfo(`Searching for exact matches: "${query}"...`, true);
                
                try {
                    // Search all APIs simultaneously
                    const searchPromises = [
                        this.searchOpenLibrary(query),
                        this.searchInternetArchive(query),
                        this.searchGutenberg(query)
                    ];

                    const results = await Promise.allSettled(searchPromises);
                    let totalResults = 0;

                    results.forEach((result, index) => {
                        const apiKeys = ['openLibrary', 'internetArchive', 'gutenberg'];
                        const apiKey = apiKeys[index];
                        
                        if (result.status === 'fulfilled' && result.value.length > 0) {
                            this.displaySearchResults(result.value);
                            totalResults += result.value.length;
                            this.setAPIStatus(apiKey, 'active');
                        } else {
                            this.setAPIStatus(apiKey, 'error');
                        }
                    });

                    if (totalResults === 0) {
                        this.showNoResults(query);
                    } else {
                        this.updateSearchInfo(`Found ${totalResults} exact matches for "${query}"`, true);
                        this.showStatus(`Found ${totalResults} books matching "${query}"`, 'success');
                    }

                } catch (error) {
                    console.error('❌ Search error:', error);
                    this.showStatus('Search failed. Please try again.', 'error');
                } finally {
                    this.showLoading(false);
                }
            }

            clearSearch() {
                this.isSearchMode = false;
                this.searchResults.clear();
                this.clearResults();
                this.updateSearchInfo('Resuming continuous book loading...');
                this.startInfiniteLoading();
            }

            loadMoreBooks() {
                if (!this.isLoading && !this.isSearchMode) {
                    this.loadBooksFromAllAPIs();
                }
            }

            async searchOpenLibrary(query) {
                try {
                    this.setAPIStatus('openLibrary', 'loading');
                    const url = `${this.APIs.openLibrary.searchUrl}?q=${encodeURIComponent(query)}&limit=20`;
                    const response = await this.makeAPIRequest(url);
                    
                    if (response.docs && response.docs.length > 0) {
                        const exactMatches = response.docs.filter(book => 
                            this.isExactMatch(book.title, query) || 
                            this.isExactMatch(book.author_name?.[0], query) ||
                            (book.subject && book.subject.some(subject => this.isExactMatch(subject, query)))
                        );
                        
                        return exactMatches.map(this.APIs.openLibrary.transform);
                    }
                    return [];
                } catch (error) {
                    console.error('❌ Open Library search error:', error);
                    this.setAPIStatus('openLibrary', 'error');
                    return [];
                }
            }

            async searchInternetArchive(query) {
                try {
                    this.setAPIStatus('internetArchive', 'loading');
                    const url = `${this.APIs.internetArchive.searchUrl}?q=${encodeURIComponent(query)}&fl=identifier,title,creator,description,date,subject&rows=20&page=1&output=json`;
                    const response = await this.makeAPIRequest(url);
                    
                    if (response.response && response.response.docs && response.response.docs.length > 0) {
                        const exactMatches = response.response.docs.filter(book => 
                            this.isExactMatch(book.title, query) || 
                            this.isExactMatch(book.creator, query) ||
                            (book.subject && book.subject.some && book.subject.some(subject => this.isExactMatch(subject, query)))
                        );
                        
                        return exactMatches.map(this.APIs.internetArchive.transform);
                    }
                    return [];
                } catch (error) {
                    console.error('❌ Internet Archive search error:', error);
                    this.setAPIStatus('internetArchive', 'error');
                    return [];
                }
            }

            async searchGutenberg(query) {
                try {
                    this.setAPIStatus('gutenberg', 'loading');
                    const url = `${this.APIs.gutenberg.searchUrl}?search=${encodeURIComponent(query)}`;
                    const response = await this.makeAPIRequest(url);
                    
                    if (response.results && response.results.length > 0) {
                        const exactMatches = response.results.filter(book => 
                            this.isExactMatch(book.title, query) || 
                            (book.authors && book.authors.some(author => this.isExactMatch(author.name, query))) ||
                            (book.subjects && book.subjects.some(subject => this.isExactMatch(subject, query)))
                        );
                        
                        return exactMatches.map(this.APIs.gutenberg.transform);
                    }
                    return [];
                } catch (error) {
                    console.error('❌ Project Gutenberg search error:', error);
                    this.setAPIStatus('gutenberg', 'error');
                    return [];
                }
            }

            isExactMatch(text, query) {
                if (!text || !query) return false;
                return text.toLowerCase().includes(query.toLowerCase());
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
                        console.error(`❌ Attempt ${attempt} failed for ${url}:`, error);
                        if (attempt === this.MAX_RETRIES) {
                            throw error;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }

            transformOpenLibraryBook(book) {
                const author = book.author_name?.[0] || 'Unknown Author';
                const publishYear = book.first_publish_year || 'Unknown';
                const subject = book.subject?.[0] || 'General';
                
                let description = '';
                if (book.first_sentence && book.first_sentence.length > 0) {
                    description = book.first_sentence.join(' ');
                } else {
                    description = `A book by ${author}, published in ${publishYear}. Subject: ${subject}.`;
                }

                return {
                    id: `ol_${book.key?.replace('/works/', '') || Math.random().toString(36)}`,
                    title: book.title || 'Untitled',
                    author: author,
                    description: description,
                    genre: subject,
                    publishYear: publishYear,
                    coverImage: book.cover_i 
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : `https://via.placeholder.com/300x400/1a1a1a/6a11cb?text=${encodeURIComponent(book.title?.substring(0, 20) || 'Book')}`,
                    source: 'Open Library',
                    sourceUrl: book.key ? `https://openlibrary.org${book.key}` : null,
                    embedUrl: book.key ? `https://openlibrary.org/embed${book.key}` : null,
                    archiveUrl: null,
                    rawData: book
                };
            }

            transformInternetArchiveBook(book) {
                const author = book.creator || 'Unknown Author';
                const publishYear = book.date || 'Unknown';
                const subject = Array.isArray(book.subject) ? book.subject[0] : (book.subject || 'Archive');
                
                const description = book.description || `An archived work by ${author}. Available through Internet Archive.`;

                return {
                    id: `ia_${book.identifier}`,
                    title: book.title || 'Untitled Archive',
                    author: author,
                    description: description,
                    genre: subject,
                    publishYear: publishYear,
                    coverImage: `https://archive.org/services/img/${book.identifier}`,
                    source: 'Internet Archive',
                    sourceUrl: `https://archive.org/details/${book.identifier}`,
                    embedUrl: `https://archive.org/embed/${book.identifier}`,
                    archiveUrl: `https://archive.org/details/${book.identifier}`,
                    rawData: book
                };
            }

            transformGutenbergBook(book) {
                const author = book.authors?.[0]?.name || 'Unknown Author';
                const subject = book.subjects?.[0] || 'Classic Literature';
                const publishYear = book.authors?.[0]?.birth_year || 'Classic';
                
                const description = `A classic work from Project Gutenberg by ${author}. ${book.subjects ? 'Subjects: ' + book.subjects.slice(0, 3).join(', ') + '.' : ''}`;

                return {
                    id: `gb_${book.id}`,
                    title: book.title || 'Untitled Classic',
                    author: author,
                    description: description,
                    genre: subject,
                    publishYear: publishYear,
                    coverImage: book.formats?.['image/jpeg'] || 
                        `https://via.placeholder.com/300x400/1a1a1a/2575fc?text=${encodeURIComponent(book.title?.substring(0, 20) || 'Classic')}`,
                    source: 'Project Gutenberg',
                    sourceUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
                    embedUrl: null,
                    archiveUrl: null,
                    textUrl: book.formats?.['text/plain'] || book.formats?.['text/html'],
                    rawData: book
                };
            }

            addBooksToDisplay(books) {
                let addedCount = 0;
                
                books.forEach(book => {
                    if (!this.allBooks.has(book.id)) {
                        this.allBooks.set(book.id, book);
                        this.displaySingleBook(book);
                        addedCount++;
                        this.bookCount++;
                    }
                });
                
                this.updateBookCounter();
                return addedCount;
            }

            displaySearchResults(books) {
                books.forEach(book => {
                    if (!this.searchResults.has(book.id)) {
                        this.searchResults.set(book.id, book);
                        this.displaySingleBook(book);
                    }
                });
            }

            displaySingleBook(book) {
                const container = document.getElementById('storiesContainer');
                if (!container) return;

                const bookCard = this.createBookCard(book);
                container.appendChild(bookCard);
            }

            createBookCard(book) {
                const col = document.createElement('div');
                col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
                
                col.innerHTML = `
                    <div class="story-card fade-in">
                        <img src="${book.coverImage}" 
                             class="story-card-img" 
                             alt="${book.title} cover"
                             loading="lazy"
                             onerror="this.src='https://via.placeholder.com/300x400/1a1a1a/6a11cb?text=Book+Cover'">
                        <div class="story-card-body">
                            <h5 class="story-title">${book.title}</h5>
                            <p class="story-author">by ${book.author}</p>
                            <div class="story-meta">
                                <span class="story-genre">${book.genre}</span>
                                <span class="api-badge">${book.source}</span>
                            </div>
                            <div class="story-description-container">
                                <p class="story-description">${book.description}</p>
                            </div>
                            <div class="story-actions">
                                <button class="action-btn preview-btn" onclick="storyHub.previewBook('${book.id}')">
                                    <i class="fas fa-eye"></i> Preview
                                </button>
                                <button class="action-btn read-btn" onclick="storyHub.showReadOptions('${book.id}')">
                                    <i class="fas fa-book-open"></i> Read
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                col.dataset.bookData = JSON.stringify(book);
                return col;
            }

            showReadOptions(bookId) {
                const book = this.allBooks.get(bookId) || this.searchResults.get(bookId);
                if (!book) return;

                this.currentBook = book;
                
                // Set the book title in the modal
                const titleElement = document.getElementById('read-options-story-title');
                if (titleElement) {
                    titleElement.textContent = `"${book.title}"`;
                }
                
                // Show/hide options based on availability
                const embedBtn = document.getElementById('read-embed-btn');
                const archiveBtn = document.getElementById('read-archive-btn');
                
                if (embedBtn) {
                    embedBtn.style.display = book.embedUrl ? 'flex' : 'none';
                }
                
                if (archiveBtn) {
                    archiveBtn.style.display = book.archiveUrl ? 'flex' : 'none';
                }
                
                // Show the modal
                const modal = document.getElementById('read-options-modal-overlay');
                if (modal) {
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
                
                console.log(`📖 Showing read options for: ${book.title}`);
            }

            closeReadOptions() {
                const modal = document.getElementById('read-options-modal-overlay');
                if (modal) {
                    modal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
            }

            readWithEmbed() {
                if (!this.currentBook || !this.currentBook.embedUrl) {
                    this.showStatus('Embed reading not available for this book', 'warning');
                    return;
                }

                const embedReader = document.getElementById('embed-reader');
                const embedIframe = document.getElementById('embed-iframe');
                const embedTitle = document.getElementById('embed-reader-title');
                
                if (embedReader && embedIframe && embedTitle) {
                    embedTitle.textContent = `Reading: ${this.currentBook.title}`;
                    embedIframe.src = this.currentBook.embedUrl;
                    embedReader.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    
                    this.showStatus(`Opening embedded reader for "${this.currentBook.title}"`, 'success');
                    console.log(`📚 Opening embed reader: ${this.currentBook.embedUrl}`);
                }
                
                this.closeReadOptions();
            }

            closeEmbedReader() {
                const embedReader = document.getElementById('embed-reader');
                const embedIframe = document.getElementById('embed-iframe');
                
                if (embedReader) {
                    embedReader.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
                
                if (embedIframe) {
                    embedIframe.src = '';
                }
            }

            readFromSource() {
                if (!this.currentBook || !this.currentBook.sourceUrl) {
                    this.showStatus('Source URL not available', 'warning');
                    return;
                }

                window.open(this.currentBook.sourceUrl, '_blank');
                this.showStatus(`Opening "${this.currentBook.title}" from ${this.currentBook.source}`, 'success');
                console.log(`🔗 Opening source: ${this.currentBook.sourceUrl}`);
                this.closeReadOptions();
            }

            readFromArchive() {
                if (!this.currentBook || !this.currentBook.archiveUrl) {
                    this.showStatus('Archive URL not available', 'warning');
                    return;
                }

                window.open(this.currentBook.archiveUrl, '_blank');
                this.showStatus(`Opening "${this.currentBook.title}" from Internet Archive`, 'success');
                console.log(`🏛️ Opening archive: ${this.currentBook.archiveUrl}`);
                this.closeReadOptions();
            }

            readOnWeb() {
                if (!this.currentBook) return;

                this.openBookReadingPage(this.currentBook);
                this.closeReadOptions();
            }

            openBookReadingPage(book) {
                this.currentBook = book;
                
                // Hide main page and show reading page
                const mainPage = document.getElementById('main-page');
                const readingPage = document.getElementById('story-reading-page');
                
                if (mainPage) mainPage.style.display = 'none';
                if (readingPage) readingPage.classList.add('active');
                
                // Populate reading page with book data
                const elements = {
                    'reading-cover': book.coverImage,
                    'reading-title': book.title,
                    'reading-author': `by ${book.author}`,
                    'reading-genre': book.genre,
                    'reading-year': book.publishYear,
                    'reading-source': book.source,
                    'reading-description': book.description
                };

                Object.entries(elements).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        if (id === 'reading-cover') {
                            element.src = value;
                            element.alt = `${book.title} cover`;
                        } else {
                            element.textContent = value;
                        }
                    }
                });
                
                // Load content
                this.loadBookContent(book);
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                this.showStatus(`Reading "${book.title}" on web`, 'success');
                console.log(`📚 Opening book reading page for: ${book.title}`);
            }

            async loadBookContent(book) {
                const contentDiv = document.getElementById('reading-content');
                if (!contentDiv) return;

                contentDiv.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><div class="loading-text">Loading content...</div></div>';

                try {
                    let content = '';
                    
                    if (book.textUrl) {
                        // Try to fetch text content for Gutenberg books
                        try {
                            const response = await fetch(book.textUrl);
                            const text = await response.text();
                            content = this.formatTextContent(text);
                        } catch (error) {
                            console.error('Error fetching text content:', error);
                            content = this.generateSampleContent(book);
                        }
                    } else {
                        content = this.generateSampleContent(book);
                    }

                    contentDiv.innerHTML = content;
                } catch (error) {
                    console.error('Error loading book content:', error);
                    contentDiv.innerHTML = `
                        <div class="chapter">
                            <h3>Content Loading Error</h3>
                            <p>Unable to load the full content. Please try reading from the source or using the embed option.</p>
                            <p><strong>Available options:</strong></p>
                            <ul>
                                <li>Click "Back to Books" and try "Read from Source"</li>
                                <li>Use the embedded reader if available</li>
                                <li>Visit the Internet Archive link</li>
                            </ul>
                        </div>
                    `;
                }
            }

            formatTextContent(text) {
                // Basic text formatting for display
                const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
                let formattedContent = '';
                
                paragraphs.slice(0, 50).forEach((paragraph, index) => { // Limit to first 50 paragraphs
                    if (paragraph.trim().length > 0) {
                        if (paragraph.toUpperCase() === paragraph && paragraph.length < 100) {
                            // Likely a chapter title
                            formattedContent += `<h3>${paragraph.trim()}</h3>`;
                        } else {
                            formattedContent += `<p>${paragraph.trim()}</p>`;
                        }
                    }
                });

                if (paragraphs.length > 50) {
                    formattedContent += '<p><em>Content truncated. Please use "Read from Source" for the complete text.</em></p>';
                }

                return formattedContent || '<p>Content could not be formatted properly. Please try reading from the source.</p>';
            }

            generateSampleContent(book) {
                return `
                    <div class="chapter">
                        <h3>About This Book</h3>
                        <p><strong>${book.title}</strong> by ${book.author} is available through ${book.source}.</p>
                        <p>${book.description}</p>
                        <p><strong>Genre:</strong> ${book.genre}</p>
                        <p><strong>Published:</strong> ${book.publishYear}</p>
                        
                        <h3>Reading Options</h3>
                        <p>To read the complete content of this book, please use one of the following options:</p>
                        <ul>
                            <li><strong>Read from Source:</strong> Visit the original ${book.source} page</li>
                            ${book.embedUrl ? '<li><strong>Embedded Reader:</strong> Use the built-in reader for the best experience</li>' : ''}
                            ${book.archiveUrl ? '<li><strong>Internet Archive:</strong> Access the archived version with additional features</li>' : ''}
                        </ul>
                        
                        <p><em>This preview shows book information. The full content is available through the source links above.</em></p>
                    </div>
                `;
            }

            backToStories() {
                const mainPage = document.getElementById('main-page');
                const readingPage = document.getElementById('story-reading-page');
                
                if (mainPage) mainPage.style.display = 'block';
                if (readingPage) readingPage.classList.remove('active');
                
                console.log('🔙 Returning to book collection');
            }

            previewBook(bookId) {
                const book = this.allBooks.get(bookId) || this.searchResults.get(bookId);
                if (book) {
                    this.showStatus(`Preview: "${book.title}" by ${book.author} - ${book.genre} (${book.source})`, 'success');
                    
                    // Scroll to the book card
                    const bookElement = document.querySelector(`[data-book-data*='"id":"${bookId}"']`);
                    if (bookElement) {
                        bookElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }

            clearResults() {
                const container = document.getElementById('storiesContainer');
                if (container) {
                    container.innerHTML = '';
                }
                if (this.isSearchMode) {
                    this.searchResults.clear();
                } else {
                    this.allBooks.clear();
                    this.bookCount = 0;
                    this.updateBookCounter();
                }
            }

            showNoResults(query) {
                const container = document.getElementById('storiesContainer');
                if (container) {
                    container.innerHTML = `
                        <div class="col-12">
                            <div class="no-results">
                                <i class="fas fa-search"></i>
                                <h3>No exact matches found for "${query}"</h3>
                                <p>Try searching with different keywords or check your spelling.</p>
                                <p><strong>Search tips:</strong></p>
                                <ul style="text-align: left; display: inline-block;">
                                    <li>Try partial titles or author names</li>
                                    <li>Search by genre or subject</li>
                                    <li>Use simpler, more common terms</li>
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }

            updateSearchInfo(message, isActive = false) {
                const searchInfo = document.getElementById('search-info');
                if (searchInfo) {
                    searchInfo.textContent = message;
                    searchInfo.className = isActive ? 'search-info active' : 'search-info';
                }
            }

            updateBookCounter() {
                const counter = document.getElementById('book-count');
                if (counter) {
                    counter.textContent = this.bookCount;
                }
            }

            updateAPIStatus() {
                Object.keys(this.APIs).forEach(apiKey => {
                    const statusId = apiKey.toLowerCase().replace('library', 'library').replace('archive', 'archive');
                    const statusElement = document.getElementById(`${statusId}-status`);
                    if (statusElement) {
                        statusElement.className = `api-status ${this.APIs[apiKey].status}`;
                    }
                });
            }

            setAPIStatus(apiKey, status) {
                this.APIs[apiKey].status = status;
                const statusId = apiKey.toLowerCase().replace('library', 'library').replace('archive', 'archive');
                const statusElement = document.getElementById(`${statusId}-status`);
                if (statusElement) {
                    statusElement.className = `api-status ${status}`;
                }
            }

            showAutoLoadIndicator(show) {
                const indicator = document.getElementById('auto-load-indicator');
                if (indicator) {
                    if (show) {
                        indicator.classList.add('show');
                    } else {
                        indicator.classList.remove('show');
                    }
                }
            }

            showLoading(show) {
                const spinner = document.getElementById('loadingSpinner');
                if (spinner) {
                    spinner.style.display = show ? 'flex' : 'none';
                }
            }

            showStatus(message, type = 'success') {
                const indicator = document.getElementById('status-indicator');
                if (!indicator) return;

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
                }, 4000);
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

        // Initialize the Infinite Story Hub
        const storyHub = new InfiniteStoryHub();

        console.log("🚀 Discover and explore infinite Stories!");

           // Prevent right-click (optional)
        document.addEventListener('contextmenu', e => e.preventDefault());
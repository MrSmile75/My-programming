      /* © SMILEX - This code is licensed and protected. */
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
     /* © SMILEX - This code is licensed and protected. */


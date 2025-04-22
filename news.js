class NewsHub {
    constructor() {
        this.page = 1;
        this.isLoading = false;
        this.searchTerm = '';

        // DOM Elements
        this.newsContainer = document.getElementById('newsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.previewModal = document.getElementById('newsPreviewModal');
        this.previewContent = document.getElementById('previewContent');
        this.closePreviewBtn = document.getElementById('closePreviewBtn');

        this.initializeEventListeners();
        this.loadInitialNews();
        this.setupInfiniteScroll();
    }

    initializeEventListeners() {
        this.searchButton.addEventListener('click', () => this.searchNews());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchNews();
        });
        this.closePreviewBtn.addEventListener('click', () => this.closePreview());
    }

    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                this.loadMoreNews();
            }
        });
    }

    async loadInitialNews() {
        this.page = 1;
        await this.fetchNews();
    }

    async loadMoreNews() {
        if (!this.isLoading) {
            this.page++;
            await this.fetchNews(this.searchTerm);
        }
    }

    async searchNews() {
        this.searchTerm = this.searchInput.value;
        this.newsContainer.innerHTML = ''; // Clear previous results
        this.page = 1;
        await this.fetchNews(this.searchTerm);
    }

    async fetchNews(query = '') {
        this.isLoading = true;
        this.showLoadingSpinner();

        try {
            const apiKey = 'dcb071f269784ec280990d91a82ecc23'; // Replace with actual API key
            const url = `https://newsapi.org/v2/everything?q=${query || 'technology'}&page=${this.page}&pageSize=10&apiKey=${apiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();

            this.displayNews(data.articles);
        } catch (error) {
            console.error('News fetch error:', error);
            this.showErrorMessage();
        } finally {
            this.isLoading = false;
            this.hideLoadingSpinner();
        }
    }

    displayNews(articles) {
        articles.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.className = 'col-md-4';
            newsCard.innerHTML = `
                <div class="card news-card h-100">
                    <img 
                        src="${article.urlToImage || 'https://via.placeholder.com/350x200'}" 
                        class="card-img-top" 
                        alt="${article.title}"
                    >
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.description?.substring(0, 100) || 'No description available'}...</p>
                        <button class="btn btn-primary preview-btn" data-url="${article.url}">Preview</button>
                    </div>
                </div>
            `;

            // Add preview event listener
            const previewBtn = newsCard.querySelector('.preview-btn');
            previewBtn.addEventListener('click', () => this.showPreview(article));

            this.newsContainer.appendChild(newsCard);
        });
    }

    showPreview(article) {
        this.previewContent.innerHTML = `
            <h2>${article.title}</h2>
            <img 
                src="${article.urlToImage || 'https://via.placeholder.com/800x400'}" 
                class="img-fluid mb-3"
            >
            <p><strong>Source:</strong> ${article.source.name}</p>
            <p><strong>Published:</strong> ${new Date(article.publishedAt).toLocaleString()}</p>
            <p>${article.content || article.description}</p>
            <a href="${article.url}" target="_blank" class="btn btn-primary">Read Full Article</a>
        `;
        this.previewModal.style.display = 'block';
    }

    closePreview() {
        this.previewModal.style.display = 'none';
    }

    showLoadingSpinner() {
        this.loadingSpinner.style.display = 'block';
    }

    hideLoadingSpinner() {
        this.loadingSpinner.style.display = 'none';
    }

    showErrorMessage() {
        this.newsContainer.innerHTML = `
            <div class="col-12 text-center">
                <h3>Unable to fetch news. Please try again later.</h3>
            </div>
        `;
    }
}

// Initialize the News Hub
document.addEventListener('DOMContentLoaded', () => {
    new NewsHub();
});
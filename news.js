class NewsPreloader {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.startLoading();
    }

    initializeElements() {
        this.preloader = document.getElementById('preloader');
        this.mainContent = document.getElementById('main-content');
        this.progressBar = document.querySelector('.progress-bar');
        this.loadingText = document.querySelector('.loading-text');
        this.errorOverlay = document.getElementById('error-overlay');
        this.retryButton = document.getElementById('retry-btn');
    }

    setupEventListeners() {
        this.retryButton.addEventListener('click', () => this.retryLoading());
    }

    createLoadingStages() {
        return [
            { 
                text: 'Connecting to News Networks', 
                progress: 20,
                duration: 1000 
            },
            { 
                text: 'Fetching Breaking News', 
                progress: 40,
                duration: 1400 
            },
            { 
                text: 'Updating Global Headlines', 
                progress: 60,
                duration: 1800 
            },
            { 
                text: 'Preparing News Feed', 
                progress: 80,
                duration: 2300 
            },
            { 
                text: 'News Ready', 
                progress: 100,
                duration: 2900 
            }
        ];
    }

    async startLoading() {
        try {
            await this.simulateLoading();
            this.completeLoading();
        } catch (error) {
            this.handleLoadingError(error);
        }
    }

    simulateLoading() {
        const stages = this.createLoadingStages();

        return new Promise((resolve, reject) => {
            stages.forEach((stage, index) => {
                setTimeout(() => {
                    this.updateLoadingProgress(stage);

                    // Simulate potential random error
                    if (Math.random() < 0.05 && index > 2) {
                        reject(new Error('News Network Connection Failed'));
                    }

                    if (index === stages.length - 1) {
                        setTimeout(resolve, stage.duration);
                    }
                }, stage.duration);
            });
        });
    }

    updateLoadingProgress(stage) {
        this.loadingText.textContent = stage.text;
        this.progressBar.style.width = `${stage.progress}%`;
    }

    completeLoading() {
        this.preloader.style.opacity = 0;
        
        setTimeout(() => {
            this.preloader.style.display = 'none';
            this.mainContent.style.display = 'block';
        }, 600);
    }

    handleLoadingError(error) {
        console.error('Loading Error:', error);
        this.preloader.style.display = 'none';
        this.errorOverlay.style.display = 'flex';
    }

    retryLoading() {
        this.errorOverlay.style.display = 'none';
        this.preloader.style.display = 'flex';
        this.progressBar.style.width = '0%';
        this.startLoading();
    }
}

// Initialize preloader
document.addEventListener('DOMContentLoaded', () => {
    new NewsPreloader();
});
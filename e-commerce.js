class AdvancedPreloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.initParticles();
        this.setupLoadingSequence();
    }

    initParticles() {
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        particle.style.left = `${Math.random() * window.innerWidth}px`;
        particle.style.top = `${Math.random() * window.innerHeight}px`;
        particle.style.animationDuration = `${Math.random() * 2 + 1}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;

        this.preloader.appendChild(particle);
    }

    setupLoadingSequence() {
        const loadingStages = [
            { stage: 'Initializing Core Systems', duration: 1500 },
            { stage: 'Loading Resources', duration: 1500 },
            { stage: 'Preparing Interface', duration: 1500 },
            { stage: 'Finalizing', duration: 1500 }
        ];

        this.sequentialLoading(loadingStages);
    }

    sequentialLoading(stages) {
        const loadingText = document.querySelector('.loading-text');
        
        stages.reduce((promise, stage) => {
            return promise.then(() => {
                return new Promise(resolve => {
                    loadingText.textContent = stage.stage;
                    setTimeout(resolve, stage.duration);
                });
            });
        }, Promise.resolve()).then(() => {
            this.completeLoading();
        });
    }

    completeLoading() {
        this.preloader.style.opacity = 0;
        setTimeout(() => {
            this.preloader.style.display = 'none';
            this.triggerMainAppLoad();
        }, 5000);
    }

    triggerMainAppLoad() {
        // Trigger main application initialization
        document.dispatchEvent(new Event('app-ready'));
    }
}

// Initialize Preloader
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedPreloader();
});

// Main App Initialization
document.addEventListener('app-ready', () => {
    // Your main application initialization code here
    console.log('Application is now ready to use');
});


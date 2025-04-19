class CosmicPreloader {
    constructor() {
        this.galaxyContainer = document.getElementById('galaxy-container');
        this.spaceship = document.getElementById('spaceship');
        this.spacshipTrail = document.getElementById('spaceship-trail');
        this.progressFill = document.getElementById('progress-fill');
        this.loadingText = document.getElementById('loading-text');
        
        this.init();
    }

    init() {
        this.createStars(500);
        this.animateSpaceship();
        this.updateProgress();
    }

    createStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            
            star.style.width = `${Math.random() * 3}px`;
            star.style.height = star.style.width;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            
            this.galaxyContainer.appendChild(star);
        }
    }

    animateSpaceship() {
        const path = [
            { x: '10%', y: '80%', rotation: -45 },
            { x: '50%', y: '30%', rotation: 0 },
            { x: '90%', y: '70%', rotation: 45 }
        ];

        let currentIndex = 0;

        const moveSpaceship = () => {
            const current = path[currentIndex];
            
            this.spaceship.style.transform = `
                translate(${current.x}, ${current.y}) 
                rotate(${current.rotation}deg)
            `;

            this.spacshipTrail.style.transform = `
                translate(${current.x}, ${current.y}) 
                rotate(${current.rotation}deg)
            `;

            currentIndex = (currentIndex + 1) % path.length;
            setTimeout(moveSpaceship, 2000);
        };

        moveSpaceship();
    }

    updateProgress() {
        let progress = 0;
        const messages = [
            'Warping through result...',
            'Collecting  data...',
            'Decoding  signals...',
            'Preparing news transmission...'
        ];

        const progressInterval = setInterval(() => {
            progress += Math.random() * 25;
            this.progressFill.style.width = `${progress}%`;
            
            // Update loading text
            this.loadingText.textContent = messages[
                Math.floor(progress / 25)
            ] || 'News ready for launch!';

            if (progress >= 100) {
                clearInterval(progressInterval);
                this.completeLoading();
            }
        }, 1000);
    }

    completeLoading() {
        setTimeout(() => {
            document.getElementById('preloader').style.opacity = 0;
            document.getElementById('preloader').style.visibility = 'hidden';
        }, 1500);
    }
}

// Initialize Cosmic Preloader
document.addEventListener('DOMContentLoaded', () => {
    new CosmicPreloader();
});
class AdvancedPreloader {
    constructor() {
        this.initCursor();
        this.initPreloader();
    }

    /* © SMILEX - This code is licensed and protected. */


    initCursor() {
        const cursor = document.getElementById('cursor');
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
    }

    initPreloader() {
        const logos = [
            document.getElementById('S'),
            document.getElementById('M'),
            document.getElementById('I'),
            document.getElementById('L'),
            document.getElementById('E')
        ];
        const progressBar = document.getElementById('progress-bar');
        const preloader = document.getElementById('preloader');
        const mainContent = document.getElementById('main-content');

        let currentIndex = 0;

        const animateLogo = () => {
            // Remove active class from all logos
            logos.forEach(logo => logo.classList.remove('active'));
            
            // Add active class to current logo
            logos[currentIndex].classList.add('active');
            
            // Update progress bar
            progressBar.style.width = `${((currentIndex + 1) / logos.length) * 100}%`;

            // Move to next logo
            currentIndex = (currentIndex + 1) % logos.length;

            // If we've gone through all logos, transition to main content
            if (currentIndex === 0) {
                setTimeout(() => {
                    preloader.style.opacity = 0;
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        mainContent.style.display = 'block';
                        this.animateMainContent();
                    }, 500);
                }, 1000);
            } else {
                // Continue animating logos with a longer delay
                setTimeout(animateLogo, 2000);
            }
        };

            /* © SMILEX - This code is licensed and protected. */

        // Start the logo animation
        animateLogo();
    }

    animateMainContent() {
        const h1 = document.querySelector('.content-wrapper h1');
        const p = document.querySelector('.content-wrapper p');
        const ctaButton = document.querySelector('.cta-button');

        setTimeout(() => {
            h1.style.opacity = 1;
            h1.style.transform = 'translateY(0)';
        }, 300);

        setTimeout(() => {
            p.style.opacity = 1;
            p.style.transform = 'translateY(0)';
        }, 600);

        setTimeout(() => {
            ctaButton.style.opacity = 1;
            ctaButton.style.transform = 'translateY(0)';
        }, 900);
    }
}

// Initialize preloader when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedPreloader();
});

    /* © SMILEX - This code is licensed and protected. */
        // JavaScript Dynamic Text Animation
        class DynamicTextAnimator {
            constructor(element, texts, options = {}) {
                this.element = element;
                this.texts = texts;
                this.options = {
                    duration: options.duration || 3000,
                    typingSpeed: options.typingSpeed || 250,
                    deletingSpeed: options.deletingSpeed || 100
                };
                this.currentIndex = 0;
                this.isDeleting = false;
                this.displayText = '';
            }

            animate() {
                const currentText = this.texts[this.currentIndex];
                
                // Typing and deleting logic
                if (!this.isDeleting && this.displayText.length < currentText.length) {
                    this.displayText += currentText.charAt(this.displayText.length);
                } else if (this.isDeleting && this.displayText.length > 0) {
                    this.displayText = this.displayText.slice(0, -1);
                } else {
                    this.isDeleting = !this.isDeleting;
                    
                    if (!this.isDeleting) {
                        this.currentIndex = 
                            (this.currentIndex + 1) % this.texts.length;
                    }
                }

                // Update element text
                this.element.textContent = this.displayText;

                // Set typing/deleting speed
                const speed = this.isDeleting ? 
                    this.options.deletingSpeed : 
                    this.options.typingSpeed;

                // Schedule next animation frame
                setTimeout(() => this.animate(), speed);
            }

            start() {
                this.animate();
            }
        }

        // Initialize the dynamic text animator
        document.addEventListener('DOMContentLoaded', () => {
            const dynamicTextElement = document.getElementById('dynamic-text');
            const textOptions = [
                'Entertain', 
                'Enjoy', 
                'Have fun', 
                'Explore',
                'And,',  
                'Remember to', 
                'Support us',
                'We are',
                'Available',
                '24/7', 
                'If you',
                'Have a',
                'Problem',
                'Kindly', 
                'Contact us',
                'For more info',
                'Read our ',
                'About us', 
                'Thank you', 
                'Have a ',
                'Good day',
                'SMILE X',
                'KEEP THE',
                'SMILE',
                'NB',
                'ALL',
                'COPYRIGHTS',
                'RESERVED',
                'BYE.',

                    
                 
            ];

            const animator = new DynamicTextAnimator(
                dynamicTextElement, 
                textOptions
            );
            animator.start();
        });




    // Interactive Logo Animation
    const logoIcon = document.querySelector('.logo-icon');
        
        logoIcon.addEventListener('mousemove', (e) => {
            const rect = logoIcon.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const angleX = -(e.clientY - centerY) / 20;
            const angleY = (e.clientX - centerX) / 20;

            logoIcon.style.transform = `
                perspective(1000px) 
                rotateX(${angleX}deg) 
                rotateY(${angleY}deg) 
                scale(1.1)
            `;
        });

        logoIcon.addEventListener('mouseleave', () => {
            logoIcon.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });


            // Social Media Link Function
            function openSocialLink(platform) {
            const socialLinks = {
                facebook: 'https://facebook.com',
                twitter: 'https://x.com',
                instagram: 'https://instagram.com',
                linkedin: 'https://linkedin.com'
            };
            window.open(socialLinks[platform], '_blank');
        }

            // app Link Function
            function openLink(platform) {
            const appLinks = {
                playstore: 'https://playstore.com',
                appstore: 'https://applestore.com',
                windows: 'https://microsoft.com',
                apple: 'https://app.com'
            };
            window.open(appLinks[platform], '_blank');
        }

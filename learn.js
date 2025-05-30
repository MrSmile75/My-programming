        // Disable right-click context menu
        document.addEventListener('contextmenu', event => event.preventDefault());

        // Particle System
        function createParticleSystem(container, particleCount = 30) {
            if (!container) return;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 4 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.animationDelay = `${Math.random() * 8}s`;
                particle.style.animationDuration = `${Math.random() * 4 + 6}s`;
                
                container.appendChild(particle);
            }
        }

        // Initialize particle systems
        document.addEventListener('DOMContentLoaded', function() {
            createParticleSystem(document.getElementById('heroParticles'), 25);
            createParticleSystem(document.getElementById('pricingParticles'), 15);
        });

        // Parallax Effect
        function handleParallax() {
            const scrolled = window.pageYOffset;
            const parallaxSection = document.getElementById('parallaxSection');
            
            if (parallaxSection) {
                const rect = parallaxSection.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible) {
                    const parallaxX = parallaxSection.querySelector('.parallax-x');
                    const parallaxSmile = parallaxSection.querySelector('.parallax-smile');
                    
                    if (parallaxX && parallaxSmile) {
                        const speed1 = (scrolled - parallaxSection.offsetTop) * 0.3;
                        const speed2 = (scrolled - parallaxSection.offsetTop) * -0.2;
                        
                        parallaxX.style.transform = `translateY(${speed1}px)`;
                        parallaxSmile.style.transform = `translateY(${speed2}px)`;
                    }
                }
            }
        }

        // Scroll Reveal Animation
        function revealOnScroll() {
            const reveals = document.querySelectorAll('.scroll-reveal');
            
            reveals.forEach(element => {
                const windowHeight = window.innerHeight;
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 100;
                
                if (elementTop < windowHeight - elementVisible) {
                    element.classList.add('revealed');
                }
            });

            // Animate pricing cards
            const pricingCards = document.querySelectorAll('.pricing-card');
            pricingCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    setTimeout(() => {
                        card.classList.add('animate');
                    }, index * 200);
                }
            });
        }

        // Social Media Links
        function openSocialLink(platform) {
            const links = {
                facebook: 'https://facebook.com/smilex',
                twitter: 'https://twitter.com/smilex',
                instagram: 'https://instagram.com/smilex',
                linkedin: 'https://linkedin.com/company/smilex'
            };
            
            if (links[platform]) {
                window.open(links[platform], '_blank', 'noopener,noreferrer');
            }
        }

        // Smooth Scroll to Section
        function scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // Button Ripple Effect
        function createRipple(event) {
            const button = event.currentTarget;
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        // Event Listeners
        window.addEventListener('scroll', function() {
            handleParallax();
            revealOnScroll();
        });

        // Add ripple effect to buttons
        document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('.cta-button, .subscribe-btn');
            buttons.forEach(button => {
                button.addEventListener('click', createRipple);
            });
        });

        // Initial reveal check
        document.addEventListener('DOMContentLoaded', function() {
            revealOnScroll();
            
            // Add fade-in class to body
            document.body.classList.add('fade-in');
        });

        // Add ripple animation CSS
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);

        // Performance optimization: throttle scroll events
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    handleParallax();
                    revealOnScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
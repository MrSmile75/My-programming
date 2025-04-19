
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

        // Parallax Header Movement
        document.addEventListener('mousemove', (e) => {
            const header = document.getElementById('quantumHeader');
            const particles = header.querySelectorAll('.particle');

            particles.forEach(particle => {
                const speed = 0.1;
                const x = (e.clientX * speed) / 100;
                const y = (e.clientY * speed) / 100;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });

        // Initialize Particle System
        createParticleSystem();


        const container = document.getElementById('parallaxContainer');

// Mouse Movement Parallax
document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate movement
    const moveX = (clientX - centerX) / 50;
    const moveY = (clientY - centerY) / 50;

    // Apply to each text layer
    document.querySelectorAll('.text-layer').forEach((layer, index) => {
        const multiplier = (index + 1) * 2;
        layer.style.transform = `
            translateZ(${-300 + (index * 150)}px) 
            scale(${2 - (index * 0.3)}) 
            translate(${-moveX * multiplier}px, ${-moveY * multiplier}px)
        `;
    });
});

// Responsive Resize
window.addEventListener('resize', () => {
    document.querySelectorAll('.text-content').forEach(text => {
        text.style.fontSize = `${15 * (window.innerWidth / 1920)}vw`;
    });
});



class UltimateMarquee {
        constructor(config = {}) {
            // Advanced Configuration Options
            this.defaultConfig = {
                container: 'ultimateMarquee',
                items: [],
                speed: 50,
                direction: 'left',
                pauseOnHover: true,
                responsive: true,
                theme: 'default',
                customClasses: {},
                interactions: {
                    click: null,
                    hover: null
                }
            };

            // Merge configurations
            this.config = this.deepMerge(this.defaultConfig, config);
            this.container = document.getElementById(this.config.container);
            
            // Initialize marquee
            this.init();
        }

        // Deep merge utility method
        deepMerge(target, source) {
            const output = Object.assign({}, target);
            if (this.isObject(target) && this.isObject(source)) {
                Object.keys(source).forEach(key => {
                    if (this.isObject(source[key])) {
                        if (!(key in target))
                            Object.assign(output, { [key]: source[key] });
                        else
                            output[key] = this.deepMerge(target[key], source[key]);
                    } else {
                        Object.assign(output, { [key]: source[key] });
                    }
                });
            }
            return output;
        }

        // Check if value is an object
        isObject(item) {
            return (item && typeof item === 'object' && !Array.isArray(item));
        }

        // Initialize marquee
        init() {
            this.createMarqueeStructure();
            this.applyTheme();
            this.setupInteractions();
        }

        // Create marquee DOM structure
        createMarqueeStructure() {
            const wrapper = document.createElement('div');
            wrapper.className = 'marquee-wrapper';

            const track = document.createElement('div');
            track.className = 'marquee-track';

            // Duplicate items for continuous animation
            const items = [...this.config.items, ...this.config.items];
            
            items.forEach(item => {
                const marqueeItem = this.createMarqueeItem(item);
                track.appendChild(marqueeItem);
            });

            wrapper.appendChild(track);
            this.container.appendChild(wrapper);

            // Set animation properties
            this.setAnimationProperties(track);
        }

        // Create individual marquee item
        createMarqueeItem(itemData) {
            const item = document.createElement('div');
            item.className = 'marquee-item';

            // Support for complex item configurations
            if (typeof itemData === 'object') {
                // Icon support
                if (itemData.icon) {
                    const icon = document.createElement('span');
                    icon.className = `marquee-item-icon ${itemData.icon}`;
                    item.appendChild(icon);
                }

                // Text content
                const text = document.createElement('span');
                text.textContent = itemData.text || '';
                item.appendChild(text);

                // Badge support
                if (itemData.badge) {
                    const badge = document.createElement('span');
                    badge.className = 'marquee-item-badge';
                    badge.textContent = itemData.badge;
                    item.appendChild(badge);
                }

                // Custom classes
                if (itemData.classes) {
                    item.classList.add(...itemData.classes);
                }
            } else {
                item.textContent = itemData;
            }

            return item;
        }

        // Set animation properties
        setAnimationProperties(track) {
            track.style.animationDuration = `${this.config.speed}s`;
            
            if (this.config.direction === 'right') {
                track.style.animationDirection = 'reverse';
            }
        }

        // Apply theme
        applyTheme() {
            const themes = {
                default: {
                    primaryColor: '#2c3e50',
                    secondaryColor: '#3498db',
                    background: '#ecf0f1'
                },
                dark: {
                    primaryColor: '#34495e',
                    secondaryColor: '#2980b9',
                    background: '#2c3e50'
                }
            };

            const selectedTheme = themes[this.config.theme] || themes.default;
            
            this.container.style.setProperty('--marquee-primary-color', selectedTheme.primaryColor);
            this.container.style.setProperty('--marquee-secondary-color', selectedTheme.secondaryColor);
            this.container.style.setProperty('--marquee-background', selectedTheme.background);
        }

        // Setup interactions
        setupInteractions() {
            if (this.config.pauseOnHover) {
                this.container.addEventListener('mouseenter', () => {
                    const track = this.container.querySelector('.marquee-track');
                    track.style.animationPlayState = 'paused';
                });

                this.container.addEventListener('mouseleave', () => {
                    const track = this.container.querySelector('.marquee-track');
                    track.style.animationPlayState = 'running';
                });
            }
        }
    }

    // Example Usage
    document.addEventListener('DOMContentLoaded', () => {
        new UltimateMarquee({
            items: [
                { 
                    text: 'Special Offer', 
                    icon: 'fa-gift', 
                    badge: 'New',
                    classes: ['highlight']
                },
                'Free Shipping Worldwide',
                { 
                    text: 'Summer Sale', 
                    badge: '50% OFF' 
                },
                'Join Our Community'
            ],
            speed: 30,
            direction: 'left',
            theme: 'default',
            pauseOnHover: true
        });
    });




        // Social Media Link Function
        function openSocialLink(platform) {
            const socialLinks = {
                facebook: 'https://facebook.com',
                twitter: 'https://twitter.com',
                instagram: 'https://instagram.com',
                linkedin: 'https://linkedin.com'
            };
            window.open(socialLinks[platform], '_blank');
        }

       

            // Optional: Add subtle animations or interactions
            const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'scale(1.1)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'scale(1)';
            });
        });
    
      
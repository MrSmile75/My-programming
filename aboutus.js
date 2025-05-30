   // Global Variables
        let currentSection = 0;
        const totalSections = 7;
        let isAnimating = false;
        let audioContext = null;
        let isAudioEnabled = false;
        let isDarkTheme = true;

        // Typewriter Configuration
        const typewriterTexts = [
            "Hi there!",
            "Welcome to SmileX",
            "Making Life Easier",
            "Innovation at its Best",
            "Keep The Smile"
        ];
        let typewriterIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        // Particle System
        class ParticleSystem {
            constructor(canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.particles = [];
                this.mouse = { x: 0, y: 0 };
                this.init();
            }

            init() {
                this.resize();
                this.createParticles();
                this.animate();
                this.bindEvents();
            }

            resize() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }

            createParticles() {
                const particleCount = Math.min(100, Math.floor((this.canvas.width * this.canvas.height) / 10000));
                
                for (let i = 0; i < particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * this.canvas.width,
                        y: Math.random() * this.canvas.height,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: (Math.random() - 0.5) * 0.5,
                        size: Math.random() * 3 + 1,
                        opacity: Math.random() * 0.5 + 0.2,
                        color: this.getRandomColor()
                    });
                }
            }

            getRandomColor() {
                const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
                return colors[Math.floor(Math.random() * colors.length)];
            }

            animate() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.particles.forEach((particle, index) => {
                    // Update position
                    particle.x += particle.vx;
                    particle.y += particle.vy;

                    // Mouse interaction
                    const dx = this.mouse.x - particle.x;
                    const dy = this.mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        const force = (100 - distance) / 100;
                        particle.vx -= (dx / distance) * force * 0.01;
                        particle.vy -= (dy / distance) * force * 0.01;
                    }

                    // Boundary check
                    if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

                    // Keep particles in bounds
                    particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
                    particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

                    // Draw particle
                    this.ctx.save();
                    this.ctx.globalAlpha = particle.opacity;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();

                    // Draw connections
                    this.particles.slice(index + 1).forEach(otherParticle => {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 120) {
                            this.ctx.save();
                            this.ctx.globalAlpha = ((120 - distance) / 120) * 0.1;
                            this.ctx.strokeStyle = particle.color;
                            this.ctx.lineWidth = 1;
                            this.ctx.beginPath();
                            this.ctx.moveTo(particle.x, particle.y);
                            this.ctx.lineTo(otherParticle.x, otherParticle.y);
                            this.ctx.stroke();
                            this.ctx.restore();
                        }
                    });
                });

                requestAnimationFrame(() => this.animate());
            }

            bindEvents() {
                window.addEventListener('resize', () => this.resize());
                
                this.canvas.addEventListener('mousemove', (e) => {
                    this.mouse.x = e.clientX;
                    this.mouse.y = e.clientY;
                });
            }
        }

        // Audio System
        class AudioSystem {
            constructor() {
                this.sounds = {};
                this.init();
            }

            async init() {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    await this.loadSounds();
                } catch (error) {
                    console.warn('Audio not supported:', error);
                }
            }

            async loadSounds() {
                // Create simple tones for interactions
                this.sounds = {
                    click: this.createTone(800, 0.1),
                    hover: this.createTone(600, 0.05),
                    transition: this.createTone(400, 0.2)
                };
            }

            createTone(frequency, duration) {
                return () => {
                    if (!this.audioContext || !isAudioEnabled) return;
                    
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                };
            }

            play(soundName) {
                if (this.sounds[soundName]) {
                    this.sounds[soundName]();
                }
            }
        }

        // Notification System
        class NotificationSystem {
            constructor() {
                this.container = document.getElementById('notificationContainer');
                this.notifications = [];
            }

            show(message, type = 'info', duration = 3000) {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.textContent = message;
                
                this.container.appendChild(notification);
                
                // Trigger animation
                setTimeout(() => notification.classList.add('show'), 100);
                
                // Auto remove
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, duration);
            }
        }

        // Initialize systems
        let particleSystem;
        let audioSystem;
        let notificationSystem;

        // Preloader
        function initPreloader() {
            const loadingProgress = document.getElementById('loadingProgress');
            const loadingPercentage = document.getElementById('loadingPercentage');
            const loadingWords = document.querySelectorAll('.loading-word');
            
            let progress = 0;
            let wordIndex = 0;
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * 3 + 1;
                
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                    
                    setTimeout(() => {
                        document.getElementById('preloader').classList.add('hidden');
                        initializeApp();
                    }, 500);
                }
                
                loadingProgress.style.width = progress + '%';
                loadingPercentage.textContent = Math.floor(progress) + '%';
                
                // Update loading words
                if (progress > wordIndex * 25 && wordIndex < loadingWords.length - 1) {
                    loadingWords[wordIndex].classList.remove('active');
                    wordIndex++;
                    loadingWords[wordIndex].classList.add('active');
                }
            }, 100);
        }

        // Initialize main application
        function initializeApp() {
            // Initialize systems
            const canvas = document.getElementById('particleCanvas');
            particleSystem = new ParticleSystem(canvas);
            audioSystem = new AudioSystem();
            notificationSystem = new NotificationSystem();
            
            // Initialize components
            initNavigation();
            initTypewriter();
            initAnimations();
            initEventListeners();
            
            // Show welcome notification
            setTimeout(() => {
                notificationSystem.show('Welcome to SmileX Experience!', 'success');
            }, 1000);
        }

        // Navigation System
        function initNavigation() {
            updateSectionIndicators();
            updateNavigation();
            updateProgressBar();
        }

        function nextSection() {
            if (isAnimating || currentSection >= totalSections - 1) return;
            
            audioSystem.play('transition');
            navigateToSection(currentSection + 1);
        }

        function previousSection() {
            if (isAnimating || currentSection <= 0) return;
            
            audioSystem.play('transition');
            navigateToSection(currentSection - 1);
        }

        function navigateToSection(sectionIndex) {
            if (isAnimating || sectionIndex === currentSection || sectionIndex < 0 || sectionIndex >= totalSections) return;
            
            isAnimating = true;
            
            const currentSectionEl = document.querySelector(`[data-section="${currentSection}"]`);
            const targetSectionEl = document.querySelector(`[data-section="${sectionIndex}"]`);
            
            // Remove active class from current section
            currentSectionEl.classList.remove('active');
            
            // Add appropriate transition class
            if (sectionIndex < currentSection) {
                currentSectionEl.classList.add('prev');
                targetSectionEl.classList.remove('prev');
            }
            
            // Activate target section
            setTimeout(() => {
                targetSectionEl.classList.add('active');
                currentSection = sectionIndex;
                
                updateNavigation();
                updateProgressBar();
                updateSectionCounter();
                triggerSectionAnimations();
                
                setTimeout(() => {
                    isAnimating = false;
                }, 300);
            }, 100);
        }

        function updateSectionIndicators() {
            const indicatorsContainer = document.getElementById('sectionIndicators');
            indicatorsContainer.innerHTML = '';
            
            for (let i = 0; i < totalSections; i++) {
                const dot = document.createElement('div');
                dot.className = `indicator-dot ${i === currentSection ? 'active' : ''}`;
                dot.addEventListener('click', () => {
                    audioSystem.play('click');
                    navigateToSection(i);
                });
                indicatorsContainer.appendChild(dot);
            }
        }

        function updateNavigation() {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            
            prevBtn.disabled = currentSection === 0;
            nextBtn.disabled = currentSection === totalSections - 1;
            
            // Update indicators
            const dots = document.querySelectorAll('.indicator-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSection);
            });
        }

        function updateProgressBar() {
            const progressFill = document.getElementById('progressFill');
            const progress = ((currentSection + 1) / totalSections) * 100;
            progressFill.style.width = progress + '%';
        }

        function updateSectionCounter() {
            const currentSectionNum = document.getElementById('currentSectionNum');
            const totalSectionsNum = document.getElementById('totalSections');
            
            currentSectionNum.textContent = String(currentSection + 1).padStart(2, '0');
            totalSectionsNum.textContent = String(totalSections).padStart(2, '0');
        }

        // Typewriter Effect
        function initTypewriter() {
            typewriterEffect();
        }

        function typewriterEffect() {
            const typewriterElement = document.getElementById('typewriterText');
            const currentText = typewriterTexts[typewriterIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                typewriterIndex = (typewriterIndex + 1) % typewriterTexts.length;
            }
            
            setTimeout(typewriterEffect, typeSpeed);
        }

        // Animations
        function initAnimations() {
            // Animate stats on welcome section
            animateStats();
            
            // Animate progress bars in team section
            setTimeout(() => {
                animateProgressBars();
            }, 1000);
        }

        function animateStats() {
            const statNumbers = document.querySelectorAll('.stat-number');
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                const increment = target / 100;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    if (target === 99) {
                        stat.textContent = Math.floor(current) + '%';
                    } else if (target >= 1000000) {
                        stat.textContent = (Math.floor(current) / 1000000).toFixed(1) + 'M+';
                    } else {
                        stat.textContent = Math.floor(current) + '+';
                    }
                }, 50);
            });
        }

        function animateProgressBars() {
            const progressBars = document.querySelectorAll('.progress-line');
            
            progressBars.forEach(bar => {
                const progress = bar.getAttribute('data-progress');
                bar.style.width = progress + '%';
            });
        }

        function triggerSectionAnimations() {
            const currentSectionEl = document.querySelector(`[data-section="${currentSection}"]`);
            
            // Re-trigger animations for current section
            const animatedElements = currentSectionEl.querySelectorAll('[class*="animate"]');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; // Trigger reflow
                el.style.animation = null;
            });
            
            // Special animations for specific sections
            if (currentSection === 0) {
                animateStats();
            } else if (currentSection === 5) {
                setTimeout(animateProgressBars, 500);
            }
        }

        // Event Listeners
        function initEventListeners() {
            // Navigation buttons
            document.getElementById('prevBtn').addEventListener('click', () => {
                audioSystem.play('click');
                previousSection();
            });
            
            document.getElementById('nextBtn').addEventListener('click', () => {
                audioSystem.play('click');
                nextSection();
            });
            
            // Audio toggle
            document.getElementById('audioToggle').addEventListener('click', toggleAudio);
            
            // Theme toggle
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            
            // Keyboard navigation
            document.addEventListener('keydown', handleKeyNavigation);
            
            // Touch/swipe navigation
            let touchStartX = 0;
            let touchEndX = 0;
            
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            document.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
            
            function handleSwipe() {
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        nextSection();
                    } else {
                        previousSection();
                    }
                }
            }
            
            // Social media links
            document.querySelectorAll('.social-card').forEach(card => {
                card.addEventListener('click', () => {
                    const platform = card.getAttribute('data-platform');
                    openSocialLink(platform);
                });
                
                card.addEventListener('mouseenter', () => {
                    audioSystem.play('hover');
                });
            });
            
            // Download links
            document.querySelectorAll('.download-card').forEach(card => {
                card.addEventListener('click', () => {
                    const platform = card.getAttribute('data-platform');
                    openDownloadLink(platform);
                });
                
                card.addEventListener('mouseenter', () => {
                    audioSystem.play('hover');
                });
            });
            
            // Add hover sounds to interactive elements
            document.querySelectorAll('.nav-btn, .indicator-dot, .feature-item, .value-card').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    audioSystem.play('hover');
                });
            });
        }

        function handleKeyNavigation(e) {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    nextSection();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    previousSection();
                    break;
                case 'Home':
                    e.preventDefault();
                    navigateToSection(0);
                    break;
                case 'End':
                    e.preventDefault();
                    navigateToSection(totalSections - 1);
                    break;
                case 'Escape':
                    // Could be used for closing modals or returning to start
                    navigateToSection(0);
                    break;
            }
        }

        function toggleAudio() {
            isAudioEnabled = !isAudioEnabled;
            const audioBtn = document.getElementById('audioToggle');
            const icon = audioBtn.querySelector('i');
            
            if (isAudioEnabled) {
                icon.className = 'fas fa-volume-up';
                notificationSystem.show('Audio enabled', 'success');
                audioSystem.play('click');
            } else {
                icon.className = 'fas fa-volume-mute';
                notificationSystem.show('Audio disabled', 'info');
            }
        }

        function toggleTheme() {
            isDarkTheme = !isDarkTheme;
            const themeBtn = document.getElementById('themeToggle');
            const icon = themeBtn.querySelector('i');
            
            if (isDarkTheme) {
                document.body.classList.remove('light-theme');
                icon.className = 'fas fa-moon';
                notificationSystem.show('Dark theme activated', 'info');
            } else {
                document.body.classList.add('light-theme');
                icon.className = 'fas fa-sun';
                notificationSystem.show('Light theme activated', 'info');
            }
            
            audioSystem.play('click');
        }

        // External Links
        function openSocialLink(platform) {
            const links = {
                facebook: 'https://facebook.com/smilex',
                twitter: 'https://twitter.com/smilex',
                instagram: 'https://instagram.com/smilex',
                linkedin: 'https://linkedin.com/company/smilex'
            };
            
            if (links[platform]) {
                window.open(links[platform], '_blank');
                notificationSystem.show(`Opening ${platform}...`, 'info');
                audioSystem.play('click');
            }
        }

        function openDownloadLink(platform) {
            const links = {
                playstore: 'https://play.google.com/store/apps/details?id=com.smilex',
                appstore: 'https://apps.apple.com/app/smilex',
                windows: 'https://microsoft.com/store/apps/smilex',
                macos: 'https://apps.apple.com/app/smilex'
            };
            
            if (links[platform]) {
                window.open(links[platform], '_blank');
                notificationSystem.show(`Downloading for ${platform}...`, 'success');
                audioSystem.play('click');
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            initPreloader();
            
            // Prevent right-click context menu
            document.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // Prevent text selection on UI elements
            document.addEventListener('selectstart', (e) => {
                if (e.target.closest('.nav-controls, .main-nav, .audio-controls, .theme-toggle')) {
                    e.preventDefault();
                }
            });
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animations when page is not visible
                document.body.style.animationPlayState = 'paused';
            } else {
                // Resume animations when page becomes visible
                document.body.style.animationPlayState = 'running';
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            // Update particle system
            if (particleSystem) {
                particleSystem.resize();
            }
        });

        // Performance monitoring
        let performanceMetrics = {
            loadTime: 0,
            interactionCount: 0,
            sectionChanges: 0
        };

        window.addEventListener('load', () => {
            performanceMetrics.loadTime = performance.now();
            console.log('SmileX loaded in:', performanceMetrics.loadTime.toFixed(2), 'ms');
        });

        // Track interactions for analytics
        document.addEventListener('click', () => {
            performanceMetrics.interactionCount++;
        });

        // Export for potential external use
        window.SmileX = {
            navigateToSection,
            toggleAudio,
            toggleTheme,
            showNotification: (message, type) => notificationSystem.show(message, type),
            getMetrics: () => performanceMetrics
        };
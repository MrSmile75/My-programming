    // Custom Cursor
        const cursor = document.getElementById('cursor');
        const interactiveElements = document.querySelectorAll('a, button, .feature-card');

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        // Preloader Animation
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const preloader = document.getElementById('preloader');

        const progressInterval = setInterval(() => {
            progress += Math.random() * 3;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        initMainAnimations();
                    }, 500);
                }, 1000);
            }
            progressBar.style.width = progress + '%';
            progressText.textContent = Math.floor(progress) + '%';
        }, 100);

        // Background Particles
        function createParticles() {
            const bgAnimation = document.getElementById('bgAnimation');
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                bgAnimation.appendChild(particle);
            }
        }

        // Main Animations
        function initMainAnimations() {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const ctaContainer = document.querySelector('.cta-container');

            setTimeout(() => heroTitle.classList.add('fade-in-up'), 200);
            setTimeout(() => heroSubtitle.classList.add('fade-in-up'), 600);
            setTimeout(() => ctaContainer.classList.add('fade-in-up'), 1000);

            createParticles();
            setupScrollAnimations();
        }

        // Scroll Animations
        function setupScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in-up');
                        
                        // Animate stats numbers
                        if (entry.target.classList.contains('stat-item')) {
                            animateCounter(entry.target.querySelector('.stat-number'));
                        }
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
                observer.observe(el);
            });
        }

        // Counter Animation
        function animateCounter(element) {
            const target = parseInt(element.dataset.target);
            if (!target) return;

            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                    element.textContent = target.toLocaleString() + (target === 99 ? '%' : '+');
                } else {
                    element.textContent = Math.floor(current).toLocaleString() + (target === 99 ? '%' : '+');
                }
            }, 50);
        }

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Parallax Effect
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const particles = document.querySelectorAll('.floating-particle');
            
            particles.forEach((particle, index) => {
                const speed = (index % 3 + 1) * 0.5;
                particle.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

  
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
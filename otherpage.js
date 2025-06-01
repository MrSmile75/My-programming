   // Custom Cursor
        const cursor = document.getElementById('cursor');
        const interactiveElements = document.querySelectorAll('button');

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        // Create Star Field
        function createStarField() {
            const starField = document.getElementById('starField');
            const starCount = 800;

            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                // Random star sizes
                const size = Math.random();
                if (size < 0.7) star.classList.add('small');
                else if (size < 0.9) star.classList.add('medium');
                else star.classList.add('large');
                
                // Random positions
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                
                starField.appendChild(star);
            }
        }

        // Create Particles Around Countdown
        function createCountdownParticles() {
            const container = document.querySelector('.countdown-container');
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            
            for (let i = 0; i < 5; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Calculate position on a circle around the countdown
                const angle = Math.random() * Math.PI * 2;
                const distance = 70 + Math.random() * 30;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                
                // Random colors
                const colors = ['#00ffff', '#ff00ff', '#ffff00'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.background = color;
                particle.style.boxShadow = `0 0 10px ${color}`;
                
                // Animation
                const duration = 1 + Math.random() * 2;
                particle.style.animation = `particleFloat ${duration}s infinite linear`;
                
                container.appendChild(particle);
                
                // Clean up after animation
                setTimeout(() => {
                    particle.remove();
                }, duration * 1000);
            }
        }

        // Create Wave Effect
        function createWaveEffect() {
            const wave = document.getElementById('countdown-wave');
            wave.classList.remove('wave-animation');
            
            // Trigger reflow
            void wave.offsetWidth;
            
            wave.classList.add('wave-animation');
        }

        // Update Countdown Number with Animation
        function updateCountdownNumber(number) {
            const container = document.getElementById('number-container');
            const currentNumber = document.getElementById('countdown');
            
            // Create new number element
            const newNumber = document.createElement('div');
            newNumber.id = 'countdown';
            newNumber.textContent = number;
            newNumber.classList.add('number-enter');
            
            // Add exit animation to current number
            currentNumber.classList.add('number-exit');
            currentNumber.id = '';
            
            // Add new number to container
            container.appendChild(newNumber);
            
            // Remove old number after animation
            setTimeout(() => {
                currentNumber.remove();
            }, 500);
            
            // Create wave effect
            createWaveEffect();
            
            // Create particles
            createCountdownParticles();
            
            // Add special effects for final countdown
            if (number <= 3) {
                newNumber.classList.add('final-countdown');
                
                // Intensify star twinkling
                const stars = document.querySelectorAll('.star');
                stars.forEach(star => {
                    star.style.animation = 'twinkle 1s infinite ease-in-out';
                });
            }
        }

        // Countdown Animation
        function startCountdown() {
            const countdownEl = document.getElementById('countdown');
            const goButton = document.getElementById('go-button');
            let count = 10;
            
            // Initial setup
            countdownEl.classList.add('countdown-active');
            
            const countInterval = setInterval(() => {
                count--;
                
                if (count <= 0) {
                    clearInterval(countInterval);
                    
                    // Final explosion effect
                    const container = document.querySelector('.countdown-container');
                    const containerRect = container.getBoundingClientRect();
                    const centerX = containerRect.width / 2;
                    const centerY = containerRect.height / 2;
                    
                    for (let i = 0; i < 50; i++) {
                        const particle = document.createElement('div');
                        particle.className = 'particle';
                        particle.style.left = centerX + 'px';
                        particle.style.top = centerY + 'px';
                        
                        // Random colors
                        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff'];
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        particle.style.background = color;
                        particle.style.boxShadow = `0 0 10px ${color}`;
                        
                        // Random direction
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 5;
                        const vx = Math.cos(angle) * speed;
                        const vy = Math.sin(angle) * speed;
                        
                        container.appendChild(particle);
                        
                        // Animate particle
                        let x = 0, y = 0;
                        let opacity = 1;
                        const animate = () => {
                            x += vx;
                            y += vy;
                            opacity -= 0.02;
                            
                            if (opacity <= 0) {
                                particle.remove();
                                return;
                            }
                            
                            particle.style.transform = `translate(${x}px, ${y}px)`;
                            particle.style.opacity = opacity;
                            
                            requestAnimationFrame(animate);
                        };
                        
                        animate();
                    }
                    
                    // Hide countdown and show button
                    setTimeout(() => {
                        container.style.opacity = 0;
                        setTimeout(() => {
                            container.style.display = 'none';
                            goButton.style.display = 'inline-block';
                            goButton.classList.add('fade-in');
                        }, 500);
                    }, 1000);
                    
                    return;
                }
                
                // Update countdown with animation
                updateCountdownNumber(count);
                
            }, 1000);
        }

        // Initialize Animations
        function initAnimations() {
            const welcomeMsg = document.getElementById('welcome-message');
            const teaserText = document.getElementById('teaser-text');
            const countdown = document.getElementById('countdown');

            setTimeout(() => welcomeMsg.classList.add('fade-in'), 500);
            setTimeout(() => teaserText.classList.add('fade-in'), 1000);
            setTimeout(() => {
                countdown.classList.add('scale-in');
                setTimeout(() => {
                    startCountdown();
                }, 500);
            }, 1500);
        }

        // Button Click Effect
        document.getElementById('go-button').addEventListener('click', function() {
            // Create explosion effect
            const button = this;
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = '#00ffff';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '10001';
                
                const angle = (i / 30) * Math.PI * 2;
                const velocity = 100 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                document.body.appendChild(particle);
                
                let x = 0, y = 0;
                const animate = () => {
                    x += vx * 0.02;
                    y += vy * 0.02;
                    particle.style.transform = `translate(${x}px, ${y}px)`;
                    particle.style.opacity = Math.max(0, 1 - Math.sqrt(x*x + y*y) / 200);
                    
                    if (particle.style.opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        particle.remove();
                    }
                };
                animate();
            }

            // Navigate after effect
            setTimeout(() => {
                window.location.href = 'form.html';
            }, 1000);
        });

        // Initialize everything
        document.addEventListener('DOMContentLoaded', () => {
            createStarField();
            initAnimations();
        });

        // Disable right-click
        document.addEventListener('contextmenu', event => event.preventDefault());
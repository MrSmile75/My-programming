     // Create floating particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Billing toggle functionality
        function initBillingToggle() {
            const toggleOptions = document.querySelectorAll('.toggle-option');
            const monthlyPrices = document.querySelectorAll('.monthly-price');
            const yearlyPrices = document.querySelectorAll('.yearly-price');
            const yearlyOriginals = document.querySelectorAll('.yearly-original');
            const yearlySavings = document.querySelectorAll('.yearly-savings');

            toggleOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const billing = this.dataset.billing;
                    
                    // Update active state
                    toggleOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                    // Add loading effect
                    document.querySelectorAll('.pricing-card').forEach(card => {
                        card.classList.add('loading');
                    });

                    setTimeout(() => {
                        // Update pricing display
                        if (billing === 'yearly') {
                            monthlyPrices.forEach(price => price.style.display = 'none');
                            yearlyPrices.forEach(price => price.style.display = 'inline');
                            yearlyOriginals.forEach(original => original.style.display = 'inline');
                            yearlySavings.forEach(savings => savings.style.display = 'block');
                        } else {
                            monthlyPrices.forEach(price => price.style.display = 'inline');
                            yearlyPrices.forEach(price => price.style.display = 'none');
                            yearlyOriginals.forEach(original => original.style.display = 'none');
                            yearlySavings.forEach(savings => savings.style.display = 'none');
                        }

                        // Remove loading effect
                        document.querySelectorAll('.pricing-card').forEach(card => {
                            card.classList.remove('loading');
                        });
                    }, 300);
                });
            });
        }

        // FAQ functionality
        function initFAQ() {
            const faqQuestions = document.querySelectorAll('.faq-question');
            faqQuestions.forEach(question => {
                question.addEventListener('click', function() {
                    const answer = this.nextElementSibling;
                    const icon = this.querySelector('i');
                    
                    // Close other open FAQs
                    faqQuestions.forEach(otherQuestion => {
                        if (otherQuestion !== this) {
                            const otherAnswer = otherQuestion.nextElementSibling;
                            const otherIcon = otherQuestion.querySelector('i');
                            otherAnswer.classList.remove('active');
                            otherQuestion.classList.remove('active');
                        }
                    });
                    
                    // Toggle current FAQ
                    answer.classList.toggle('active');
                    this.classList.toggle('active');
                });
            });
        }

        // Scroll reveal animation
        function initScrollReveal() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.scroll-reveal').forEach(el => {
                observer.observe(el);
            });
        }

        // Enhanced card hover effects
        function initCardEffects() {
            document.querySelectorAll('.pricing-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    if (this.classList.contains('recommended')) {
                        this.style.transform = 'scale(1.08) translateY(-20px) rotateX(5deg)';
                    } else {
                        this.style.transform = 'translateY(-15px) rotateX(5deg)';
                    }
                });

                card.addEventListener('mouseleave', function() {
                    if (this.classList.contains('recommended')) {
                        this.style.transform = 'scale(1.08) translateY(-10px)';
                    } else {
                        this.style.transform = 'translateY(0)';
                    }
                });
            });
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            initBillingToggle();
            initFAQ();
            initScrollReveal();
            initCardEffects();

            // Disable right-click context menu
            document.addEventListener('contextmenu', event => event.preventDefault());

            // Add stagger animation to pricing cards
            document.querySelectorAll('.pricing-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.2}s`;
                card.classList.add('fade-in');
            });
        });

        // Smooth scrolling for better UX
        document.documentElement.style.scrollBehavior = 'smooth';
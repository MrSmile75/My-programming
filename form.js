

        // Quiz State
        let currentQuestion = 1;
        const totalQuestions = 7;
        const answers = {};

        // Personality Types
        const personalityTypes = {
            'Optimistic Leader': {
                icon: '🌟',
                description: 'You are a natural leader with a positive outlook on life. You inspire others and tackle challenges with confidence and enthusiasm.'
            },
            'Thoughtful Analyst': {
                icon: '🧠',
                description: 'You approach life with careful consideration and deep thinking. Your analytical nature helps you make well-informed decisions.'
            },
            'Creative Innovator': {
                icon: '🎨',
                description: 'You have a vibrant imagination and love to create. Your innovative spirit drives you to find unique solutions to problems.'
            },
            'Compassionate Helper': {
                icon: '❤️',
                description: 'You have a big heart and genuinely care about others. Your empathy and kindness make you a trusted friend and advisor.'
            },
            'Ambitious Achiever': {
                icon: '🚀',
                description: 'You are driven by success and constantly strive for excellence. Your determination and focus help you reach your goals.'
            },
            'Balanced Harmonizer': {
                icon: '⚖️',
                description: 'You seek balance in all aspects of life. Your diplomatic nature helps you maintain harmony in relationships and situations.'
            }
        };

        // Initialize Quiz
        function initializeQuiz() {
            updateProgress();
            updateNavigationButtons();
            addOptionListeners();
        }

        // Add event listeners to option buttons
        function addOptionListeners() {
            document.querySelectorAll('.option-button').forEach(button => {
                button.addEventListener('click', function() {
                    selectOption(this);
                });
            });
        }

        // Select an option
        function selectOption(button) {
            const question = button.closest('.question');
            const questionNumber = question.dataset.question;
            const value = button.dataset.value;

            // Remove previous selection
            question.querySelectorAll('.option-button').forEach(btn => {
                btn.classList.remove('selected');
            });

            // Add selection to clicked button
            button.classList.add('selected');
            
            // Store answer
            answers[questionNumber] = value;

            // Create particle effect
            createParticleEffect(button);

            // Enable next button
            updateNavigationButtons();

            // Auto-advance after a short delay
            setTimeout(() => {
                if (currentQuestion < totalQuestions) {
                    changeQuestion(1);
                } else {
                    finishQuiz();
                }
            }, 800);
        }

        // Create particle effect
        function createParticleEffect(element) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                particle.style.width = '4px';
                particle.style.height = '4px';
                
                const angle = (i / 8) * Math.PI * 2;
                const velocity = 50;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                particle.style.setProperty('--vx', vx + 'px');
                particle.style.setProperty('--vy', vy + 'px');
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 3000);
            }
        }

        // Change question
        function changeQuestion(direction) {
            const currentQuestionElement = document.querySelector('.question.active');
            
            if (direction === 1 && currentQuestion < totalQuestions) {
                // Next question
                currentQuestion++;
                currentQuestionElement.classList.remove('active');
                
                setTimeout(() => {
                    const nextQuestion = document.querySelector(`[data-question="${currentQuestion}"]`);
                    nextQuestion.classList.add('active');
                    nextQuestion.classList.add('fade-in');
                }, 300);
                
            } else if (direction === -1 && currentQuestion > 1) {
                // Previous question
                currentQuestion--;
                currentQuestionElement.classList.remove('active');
                
                setTimeout(() => {
                    const prevQuestion = document.querySelector(`[data-question="${currentQuestion}"]`);
                    prevQuestion.classList.add('active');
                    prevQuestion.classList.add('fade-in');
                }, 300);
            }

            updateProgress();
            updateNavigationButtons();
        }

        // Update progress bar
        function updateProgress() {
            const progress = (currentQuestion / totalQuestions) * 100;
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            
            progressBar.style.width = progress + '%';
            progressText.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
        }

        // Update navigation buttons
        function updateNavigationButtons() {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const currentQuestionElement = document.querySelector('.question.active');
            const hasSelection = currentQuestionElement.querySelector('.option-button.selected');

            prevBtn.disabled = currentQuestion === 1;
            nextBtn.disabled = !hasSelection;

            if (currentQuestion === totalQuestions && hasSelection) {
                nextBtn.textContent = 'Finish';
                nextBtn.innerHTML = 'Finish <i class="fas fa-check"></i>';
            } else {
                nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            }
        }

        // Finish quiz
        function finishQuiz() {
            // Hide quiz form
            document.getElementById('personalityQuiz').style.display = 'none';
            document.querySelector('.navigation').style.display = 'none';
            document.querySelector('.progress-container').style.display = 'none';

            // Show thank you message
            const thankYou = document.getElementById('thankYou');
            thankYou.classList.add('show');

            // Calculate personality type
            setTimeout(() => {
                const personalityType = calculatePersonalityType();
                showResults(personalityType);
            }, 3000);
        }

        // Calculate personality type based on answers
        function calculatePersonalityType() {
            const types = Object.keys(personalityTypes);
            return types[Math.floor(Math.random() * types.length)];
        }

        // Show results
        function showResults(personalityType) {
            const thankYou = document.getElementById('thankYou');
            const results = document.getElementById('results');
            
            // Hide thank you message
            thankYou.classList.remove('show');
            
            // Update results content
            document.getElementById('personalityIcon').textContent = personalityTypes[personalityType].icon;
            document.getElementById('personalityTitle').textContent = personalityType;
            document.getElementById('personalityDescription').textContent = personalityTypes[personalityType].description;
            
            // Show results
            setTimeout(() => {
                results.classList.add('show');
            }, 500);
        }

        // Initialize quiz when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializeQuiz();
            
            // Add loading animation to body
            document.body.classList.add('fade-in');
        });

        // Add smooth scrolling for better UX
        function smoothScrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Scroll to top when changing questions
        const originalChangeQuestion = changeQuestion;
        changeQuestion = function(direction) {
            originalChangeQuestion(direction);
            smoothScrollToTop();
        };
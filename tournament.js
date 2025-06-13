  class UltimateQuizTournament {
            constructor() {
                this.apiUrl = 'https://opentdb.com/api.php?amount=50&type=multiple';
                this.questions = [];
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.streak = 0;
                this.timer = null;
                this.timeLeft = 15;
                this.hintsRemaining = 10;
                this.isInTournament = false;
                this.userId = this.generateUserId();
                this.userName = "Guest";
                this.currentQuestion = null;
                this.hintUsed = false;
                this.isWatchingAd = false;
                this.adAttentionVerified = false;
                this.adAttentionCheckShown = false;

                this.initializeApp();
            }

            generateUserId() {
                return 'user_' + Math.random().toString(36).substr(2, 9);
            }

            async initializeApp() {
                this.loadUserData();
                this.setupEventListeners();
                this.updateUserProfile();
                await this.fetchQuestions();
                this.loadQuestion();
                this.startLeaderboardUpdates();
                this.startCommentsUpdates();
            }

            loadUserData() {
                const savedData = localStorage.getItem('quizTournamentData');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    this.userName = data.userName || "Guest";
                    this.score = data.score || 0;
                    this.hintsRemaining = data.hintsRemaining !== undefined ? data.hintsRemaining : 10;
                    
                    // If user already has a name, hide the modal
                    if (this.userName !== "Guest") {
                        document.getElementById('nameEntryModal').classList.add('hidden');
                    }
                }
            }

            saveUserData() {
                const data = {
                    userName: this.userName,
                    score: this.score,
                    hintsRemaining: this.hintsRemaining
                };
                localStorage.setItem('quizTournamentData', JSON.stringify(data));
            }

            setupEventListeners() {
                // Tab navigation
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
                });

                // Tournament buttons
                document.getElementById('joinTournamentBtn').addEventListener('click', () => this.showNameEntryModal());
                document.getElementById('leaveTournamentBtn').addEventListener('click', () => this.leaveTournament());
                
                // Name entry
                document.getElementById('submitNameBtn').addEventListener('click', () => this.submitName());
                document.getElementById('nameInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.submitName();
                });

                // Hint system
                document.getElementById('hintBtn').addEventListener('click', () => this.useHint());
                document.getElementById('watchAdBtn').addEventListener('click', () => this.watchAd());
                
                // Ad interaction
                document.getElementById('adAttentionBtn').addEventListener('click', () => this.verifyAdAttention());
                
                // Comments
                document.getElementById('sendCommentBtn').addEventListener('click', () => this.sendComment());
                document.getElementById('commentInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendComment();
                });
            }

            switchTab(tabId) {
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Deactivate all buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Show selected tab
                document.getElementById(tabId).classList.add('active');
                
                // Activate selected button
                document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
            }

            updateUserProfile() {
                document.getElementById('userName').textContent = this.userName;
                document.getElementById('userAvatar').textContent = this.userName.charAt(0).toUpperCase();
            }

            showNameEntryModal() {
                document.getElementById('nameEntryModal').classList.remove('hidden');
                document.getElementById('nameInput').focus();
            }

            submitName() {
                const nameInput = document.getElementById('nameInput');
                const name = nameInput.value.trim();
                
                if (name.length < 3) {
                    alert('Please enter a name with at least 3 characters.');
                    return;
                }
                
                this.userName = name;
                this.updateUserProfile();
                this.saveUserData();
                document.getElementById('nameEntryModal').classList.add('hidden');
                this.joinTournament();
            }

            async fetchQuestions() {
                try {
                    const response = await fetch(this.apiUrl);
                    const data = await response.json();
                    
                    if (data.results && data.results.length > 0) {
                        this.questions = data.results.map(question => this.processQuestion(question));
                    } else {
                        throw new Error('No questions available');
                    }
                } catch (error) {
                    console.error('Error fetching questions:', error);
                    // Fallback questions
                    this.questions = this.getFallbackQuestions();
                }
            }

            processQuestion(question) {
                const allOptions = [...question.incorrect_answers, question.correct_answer];
                return {
                    ...question,
                    options: allOptions.sort(() => Math.random() - 0.5),
                    decodedQuestion: this.decodeHtml(question.question),
                    decodedCorrectAnswer: this.decodeHtml(question.correct_answer),
                    decodedOptions: allOptions.map(option => this.decodeHtml(option))
                };
            }

            getFallbackQuestions() {
                return [
                    {
                        question: "What is the capital of France?",
                        correct_answer: "Paris",
                        incorrect_answers: ["London", "Berlin", "Madrid"],
                        options: ["Paris", "London", "Berlin", "Madrid"],
                        category: "Geography",
                        difficulty: "easy",
                        decodedQuestion: "What is the capital of France?",
                        decodedCorrectAnswer: "Paris",
                        decodedOptions: ["Paris", "London", "Berlin", "Madrid"]
                    },
                    {
                        question: "Which planet is known as the Red Planet?",
                        correct_answer: "Mars",
                        incorrect_answers: ["Venus", "Jupiter", "Saturn"],
                        options: ["Mars", "Venus", "Jupiter", "Saturn"],
                        category: "Science",
                        difficulty: "easy",
                        decodedQuestion: "Which planet is known as the Red Planet?",
                        decodedCorrectAnswer: "Mars",
                        decodedOptions: ["Mars", "Venus", "Jupiter", "Saturn"]
                    }
                ];
            }

            decodeHtml(html) {
                const txt = document.createElement('textarea');
                txt.innerHTML = html;
                return txt.value;
            }

            loadQuestion() {
                if (this.currentQuestionIndex >= this.questions.length) {
                    this.fetchQuestions().then(() => {
                        this.currentQuestionIndex = 0;
                        this.loadQuestion();
                    });
                    return;
                }

                this.currentQuestion = this.questions[this.currentQuestionIndex];
                this.hintUsed = false;
                
                // Update question number
                document.getElementById('questionNumber').textContent = this.currentQuestionIndex + 1;

                // Display question
                const questionContainer = document.getElementById('questionContainer');
                questionContainer.innerHTML = `
                    <div class="question-number">Question ${this.currentQuestionIndex + 1}</div>
                    <div class="question-text">${this.currentQuestion.decodedQuestion}</div>
                    <div class="question-category">${this.currentQuestion.category || 'General'}</div>
                `;

                // Display options
                const optionsContainer = document.getElementById('optionsContainer');
                optionsContainer.innerHTML = '';
                
                this.currentQuestion.options.forEach((option, index) => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'option';
                    optionElement.textContent = this.decodeHtml(option);
                    optionElement.onclick = () => this.selectAnswer(option, optionElement);
                    optionsContainer.appendChild(optionElement);
                });

                // Start timer
                this.startTimer();
                
                // Hide feedback
                document.getElementById('feedback').classList.add('hidden');
                
                // Re-enable hint button
                document.getElementById('hintBtn').disabled = false;
                
                // Update hints display
                document.getElementById('hintsRemaining').textContent = this.hintsRemaining;
            }

            startTimer() {
                clearInterval(this.timer);
                this.timeLeft = 15;
                const timerElement = document.getElementById('timer');
                const timerBar = document.getElementById('timerBar');
                
                timerBar.style.width = '100%';
                
                this.timer = setInterval(() => {
                    this.timeLeft--;
                    timerElement.textContent = this.timeLeft;
                    timerBar.style.width = `${(this.timeLeft / 15) * 100}%`;
                    
                    if (this.timeLeft <= 0) {
                        this.handleTimeOut();
                    }
                }, 1000);
            }

            selectAnswer(selectedOption, optionElement) {
                clearInterval(this.timer);
                
                const isCorrect = selectedOption === this.currentQuestion.decodedCorrectAnswer;
                const feedbackElement = document.getElementById('feedback');
                
                // Highlight all options
                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    if (option.textContent === this.currentQuestion.decodedCorrectAnswer) {
                        option.classList.add('correct');
                    } else if (option === optionElement && !isCorrect) {
                        option.classList.add('incorrect');
                    }
                    option.onclick = null; // Disable clicking
                });

                if (isCorrect) {
                    this.score += 1; // +1 for correct answer
                    this.streak++;
                    feedbackElement.textContent = `Correct! +1 point`;
                    feedbackElement.className = 'feedback correct';
                } else {
                    this.score -= 1; // -1 for wrong answer
                    if (this.score < 0) this.score = 0; // Don't go below zero
                    this.streak = 0;
                    feedbackElement.textContent = `Wrong! -1 point. The correct answer was: ${this.currentQuestion.decodedCorrectAnswer}`;
                    feedbackElement.className = 'feedback incorrect';
                }

                // Update display
                document.getElementById('currentScore').textContent = this.score;
                document.getElementById('streak').textContent = this.streak;
                feedbackElement.classList.remove('hidden');

                // Save user data
                this.saveUserData();
                
                // Update tournament score if in tournament
                if (this.isInTournament) {
                    this.updateTournamentScore();
                }

                // Move to next question
                setTimeout(() => {
                    this.nextQuestion();
                }, 3000);
            }

            handleTimeOut() {
                clearInterval(this.timer);
                this.streak = 0;
                this.score -= 1; // -1 for timeout
                if (this.score < 0) this.score = 0; // Don't go below zero
                
                const feedbackElement = document.getElementById('feedback');
                feedbackElement.textContent = `Time's up! -1 point. The correct answer was: ${this.currentQuestion.decodedCorrectAnswer}`;
                feedbackElement.className = 'feedback incorrect';
                feedbackElement.classList.remove('hidden');

                // Highlight correct answer
                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    if (option.textContent === this.currentQuestion.decodedCorrectAnswer) {
                        option.classList.add('correct');
                    }
                    option.onclick = null;
                });

                document.getElementById('streak').textContent = this.streak;
                document.getElementById('currentScore').textContent = this.score;
                
                // Save user data
                this.saveUserData();
                
                // Update tournament score if in tournament
                if (this.isInTournament) {
                    this.updateTournamentScore();
                }

                setTimeout(() => {
                    this.nextQuestion();
                }, 3000);
            }

            nextQuestion() {
                this.currentQuestionIndex++;
                this.loadQuestion();
            }

            useHint() {
                if (this.hintsRemaining <= 0 || this.hintUsed) {
                    if (this.hintsRemaining <= 0) {
                        this.watchAd();
                    }
                    return;
                }
                
                this.hintsRemaining--;
                this.hintUsed = true;
                document.getElementById('hintsRemaining').textContent = this.hintsRemaining;
                this.saveUserData();
                
                // Highlight correct answer
                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    if (option.textContent === this.currentQuestion.decodedCorrectAnswer) {
                        option.classList.add('hint');
                    }
                });

                // Disable hint button
                document.getElementById('hintBtn').disabled = true;
            }

            watchAd() {
                if (this.isWatchingAd) return;
                
                this.isWatchingAd = true;
                this.adAttentionVerified = false;
                this.adAttentionCheckShown = false;
                
                const adContainer = document.getElementById('adContainer');
                const adCountdown = document.getElementById('adCountdown');
                const skipTimer = document.getElementById('skipTimer');
                const adSkip = document.getElementById('adSkip');
                const adAttentionCheck = document.getElementById('adAttentionCheck');
                
                adContainer.classList.remove('hidden');
                adAttentionCheck.classList.add('hidden');
                adSkip.classList.add('disabled');
                
                // Pause the quiz timer
                clearInterval(this.timer);
                
                let countdown = 15;
                adCountdown.textContent = countdown;
                skipTimer.textContent = countdown;
                
                const adTimer = setInterval(() => {
                    countdown--;
                    adCountdown.textContent = countdown;
                    skipTimer.textContent = countdown;
                    
                    // Show attention check randomly
                    if (countdown === 8 && !this.adAttentionCheckShown) {
                        this.adAttentionCheckShown = true;
                        adAttentionCheck.classList.remove('hidden');
                    }
                    
                    // Enable skip button at 5 seconds
                    if (countdown === 5) {
                        adSkip.classList.remove('disabled');
                        adSkip.textContent = 'Skip Ad';
                        adSkip.onclick = () => {
                            if (!this.adAttentionVerified && this.adAttentionCheckShown) {
                                alert('Please verify you are watching the ad first!');
                                return;
                            }
                            clearInterval(adTimer);
                            this.completeAd(false);
                        };
                    }
                    
                    if (countdown <= 0) {
                        clearInterval(adTimer);
                        if (!this.adAttentionVerified && this.adAttentionCheckShown) {
                            alert('You did not verify you were watching the ad. No reward given.');
                            this.completeAd(false);
                        } else {
                            this.completeAd(true);
                        }
                    }
                }, 1000);
            }

            verifyAdAttention() {
                this.adAttentionVerified = true;
                document.getElementById('adAttentionCheck').classList.add('hidden');
            }

            completeAd(giveReward) {
                this.isWatchingAd = false;
                document.getElementById('adContainer').classList.add('hidden');
                
                if (giveReward) {
                    // Add hint
                    this.hintsRemaining++;
                    document.getElementById('hintsRemaining').textContent = this.hintsRemaining;
                    this.saveUserData();
                    
                    // Re-enable hint button
                    document.getElementById('hintBtn').disabled = false;
                    
                    // Show success message
                    const feedbackElement = document.getElementById('feedback');
                    feedbackElement.textContent = 'Ad completed! +1 Hint added!';
                    feedbackElement.className = 'feedback correct';
                    feedbackElement.classList.remove('hidden');
                    
                    setTimeout(() => {
                        feedbackElement.classList.add('hidden');
                    }, 2000);
                }
                
                // Resume the quiz timer
                this.startTimer();
            }

            joinTournament() {
                this.isInTournament = true;
                document.getElementById('joinTournamentBtn').classList.add('hidden');
                document.getElementById('leaveTournamentBtn').classList.remove('hidden');
                document.getElementById('tournamentStatus').textContent = 'You are competing!';
                
                // Add to leaderboard
                this.updateTournamentScore();
                
                // Switch to leaderboard tab to show the user they've joined
                this.switchTab('leaderboardTab');
            }

            leaveTournament() {
                this.isInTournament = false;
                document.getElementById('joinTournamentBtn').classList.remove('hidden');
                document.getElementById('leaveTournamentBtn').classList.add('hidden');
                document.getElementById('tournamentStatus').textContent = 'Join to compete!';
                
                // Remove from leaderboard
                this.removeFromTournament();
            }

            updateTournamentScore() {
                if (!this.isInTournament) return;
                
                // Get leaderboard from localStorage
                const leaderboard = JSON.parse(localStorage.getItem('tournament_leaderboard') || '[]');
                const existingPlayer = leaderboard.find(player => player.id === this.userId);
                
                if (existingPlayer) {
                    existingPlayer.score = this.score;
                    existingPlayer.lastUpdate = Date.now();
                } else {
                    leaderboard.push({
                        id: this.userId,
                        name: this.userName,
                        score: this.score,
                        lastUpdate: Date.now()
                    });
                }
                
                // Sort by score
                leaderboard.sort((a, b) => b.score - a.score);
                
                localStorage.setItem('tournament_leaderboard', JSON.stringify(leaderboard));
                this.updateLeaderboardDisplay(leaderboard);
            }

            removeFromTournament() {
                const leaderboard = JSON.parse(localStorage.getItem('tournament_leaderboard') || '[]');
                const filteredLeaderboard = leaderboard.filter(player => player.id !== this.userId);
                localStorage.setItem('tournament_leaderboard', JSON.stringify(filteredLeaderboard));
                this.updateLeaderboardDisplay(filteredLeaderboard);
            }

            startLeaderboardUpdates() {
                // Update leaderboard every 5 seconds
                setInterval(() => {
                    const leaderboard = JSON.parse(localStorage.getItem('tournament_leaderboard') || '[]');
                    this.updateLeaderboardDisplay(leaderboard);
                }, 5000);
                
                // Initial load
                const leaderboard = JSON.parse(localStorage.getItem('tournament_leaderboard') || '[]');
                this.updateLeaderboardDisplay(leaderboard);
            }

            updateLeaderboardDisplay(leaderboard) {
                const leaderboardElement = document.getElementById('leaderboard');
                
                if (leaderboard.length === 0) {
                    leaderboardElement.innerHTML = '<p style="text-align: center; opacity: 0.6;">No players in tournament</p>';
                    return;
                }
                
                leaderboardElement.innerHTML = leaderboard.map((player, index) => {
                    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                    const isCurrentUser = player.id === this.userId;
                    
                    return `
                        <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}" style="${isCurrentUser ? 'border: 2px solid var(--primary-color);' : ''}">
                            <div class="rank ${rankClass}">#${index + 1}</div>
                            <div class="player-info">
                                <div class="player-name">${player.name} ${isCurrentUser ? '(You)' : ''}</div>
                                <div class="player-score">${player.score} points</div>
                            </div>
                            ${index < 3 ? `<i class="fas fa-trophy" style="color: var(--${rankClass === 'gold' ? 'gold' : rankClass === 'silver' ? 'silver' : 'bronze'}-color);"></i>` : ''}
                        </div>
                    `;
                }).join('');
            }

            sendComment() {
                if (!this.isInTournament) {
                    alert('You must join the tournament to chat!');
                    return;
                }
                
                const commentInput = document.getElementById('commentInput');
                const message = commentInput.value.trim();
                
                if (!message) return;
                
                const comment = {
                    id: Date.now(),
                    author: this.userName,
                    message: message,
                    timestamp: Date.now()
                };
                
                // Add to comments
                const comments = JSON.parse(localStorage.getItem('tournament_comments') || '[]');
                comments.unshift(comment);
                
                // Keep only last 50 comments
                if (comments.length > 50) {
                    comments.splice(50);
                }
                
                localStorage.setItem('tournament_comments', JSON.stringify(comments));
                commentInput.value = '';
                
                this.updateCommentsDisplay(comments);
            }

            startCommentsUpdates() {
                // Update comments every 3 seconds
                setInterval(() => {
                    const comments = JSON.parse(localStorage.getItem('tournament_comments') || '[]');
                    this.updateCommentsDisplay(comments);
                }, 3000);
                
                // Initial load
                const comments = JSON.parse(localStorage.getItem('tournament_comments') || '[]');
                this.updateCommentsDisplay(comments);
            }

            updateCommentsDisplay(comments) {
                const commentsElement = document.getElementById('commentsList');
                
                if (comments.length === 0) {
                    commentsElement.innerHTML = '<p style="text-align: center; opacity: 0.6;">No comments yet. Be the first!</p>';
                    return;
                }
                
                commentsElement.innerHTML = comments.map(comment => {
                    const timeAgo = this.getTimeAgo(comment.timestamp);
                    return `
                        <div class="comment">
                            <div class="comment-author">${comment.author}</div>
                            <div class="comment-text">${comment.message}</div>
                            <div class="comment-time">${timeAgo}</div>
                        </div>
                    `;
                }).join('');
            }

            getTimeAgo(timestamp) {
                const now = Date.now();
                const diff = now - timestamp;
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                
                if (hours > 0) return `${hours}h ago`;
                if (minutes > 0) return `${minutes}m ago`;
                return `${seconds}s ago`;
            }
        }

        // Initialize the quiz tournament
        document.addEventListener('DOMContentLoaded', () => {
            new UltimateQuizTournament();
        });

        // Prevent right-click
        document.addEventListener('contextmenu', event => event.preventDefault());
    
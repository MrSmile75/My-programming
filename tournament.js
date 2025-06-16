        // Firebase Configuration - Replace with your config
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();

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
                this.isInTournament = true; // Auto-join tournament
                this.userId = this.generateUserId();
                this.userName = this.loadUserName();
                this.currentQuestion = null;
                this.hintUsed = false;
                this.isWatchingAd = false;
                this.userRank = 0;
                this.isOnline = navigator.onLine;

                this.initializeApp();
            }

            generateUserId() {
                let userId = localStorage.getItem('quiz_user_id');
                if (!userId) {
                    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
                    localStorage.setItem('quiz_user_id', userId);
                }
                return userId;
            }

            loadUserName() {
                const savedName = localStorage.getItem('quiz_user_name');
                return savedName || null;
            }

            saveUserName(name) {
                localStorage.setItem('quiz_user_name', name);
                this.userName = name;
            }

            async initializeApp() {
                this.setupNetworkMonitoring();
                this.loadUserData();
                this.setupEventListeners();
                
                if (!this.userName) {
                    this.showNameEntryModal();
                } else {
                    this.updateUserProfile();
                    await this.joinTournament();
                }
                
                await this.fetchQuestions();
                this.loadQuestion();
                this.startFirebaseListeners();
            }

            setupNetworkMonitoring() {
                const updateOnlineStatus = () => {
                    this.isOnline = navigator.onLine;
                    const statusEl = document.getElementById('onlineStatus');
                    if (this.isOnline) {
                        statusEl.className = 'online-status online';
                        statusEl.innerHTML = '<i class="fas fa-wifi"></i> Online';
                    } else {
                        statusEl.className = 'online-status offline';
                        statusEl.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
                    }
                };

                window.addEventListener('online', updateOnlineStatus);
                window.addEventListener('offline', updateOnlineStatus);
                updateOnlineStatus();
            }

            loadUserData() {
                const savedData = localStorage.getItem('quizTournamentData');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    this.score = data.score || 0;
                    this.hintsRemaining = data.hintsRemaining !== undefined ? data.hintsRemaining : 10;
                    this.streak = data.streak || 0;
                }
            }

            saveUserData() {
                const data = {
                    score: this.score,
                    hintsRemaining: this.hintsRemaining,
                    streak: this.streak,
                    lastPlayed: Date.now()
                };
                localStorage.setItem('quizTournamentData', JSON.stringify(data));
            }

            setupEventListeners() {
                // Tab navigation
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
                });

                // Name entry
                document.getElementById('submitNameBtn').addEventListener('click', () => this.submitName());
                document.getElementById('nameInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.submitName();
                });

                // Hint system
                document.getElementById('hintBtn').addEventListener('click', () => this.useHint());
                document.getElementById('watchAdBtn').addEventListener('click', () => this.watchAd());
                
                // Comments
                document.getElementById('sendCommentBtn').addEventListener('click', () => this.sendComment());
                document.getElementById('commentInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendComment();
                });

                // Emoji picker
                document.querySelectorAll('.emoji-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.addEmoji(btn.dataset.emoji));
                });
            }

            switchTab(tabId) {
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                document.getElementById(tabId).classList.add('active');
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

            async submitName() {
                const nameInput = document.getElementById('nameInput');
                const name = nameInput.value.trim();
                
                if (name.length < 3) {
                    alert('Please enter a name with at least 3 characters.');
                    return;
                }
                
                this.saveUserName(name);
                this.updateUserProfile();
                document.getElementById('nameEntryModal').classList.add('hidden');
                await this.joinTournament();
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
                
                document.getElementById('questionNumber').textContent = this.currentQuestionIndex + 1;

                const questionContainer = document.getElementById('questionContainer');
                questionContainer.innerHTML = `
                    <div class="question-number">Question ${this.currentQuestionIndex + 1}</div>
                    <div class="question-text">${this.currentQuestion.decodedQuestion}</div>
                    <div class="question-category">${this.currentQuestion.category || 'General'}</div>
                `;

                const optionsContainer = document.getElementById('optionsContainer');
                optionsContainer.innerHTML = '';
                
                this.currentQuestion.options.forEach((option, index) => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'option';
                    optionElement.textContent = this.decodeHtml(option);
                    optionElement.onclick = () => this.selectAnswer(option, optionElement);
                    optionsContainer.appendChild(optionElement);
                });

                this.startTimer();
                document.getElementById('feedback').classList.add('hidden');
                document.getElementById('hintBtn').disabled = false;
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

            async selectAnswer(selectedOption, optionElement) {
                clearInterval(this.timer);
                
                const isCorrect = selectedOption === this.currentQuestion.decodedCorrectAnswer;
                const feedbackElement = document.getElementById('feedback');
                
                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    if (option.textContent === this.currentQuestion.decodedCorrectAnswer) {
                        option.classList.add('correct');
                    } else if (option === optionElement && !isCorrect) {
                        option.classList.add('incorrect');
                    }
                    option.onclick = null;
                });

                if (isCorrect) {
                    this.score += 1;
                    this.streak++;
                    feedbackElement.textContent = `Correct! +1 point`;
                    feedbackElement.className = 'feedback correct';
                } else {
                    this.score = Math.max(0, this.score - 1);
                    this.streak = 0;
                    feedbackElement.textContent = `Wrong! -1 point. Correct: ${this.currentQuestion.decodedCorrectAnswer}`;
                    feedbackElement.className = 'feedback incorrect';
                }

                this.updateDisplay();
                feedbackElement.classList.remove('hidden');
                this.saveUserData();
                
                if (this.isInTournament && this.isOnline) {
                    await this.updateTournamentScore();
                }

                setTimeout(() => {
                    this.nextQuestion();
                }, 3000);
            }

            async handleTimeOut() {
                clearInterval(this.timer);
                this.streak = 0;
                this.score = Math.max(0, this.score - 1);
                
                const feedbackElement = document.getElementById('feedback');
                feedbackElement.textContent = `Time's up! -1 point. Correct: ${this.currentQuestion.decodedCorrectAnswer}`;
                feedbackElement.className = 'feedback incorrect';
                feedbackElement.classList.remove('hidden');

                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    if (option.textContent === this.currentQuestion.decodedCorrectAnswer) {
                        option.classList.add('correct');
                    }
                    option.onclick = null;
                });

                this.updateDisplay();
                this.saveUserData();
                
                if (this.isInTournament && this.isOnline) {
                    await this.updateTournamentScore();
                }

                setTimeout(() => {
                    this.nextQuestion();
                }, 3000);
            }

            updateDisplay() {
                document.getElementById('currentScore').textContent = this.score;
                document.getElementById('streak').textContent = this.streak;
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
                
                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    if (option.textContent === this.currentQuestion.decodedCorrectAnswer) {
                        option.classList.add('hint');
                    }
                });

                document.getElementById('hintBtn').disabled = true;
            }

            watchAd() {
                if (this.isWatchingAd) return;
                
                this.isWatchingAd = true;
                const adContainer = document.getElementById('adContainer');
                const adCountdown = document.getElementById('adCountdown');
                const skipTimer = document.getElementById('skipTimer');
                const adSkip = document.getElementById('adSkip');
                
                adContainer.classList.remove('hidden');
                adSkip.classList.add('disabled');
                clearInterval(this.timer);
                
                let countdown = 15;
                adCountdown.textContent = countdown;
                skipTimer.textContent = countdown;
                
                const adTimer = setInterval(() => {
                    countdown--;
                    adCountdown.textContent = countdown;
                    skipTimer.textContent = countdown;
                    
                    if (countdown === 5) {
                        adSkip.classList.remove('disabled');
                        adSkip.textContent = 'Skip Ad';
                        adSkip.onclick = () => {
                            clearInterval(adTimer);
                            this.completeAd(true);
                        };
                    }
                    
                    if (countdown <= 0) {
                        clearInterval(adTimer);
                        this.completeAd(true);
                    }
                }, 1000);
            }

            completeAd(giveReward) {
                this.isWatchingAd = false;
                document.getElementById('adContainer').classList.add('hidden');
                
                if (giveReward) {
                    this.hintsRemaining++;
                    document.getElementById('hintsRemaining').textContent = this.hintsRemaining;
                    this.saveUserData();
                    document.getElementById('hintBtn').disabled = false;
                    
                    const feedbackElement = document.getElementById('feedback');
                    feedbackElement.textContent = 'Ad completed! +1 Hint added!';
                    feedbackElement.className = 'feedback correct';
                    feedbackElement.classList.remove('hidden');
                    
                    setTimeout(() => {
                        feedbackElement.classList.add('hidden');
                    }, 2000);
                }
                
                this.startTimer();
            }

            async joinTournament() {
                if (!this.isOnline) return;
                
                this.isInTournament = true;
                document.getElementById('tournamentStatus').textContent = 'Competing with players worldwide!';
                
                try {
                    await db.collection('tournament_players').doc(this.userId).set({
                        name: this.userName,
                        score: this.score,
                        streak: this.streak,
                        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
                        isActive: true
                    }, { merge: true });
                } catch (error) {
                    console.error('Error joining tournament:', error);
                }
            }

            async updateTournamentScore() {
                if (!this.isInTournament || !this.isOnline) return;
                
                try {
                    await db.collection('tournament_players').doc(this.userId).update({
                        score: this.score,
                        streak: this.streak,
                        lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (error) {
                    console.error('Error updating tournament score:', error);
                }
            }

            startFirebaseListeners() {
                if (!this.isOnline) return;

                // Listen to leaderboard changes
                db.collection('tournament_players')
                    .where('isActive', '==', true)
                    .orderBy('score', 'desc')
                    .limit(50)
                    .onSnapshot((snapshot) => {
                        const players = [];
                        snapshot.forEach((doc) => {
                            const data = doc.data();
                            players.push({
                                id: doc.id,
                                ...data
                            });
                        });
                        this.updateLeaderboardDisplay(players);
                    });

                // Listen to comments
                db.collection('tournament_comments')
                    .orderBy('timestamp', 'desc')
                    .limit(50)
                    .onSnapshot((snapshot) => {
                        const comments = [];
                        snapshot.forEach((doc) => {
                            comments.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                        this.updateCommentsDisplay(comments);
                    });
            }

            updateLeaderboardDisplay(players) {
                const leaderboardElement = document.getElementById('leaderboard');
                
                if (players.length === 0) {
                    leaderboardElement.innerHTML = '<p style="text-align: center; opacity: 0.6;">No players in tournament</p>';
                    return;
                }
                
                // Find current user rank
                const userIndex = players.findIndex(player => player.id === this.userId);
                this.userRank = userIndex >= 0 ? userIndex + 1 : '-';
                document.getElementById('userRank').textContent = this.userRank;
                
                leaderboardElement.innerHTML = players.map((player, index) => {
                    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                    const isCurrentUser = player.id === this.userId;
                    
                    return `
                        <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                            <div class="rank ${rankClass}">#${index + 1}</div>
                            <div class="player-info">
                                <div class="player-name">${player.name} ${isCurrentUser ? '(You)' : ''}</div>
                                <div class="player-score">${player.score} points • Streak: ${player.streak || 0}</div>
                            </div>
                            ${index < 3 ? `<i class="fas fa-trophy" style="color: var(--${rankClass === 'gold' ? 'gold' : rankClass === 'silver' ? 'silver' : 'bronze'}-color);"></i>` : ''}
                        </div>
                    `;
                }).join('');
            }

            addEmoji(emoji) {
                const commentInput = document.getElementById('commentInput');
                commentInput.value += emoji;
                commentInput.focus();
            }

            async sendComment() {
                if (!this.isInTournament || !this.isOnline) {
                    alert('You must be online and in the tournament to chat!');
                    return;
                }
                
                const commentInput = document.getElementById('commentInput');
                const message = commentInput.value.trim();
                
                if (!message) return;
                
                try {
                    await db.collection('tournament_comments').add({
                        author: this.userName,
                        authorId: this.userId,
                        message: message,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    commentInput.value = '';
                } catch (error) {
                    console.error('Error sending comment:', error);
                }
            }

            updateCommentsDisplay(comments) {
                const commentsElement = document.getElementById('commentsList');
                
                if (comments.length === 0) {
                    commentsElement.innerHTML = '<p style="text-align: center; opacity: 0.6;">No comments yet. Be the first!</p>';
                    return;
                }
                
                commentsElement.innerHTML = comments.map(comment => {
                    const timeAgo = this.getTimeAgo(comment.timestamp?.toDate?.() || new Date());
                    const isOwnComment = comment.authorId === this.userId;
                    
                    return `
                        <div class="comment ${isOwnComment ? 'own-comment' : ''}">
                            <div class="comment-author">${comment.author} ${isOwnComment ? '(You)' : ''}</div>
                            <div class="comment-text">${comment.message}</div>
                            <div class="comment-time">${timeAgo}</div>
                        </div>
                    `;
                }).join('');
                
                // Auto-scroll to bottom for new messages
                commentsElement.scrollTop = 0;
            }

            getTimeAgo(timestamp) {
                const now = new Date();
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

                          // Disable F12, Ctrl+U, and Ctrl+Shift+I
        document.addEventListener("keydown", function(e) {
            // F12, Ctrl+Shift+I, and Ctrl+U
            if ((e.key === 'F12') || 
                (e.ctrlKey && (e.key === 'u' || e.key === 'U')) || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
                e.preventDefault();
              
            }
        });

        // Detect DevTools opening (using resize event)
        let devtoolsOpen = false;
        setInterval(function() {
            const width = window.outerWidth - window.innerWidth > 100;
            const height = window.outerHeight - window.innerHeight > 100;
            if ((width || height) && !devtoolsOpen) {
                devtoolsOpen = true;
               
            }
            if (!(width || height) && devtoolsOpen) {
                devtoolsOpen = false;
            }
        }, 1000);

        // Prevent right-click
        document.addEventListener('contextmenu', event => event.preventDefault());
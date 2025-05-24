     /* © SMILEX - This code is licensed and protected. */
class UnstoppableQuiz {
    constructor() {
        this.apiUrl = 'https://opentdb.com/api.php?amount=50&type=multiple';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 15;

        // Initialize quiz
        this.initializeQuiz();
    }

    async initializeQuiz() {
        // Retrieve saved progress
        const savedProgress = localStorage.getItem('quizProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.currentQuestionIndex = progress.questionIndex || 0;
            this.score = progress.score || 0;
        }

             /* © SMILEX - This code is licensed and protected. */

        // Fetch questions from API
        await this.fetchQuestions();
    }

    async fetchQuestions() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                this.questions = data.results.map(this.processQuestion);
                this.loadQuestion();
            } else {
                this.handleError('No questions available');
            }
        } catch (error) {
            this.handleError(error.message);
        }
    }

    processQuestion(question) {
        // Combine correct and incorrect answers
        const allOptions = [
            ...question.incorrect_answers, 
            question.correct_answer
        ];
        
        // Shuffle options
        return {
            ...question,
            options: allOptions.sort(() => Math.random() - 0.5),
            decodedQuestion: he.decode(question.question),
            decodedCorrectAnswer: he.decode(question.correct_answer)
        };
    }

    loadQuestion() {
        // Ensure we have questions
        if (this.questions.length === 0) {
            this.fetchQuestions();
            return;
        }

             /* © SMILEX - This code is licensed and protected. */

        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        // Clear previous question
        const questionContainer = document.getElementById('question-container');
        const optionsContainer = document.getElementById('options-container');
        questionContainer.innerHTML = '';
        optionsContainer.innerHTML = '';

        // Display question
        const questionElement = document.createElement('h2');
        questionElement.textContent = currentQuestion.decodedQuestion;
        questionContainer.appendChild(questionElement);

        // Display options
        currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = he.decode(option);
            optionElement.onclick = () => this.checkAnswer(option);
            optionsContainer.appendChild(optionElement);
        });

        // Update score
        document.getElementById('score').textContent = `Score: ${this.score}`;

        // Start timer
        this.startTimer();
    }

         /* © SMILEX - This code is licensed and protected. */

    startTimer() {
        // Clear any existing timer
        clearInterval(this.timer);
        this.timeLeft = 15;
        const timerElement = document.getElementById('timer');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = `Time Left: ${this.timeLeft}s`;
            
            if (this.timeLeft <= 0) {
                this.handleTimeOut();
            }
        }, 1000);
    }

    checkAnswer(selectedOption) {
        // Stop the timer
        clearInterval(this.timer);

        const currentQuestion = this.questions[this.currentQuestionIndex];
        const feedbackElement = document.getElementById('feedback');

        // Check if answer is correct
        if (selectedOption === currentQuestion.decodedCorrectAnswer) {
            this.score++;
            feedbackElement.textContent = 'Correct!';
            feedbackElement.className = 'correct';
        } else {
            feedbackElement.textContent = `Wrong! Correct answer was: ${currentQuestion.decodedCorrectAnswer}`;
            feedbackElement.className = 'incorrect';
        }

             /* © SMILEX - This code is licensed and protected. */

        // Save progress
        this.saveProgress();

        // Move to next question after a delay
        setTimeout(() => {
            this.nextQuestion();
        }, 4000);
    }

    handleTimeOut() {
        clearInterval(this.timer);
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = 'Time is up!';
        feedbackElement.className = 'incorrect';

        setTimeout(() => this.nextQuestion(), 3000);
    }

         /* © SMILEX - This code is licensed and protected. */

    nextQuestion() {
        // Clear feedback
        document.getElementById('feedback').textContent = '';

        // Move to next question or fetch new questions
        this.currentQuestionIndex++;

        // If we're running out of questions, fetch more
        if (this.currentQuestionIndex >= this.questions.length) {
            this.fetchQuestions();
        } else {
            this.loadQuestion();
        }
    }

    saveProgress() {
        const progress = {
            questionIndex: this.currentQuestionIndex,
            score: this.score
        };
        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }

    handleError(message) {
        const questionContainer = document.getElementById('question-container');
        questionContainer.innerHTML = `<p style="color: red;">Error: ${message}</p>`;
    }
}

     /* © SMILEX - This code is licensed and protected. */

// Lightweight HTML decoder (since the API returns encoded HTML)
const he = {
    decode: function(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
};

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new UnstoppableQuiz();
});



const starfield = document.getElementById('starfield');
const starCount = 200;

function createStars() {
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        
        // Random star size
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random vertical position
        star.style.top = `${Math.random() * 100}%`;
        
        // Randomized animation speed
        const speed = 10 + Math.random() * 30;
        star.style.animationDuration = `${speed}s`;
        
        // Slight opacity variation
        star.style.opacity = 0.5 + Math.random() * 0.5;
        
        star.classList.add('star');
        starfield.appendChild(star);
    }
}

// Create stars
createStars();

// Recreate stars on window resize
window.addEventListener('resize', () => {
    starfield.innerHTML = '';
    createStars();
});
     /* © SMILEX - This code is licensed and protected. */
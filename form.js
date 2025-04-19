class AdvancedPersonalityQuiz {
    constructor() {
        this.questions = document.querySelectorAll('.question');
        this.progressBar = document.getElementById('progressBar');
        this.thankYouSection = document.getElementById('thankYou');
        this.currentQuestionIndex = 0;
        this.responses = {};

        this.initEventListeners();
    }

    initEventListeners() {
        document.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('click', () => this.handleResponse(button));
        });
    }

    handleResponse(button) {
        const questionElement = button.closest('.question');
        const questionNumber = questionElement.dataset.question;
        const value = button.dataset.value;

        // Store response
        this.responses[questionNumber] = value;

        // Move to next question
        this.showNextQuestion();
    }

    showNextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            // Hide current question
            this.questions[this.currentQuestionIndex].classList.remove('active');
            
            // Move to next question
            this.currentQuestionIndex++;
            this.questions[this.currentQuestionIndex].classList.add('active');
            
            // Update progress bar
            this.updateProgressBar();
        } else {
            this.finishQuiz();
        }
    }

    updateProgressBar() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    finishQuiz() {
        // Hide last question
        this.questions[this.currentQuestionIndex].classList.remove('active');
        
        // Show thank you section
        this.thankYouSection.style.display = 'block';

        // Log or send responses (you can implement API call here)
        console.log('Comprehensive Quiz Responses:', this.responses);

        // Redirect to next page after processing
        setTimeout(() => {
            // You can customize the redirect URL
            window.location.href = this.generatePersonalizedRedirectURL();
        }, 2500);
    }

    generatePersonalizedRedirectURL() {
        // Create a personalized redirect based on responses
        window.location.href = 'home.html';
        const queryParams = new URLSearchParams(this.responses).toString();
        return baseURL + queryParams;
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedPersonalityQuiz();
});
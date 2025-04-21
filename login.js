class MyAuthentication {
    constructor() {
        this.loginToggle = document.getElementById('loginToggle');
        this.signupToggle = document.getElementById('signupToggle');
        this.loginSection = document.getElementById('loginSection');
        this.signupSection = document.getElementById('signupSection');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Toggle form
        this.loginToggle.addEventListener('click', () => this.switchToLogin());
        this.signupToggle.addEventListener('click', () => this.switchToSignup());

        // Login validation
        document.getElementById('login-btn').addEventListener('click', () => {
            this.validateLogin();
        });

        // Signup validation
        document.getElementById('signup-btn').addEventListener('click', () => {
            this.validateSignup();
        });
    }

    

    switchToLogin() {
        this.loginToggle.classList.add('active');
        this.signupToggle.classList.remove('active');
        
        this.loginSection.classList.add('active');
        this.signupSection.classList.remove('active');
    }

    switchToSignup() {
        this.signupToggle.classList.add('active');
        this.loginToggle.classList.remove('active');
        
        this.signupSection.classList.add('active');
        this.loginSection.classList.remove('active');
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateLogin() {
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        const errorElement = document.getElementById('login-error');

        // Reset previous errors
        errorElement.textContent = '';

        // Validate email
        if (!this.validateEmail(email.value)) {
            errorElement.textContent = 'Please enter a valid email address';
            return;
        }

        // Validate password
        if (password.value.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters long';
            return;
        }

        // If all validations pass
        alert('Login Successful!');
    }

    validateSignup() {
        const name = document.getElementById('signup-name');
        const email = document.getElementById('signup-email');
        const password = document.getElementById('signup-password');
        const confirmPassword = document.getElementById('confirm-password');
        const errorElement = document.getElementById('signup-error');

        // Reset previous errors
        errorElement.textContent = '';

        // Validate name
        if (name.value.trim().length < 2) {
            errorElement.textContent = 'Please enter a valid name';
            return;
        }

        // Validate email
        if (!this.validateEmail(email.value)) {
            errorElement.textContent = 'Please enter a valid email address';
            return;
        }

        // Validate password
        if (password.value.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters long';
            return;
        }

        // Validate password confirmation
        if (password.value !== confirmPassword.value) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }

        // If all validations pass
        alert('Signup Successful!');
    }
}

// Initialize Authentication
new MyAuthentication();


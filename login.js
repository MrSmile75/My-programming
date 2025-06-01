// ==================== ENHANCED FORM VALIDATION ====================
class AdvancedFormValidator {
    constructor() {
        this.passwordStrengthMeter = document.getElementById('passwordStrengthMeter');
        this.passwordFeedback = document.getElementById('passwordFeedback');
        this.strengthIndicator = document.getElementById('strengthIndicator');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Real-time validation
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        const signupName = document.getElementById('signupName');
        const signupEmail = document.getElementById('signupEmail');
        const signupPassword = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        // Login form
        loginEmail.addEventListener('input', () => this.validateEmailRealTime(loginEmail, 'loginEmailError'));
        loginEmail.addEventListener('blur', () => this.validateEmail(loginEmail, 'loginEmailError'));
        loginPassword.addEventListener('blur', () => this.validateRequired(loginPassword, 'loginPasswordError', 'Password is required'));
        
        // Signup form
        signupName.addEventListener('input', () => this.validateNameRealTime(signupName, 'signupNameError'));
        signupName.addEventListener('blur', () => this.validateName(signupName, 'signupNameError'));
        signupEmail.addEventListener('input', () => this.validateEmailRealTime(signupEmail, 'signupEmailError'));
        signupEmail.addEventListener('blur', () => this.validateEmail(signupEmail, 'signupEmailError'));
        signupPassword.addEventListener('input', () => this.checkPasswordStrength(signupPassword.value));
        confirmPassword.addEventListener('input', () => this.validatePasswordMatchRealTime(signupPassword.value, confirmPassword.value));
        confirmPassword.addEventListener('blur', () => this.validatePasswordMatch(signupPassword.value, confirmPassword.value));
    }
    
    validateEmailRealTime(input, errorId) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value && !emailRegex.test(input.value)) {
            this.setInvalid(input, document.getElementById(errorId), '');
        } else if (input.value && emailRegex.test(input.value)) {
            this.setValid(input, document.getElementById(errorId));
        } else {
            this.clearValidation(input, document.getElementById(errorId));
        }
    }
    
    validateNameRealTime(input, errorId) {
        if (input.value && input.value.trim().length < 2) {
            this.setInvalid(input, document.getElementById(errorId), '');
        } else if (input.value && input.value.trim().length >= 2) {
            this.setValid(input, document.getElementById(errorId));
        } else {
            this.clearValidation(input, document.getElementById(errorId));
        }
    }
    
    validatePasswordMatchRealTime(password, confirmPassword) {
        const input = document.getElementById('confirmPassword');
        const errorElement = document.getElementById('confirmPasswordError');
        
        if (confirmPassword && password !== confirmPassword) {
            this.setInvalid(input, errorElement, '');
        } else if (confirmPassword && password === confirmPassword) {
            this.setValid(input, errorElement);
        } else {
            this.clearValidation(input, errorElement);
        }
    }
    
    validateEmail(input, errorId) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorElement = document.getElementById(errorId);
        
        if (!input.value) {
            this.setInvalid(input, errorElement, 'Email address is required');
            return false;
        } else if (!emailRegex.test(input.value)) {
            this.setInvalid(input, errorElement, 'Please enter a valid email address');
            return false;
        } else {
            this.setValid(input, errorElement);
            return true;
        }
    }
    
    validateName(input, errorId) {
        const errorElement = document.getElementById(errorId);
        
        if (!input.value.trim()) {
            this.setInvalid(input, errorElement, 'Full name is required');
            return false;
        } else if (input.value.trim().length < 2) {
            this.setInvalid(input, errorElement, 'Name must be at least 2 characters');
            return false;
        } else {
            this.setValid(input, errorElement);
            return true;
        }
    }
    
    validateRequired(input, errorId, message) {
        const errorElement = document.getElementById(errorId);
        
        if (!input.value.trim()) {
            this.setInvalid(input, errorElement, message);
            return false;
        } else {
            this.setValid(input, errorElement);
            return true;
        }
    }
    
    validatePasswordMatch(password, confirmPassword) {
        const errorElement = document.getElementById('confirmPasswordError');
        const input = document.getElementById('confirmPassword');
        
        if (!confirmPassword) {
            this.setInvalid(input, errorElement, 'Please confirm your password');
            return false;
        } else if (password !== confirmPassword) {
            this.setInvalid(input, errorElement, 'Passwords do not match');
            return false;
        } else {
            this.setValid(input, errorElement);
            return true;
        }
    }
    
    checkPasswordStrength(password) {
        const criteria = [
            { regex: /.{8,}/, message: '8+ characters' },
            { regex: /[A-Z]/, message: 'uppercase letter' },
            { regex: /[a-z]/, message: 'lowercase letter' },
            { regex: /[0-9]/, message: 'number' },
            { regex: /[^A-Za-z0-9]/, message: 'special character' }
        ];
        
        let strength = 0;
        let passedCriteria = 0;
        let missingCriteria = [];
        
        criteria.forEach((criterion, index) => {
            const dot = this.strengthIndicator.children[index];
            if (criterion.regex.test(password)) {
                strength += 20;
                passedCriteria++;
                dot.classList.add('active');
            } else {
                missingCriteria.push(criterion.message);
                dot.classList.remove('active');
            }
        });
        
        // Update strength meter
        this.passwordStrengthMeter.style.width = `${strength}%`;
        
        // Update feedback
        let feedbackText = '';
        let feedbackColor = '';
        
        if (!password) {
            feedbackText = '';
            feedbackColor = '';
        } else if (strength <= 40) {
            feedbackText = `Weak password - Add ${missingCriteria.join(', ')}`;
            feedbackColor = 'var(--error-color)';
            this.passwordStrengthMeter.style.background = 'var(--error-color)';
        } else if (strength <= 80) {
            feedbackText = `Good password - Add ${missingCriteria.join(', ')}`;
            feedbackColor = 'var(--warning-color)';
            this.passwordStrengthMeter.style.background = 'var(--warning-color)';
        } else {
            feedbackText = 'Strong password ✓';
            feedbackColor = 'var(--success-color)';
            this.passwordStrengthMeter.style.background = 'var(--success-color)';
        }
        
        this.passwordFeedback.textContent = feedbackText;
        this.passwordFeedback.style.color = feedbackColor;
        
        return strength === 100;
    }
    
    setValid(input, errorElement) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorElement.textContent = '';
        errorElement.classList.remove('error');
        errorElement.classList.add('success');
    }
    
    setInvalid(input, errorElement, message) {
        input.classList.remove('valid');
        input.classList.add('invalid');
        errorElement.textContent = message;
        errorElement.classList.remove('success');
        errorElement.classList.add('error');
    }
    
    clearValidation(input, errorElement) {
        input.classList.remove('valid', 'invalid');
        errorElement.textContent = '';
        errorElement.classList.remove('success', 'error');
    }
    
    validateLoginForm() {
        const email = document.getElementById('loginEmail');
        const password = document.getElementById('loginPassword');
        
        const isEmailValid = this.validateEmail(email, 'loginEmailError');
        const isPasswordValid = this.validateRequired(password, 'loginPasswordError', 'Password is required');
        
        return isEmailValid && isPasswordValid;
    }
    
    validateSignupForm() {
        const name = document.getElementById('signupName');
        const email = document.getElementById('signupEmail');
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        const isNameValid = this.validateName(name, 'signupNameError');
        const isEmailValid = this.validateEmail(email, 'signupEmailError');
        const isPasswordStrong = this.checkPasswordStrength(password.value);
        const isPasswordMatch = this.validatePasswordMatch(password.value, confirmPassword.value);
        
        return isNameValid && isEmailValid && isPasswordStrong && isPasswordMatch;
    }
}

// ==================== ENHANCED NOTIFICATION SYSTEM ====================
class AdvancedNotificationSystem {
    constructor() {
        this.notification = document.getElementById('notification');
        this.timeout = null;
        this.queue = [];
        this.isShowing = false;
    }
    
    show(message, type = 'success', duration = 4000) {
        const notification = { message, type, duration };
        
        if (this.isShowing) {
            this.queue.push(notification);
            return;
        }
        
        this.displayNotification(notification);
    }
    
    displayNotification({ message, type, duration }) {
        this.isShowing = true;
        
        // Clear any existing timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        // Set message and type
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        
        // Show notification
        setTimeout(() => {
            this.notification.classList.add('show');
        }, 100);
        
        // Hide after duration
        this.timeout = setTimeout(() => {
            this.notification.classList.remove('show');
            this.isShowing = false;
            
            // Show next notification in queue
            if (this.queue.length > 0) {
                const nextNotification = this.queue.shift();
                setTimeout(() => {
                    this.displayNotification(nextNotification);
                }, 300);
            }
        }, duration);
    }
    
    clear() {
        this.queue = [];
        this.notification.classList.remove('show');
        this.isShowing = false;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}

// ==================== SOCIAL LOGIN HANDLER ====================
class SocialLoginHandler {
    constructor(notificationSystem) {
        this.notification = notificationSystem;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Google Login
        document.getElementById('googleLogin').addEventListener('click', () => {
            this.handleGoogleLogin();
        });
        
        // Facebook Login
        document.getElementById('facebookLogin').addEventListener('click', () => {
            this.handleFacebookLogin();
        });
        
        // GitHub Login
        document.getElementById('githubLogin').addEventListener('click', () => {
            this.handleGithubLogin();
        });
        
        // Twitter/X Login
        document.getElementById('twitterLogin').addEventListener('click', () => {
            this.handleTwitterLogin();
        });
    }
    
    handleGoogleLogin() {
        this.notification.show('Redirecting to Google...', 'info', 2000);
        
        // Simulate loading and redirect
        setTimeout(() => {
            // In a real application, you would redirect to Google OAuth
            window.open('https://accounts.google.com/oauth/authorize?client_id=your_client_id&redirect_uri=your_redirect_uri&scope=email%20profile&response_type=code', '_blank', 'width=500,height=600');
            this.notification.show('Google login window opened. Please complete authentication.', 'success');
        }, 1000);
    }
    
    handleFacebookLogin() {
        this.notification.show('Redirecting to Facebook...', 'info', 2000);
        
        setTimeout(() => {
            // In a real application, you would redirect to Facebook OAuth
            window.open('https://www.facebook.com/v18.0/dialog/oauth?client_id=your_app_id&redirect_uri=your_redirect_uri&scope=email', '_blank', 'width=500,height=600');
            this.notification.show('Facebook login window opened. Please complete authentication.', 'success');
        }, 1000);
    }
    
    handleGithubLogin() {
        this.notification.show('Redirecting to GitHub...', 'info', 2000);
        
        setTimeout(() => {
            // In a real application, you would redirect to GitHub OAuth
            window.open('https://github.com/login/oauth/authorize?client_id=your_client_id&redirect_uri=your_redirect_uri&scope=user:email', '_blank', 'width=500,height=600');
            this.notification.show('GitHub login window opened. Please complete authentication.', 'success');
        }, 1000);
    }
    
    handleTwitterLogin() {
        this.notification.show('Redirecting to X (Twitter)...', 'info', 2000);
        
        setTimeout(() => {
            // In a real application, you would redirect to Twitter OAuth
            window.open('https://twitter.com/i/oauth2/authorize?response_type=code&client_id=your_client_id&redirect_uri=your_redirect_uri&scope=tweet.read%20users.read', '_blank', 'width=500,height=600');
            this.notification.show('X (Twitter) login window opened. Please complete authentication.', 'success');
        }, 1000);
    }
}

// ==================== ENHANCED FORM HANDLER ====================
class AdvancedFormHandler {
    constructor() {
        this.validator = new AdvancedFormValidator();
        this.notification = new AdvancedNotificationSystem();
        this.socialLogin = new SocialLoginHandler(this.notification);
        
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.loginLoading = document.getElementById('loginLoading');
        this.signupLoading = document.getElementById('signupLoading');
        
        this.setupEventListeners();
        this.loadRememberedEmail();
    }
    
    setupEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Add enter key support for better UX
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('.form-control')) {
                const form = e.target.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        if (this.validator.validateLoginForm()) {
            this.showLoading(this.loginLoading);
            
            // Get form data
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Simulate API call
            setTimeout(() => {
                this.hideLoading(this.loginLoading);
                
                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberMeExpiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberMeExpiry');
                }
                
                this.notification.show(`Waiting for response ${email}`, 'pls waiting', 5000);
                
                // In a real app, you would redirect to dashboard
                setTimeout(() => {
                    this.notification.show('Fetching.....', 'info', 2000);
                }, 2000);
                
            }, 2000);
        } else {
            this.notification.show('Please fix the errors in the form', 'error');
        }
    }
    
    handleSignup(e) {
        e.preventDefault();
        
        if (this.validator.validateSignupForm()) {
            this.showLoading(this.signupLoading);
            
            // Get form data
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            // Simulate API call
            setTimeout(() => {
                this.hideLoading(this.signupLoading);
                this.notification.show(`Account awaiting ! Pls wait, ${name}!`, 'pls wait', 5000);
                
                // Auto-switch to login form
                setTimeout(() => {
                    toggleForm();
                    // Pre-fill email in login form
                    document.getElementById('loginEmail').value = email;
                    this.notification.show('Registering email ,pls wait', 'info');
                }, 2000);
                
            }, 2500);
        } else {
            this.notification.show('Please fix the errors in the form', 'error');
        }
    }
    
    showLoading(element) {
        element.classList.add('show');
    }
    
    hideLoading(element) {
        element.classList.remove('show');
    }
    
    loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const expiry = localStorage.getItem('rememberMeExpiry');
        
        if (rememberedEmail && expiry && Date.now() < parseInt(expiry)) {
            document.getElementById('loginEmail').value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        } else {
            // Clean up expired data
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberMeExpiry');
        }
    }
}

// ==================== MAIN INITIALIZATION ====================
// Toggle between login and signup forms
function toggleForm() {
    const container = document.getElementById('authContainer');
    container.classList.toggle('active');
    
    // Clear any validation states when switching
    setTimeout(() => {
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        document.querySelectorAll('.validation-message').forEach(msg => {
            msg.textContent = '';
            msg.classList.remove('success', 'error');
        });
    }, 400);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize form handler (includes validation and notifications)
    new AdvancedFormHandler();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // ESC key to close notifications
        if (e.key === 'Escape') {
            const notification = document.getElementById('notification');
            if (notification.classList.contains('show')) {
                notification.classList.remove('show');
            }
        }
        
        // Tab key navigation enhancement
        if (e.key === 'Tab') {
            const focusableElements = document.querySelectorAll(
                'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
});

 // Prevent right-click context menu (optional security measure)
        document.addEventListener('contextmenu', e => e.preventDefault());
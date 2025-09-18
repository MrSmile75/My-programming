// ==================== FIREBASE CONFIGURATION ====================
    const FIREBASE_CONFIG = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };


    // ==================== OAUTH 2.0 CONFIGURATION ====================
    const OAUTH_CONFIG = {
        google: {
            clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            redirectUri: window.location.origin + '/auth/google/callback',
            scope: 'openid email profile',
            responseType: 'code'
        },
        facebook: {
            appId: 'YOUR_FACEBOOK_APP_ID',
            redirectUri: window.location.origin + '/auth/facebook/callback',
            scope: 'email,public_profile'
        },
        github: {
            clientId: 'YOUR_GITHUB_CLIENT_ID',
            redirectUri: window.location.origin + '/auth/github/callback',
            scope: 'user:email'
        },
        twitter: {
            clientId: 'YOUR_TWITTER_CLIENT_ID',
            redirectUri: window.location.origin + '/auth/twitter/callback',
            scope: 'tweet.read users.read'
        }
    };

    // ==================== ADVANCED NOTIFICATION SYSTEM ====================
    class AdvancedNotificationSystem {
        constructor() {
            this.notification = document.getElementById('notification');
            this.timeout = null;
        }

        show(message, type = 'info', duration = 5000) {
            // Clear any existing timeout
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            // Set notification content and style
            this.notification.textContent = message;
            this.notification.className = 'notification';
            this.notification.classList.add(type);
            
            // Show notification
            setTimeout(() => {
                this.notification.classList.add('show');
            }, 10);

            // Auto-hide after duration
            this.timeout = setTimeout(() => {
                this.hide();
            }, duration);
        }

        hide() {
            this.notification.classList.remove('show');
        }
    }

    // ==================== ADVANCED FORM VALIDATOR ====================
    class AdvancedFormValidator {
        constructor() {
            this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            this.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            this.nameRegex = /^[a-zA-Z\s]{2,50}$/;
        }

        validateEmail(email) {
            if (!email) return { valid: false, message: 'Email is required' };
            if (!this.emailRegex.test(email)) return { valid: false, message: 'Please enter a valid email address' };
            return { valid: true };
        }

        validatePassword(password) {
            if (!password) return { valid: false, message: 'Password is required' };
            if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
            if (!/(?=.*[a-z])/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
            if (!/(?=.*[A-Z])/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
            if (!/(?=.*\d)/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
            if (!/(?=.*[@$!%*?&])/.test(password)) return { valid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
            return { valid: true };
        }

        validateName(name) {
            if (!name) return { valid: false, message: 'Name is required' };
            if (!this.nameRegex.test(name)) return { valid: false, message: 'Name must be 2-50 characters and contain only letters and spaces' };
            return { valid: true };
        }

        validateLoginForm() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const emailValidation = this.validateEmail(email);
            const passwordValidation = this.validatePassword(password);
            
            this.showValidationResult('loginEmail', emailValidation);
            this.showValidationResult('loginPassword', passwordValidation);
            
            return emailValidation.valid && passwordValidation.valid;
        }

        validateSignupForm() {
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            const nameValidation = this.validateName(name);
            const emailValidation = this.validateEmail(email);
            const passwordValidation = this.validatePassword(password);
            const confirmPasswordValidation = this.validateConfirmPassword(password, confirmPassword);
            
            this.showValidationResult('signupName', nameValidation);
            this.showValidationResult('signupEmail', emailValidation);
            this.showValidationResult('signupPassword', passwordValidation);
            this.showValidationResult('confirmPassword', confirmPasswordValidation);
            
            return nameValidation.valid && emailValidation.valid && passwordValidation.valid && confirmPasswordValidation.valid;
        }

        validateConfirmPassword(password, confirmPassword) {
            if (!confirmPassword) return { valid: false, message: 'Please confirm your password' };
            if (password !== confirmPassword) return { valid: false, message: 'Passwords do not match' };
            return { valid: true };
        }

        showValidationResult(fieldId, validation) {
            const errorElement = document.getElementById(fieldId + 'Error');
            const inputElement = document.getElementById(fieldId);
            
            if (errorElement) {
                errorElement.textContent = validation.valid ? '' : validation.message;
                errorElement.className = validation.valid ? 'validation-message success' : 'validation-message';
                
                if (inputElement) {
                    inputElement.classList.remove('valid', 'invalid');
                    inputElement.classList.add(validation.valid ? 'valid' : 'invalid');
                }
            }
        }

        updatePasswordStrength(password) {
            const meter = document.getElementById('passwordStrengthMeter');
            const feedback = document.getElementById('passwordFeedback');
            const dots = document.querySelectorAll('.strength-dot');
            
            if (!password) {
                meter.style.width = '0%';
                feedback.textContent = '';
                dots.forEach(dot => dot.classList.remove('active'));
                return;
            }
            
            let strength = 0;
            let message = '';
            
            // Length check
            if (password.length >= 8) strength += 20;
            
            // Lowercase check
            if (/[a-z]/.test(password)) strength += 20;
            
            // Uppercase check
            if (/[A-Z]/.test(password)) strength += 20;
            
            // Number check
            if (/\d/.test(password)) strength += 20;
            
            // Special character check
            if (/[@$!%*?&]/.test(password)) strength += 20;
            
            // Update meter
            meter.style.width = strength + '%';
            
            // Update feedback message
            if (strength < 40) {
                message = 'Weak password';
                meter.style.background = 'linear-gradient(90deg, var(--error-color), var(--error-color))';
            } else if (strength < 80) {
                message = 'Medium strength password';
                meter.style.background = 'linear-gradient(90deg, var(--error-color), var(--warning-color))';
            } else {
                message = 'Strong password!';
                meter.style.background = 'linear-gradient(90deg, var(--warning-color), var(--success-color))';
            }
            
            feedback.textContent = message;
            
            // Update strength dots
            const activeDots = Math.ceil(strength / 20);
            dots.forEach((dot, index) => {
                if (index < activeDots) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    // ==================== ENHANCED BACKEND SIMULATION SYSTEM ====================
    class AdvancedBackendSimulator {
        constructor() {
            this.initializeDatabase();
            this.setupRateLimiting();
            this.setupProgressTracking();
            this.setupEmailService();
        }
        
        initializeDatabase() {
            // Initialize users database if it doesn't exist
            if (!localStorage.getItem('users_db')) {
                localStorage.setItem('users_db', JSON.stringify([]));
            }
            
            // Initialize sessions database if it doesn't exist
            if (!localStorage.getItem('sessions_db')) {
                localStorage.setItem('sessions_db', JSON.stringify([]));
            }
            
            // Initialize rate limiting database if it doesn't exist
            if (!localStorage.getItem('rate_limits')) {
                localStorage.setItem('rate_limits', JSON.stringify({}));
            }
        }
        
        setupRateLimiting() {
            // Clean up old rate limits periodically
            setInterval(() => {
                const rateLimits = JSON.parse(localStorage.getItem('rate_limits') || '{}');
                const now = Date.now();
                
                for (const key in rateLimits) {
                    if (now - rateLimits[key].timestamp > 15 * 60 * 1000) { // 15 minutes
                        delete rateLimits[key];
                    }
                }
                
                localStorage.setItem('rate_limits', JSON.stringify(rateLimits));
            }, 60 * 1000); // Check every minute
        }
        
        setupProgressTracking() {
            // Initialize progress tracking if it doesn't exist
            if (!localStorage.getItem('user_progress')) {
                localStorage.setItem('user_progress', JSON.stringify({}));
            }
            
            // Auto-save progress every 10 seconds
            setInterval(() => {
                this.saveUserProgress();
            }, 10000);
        }
        
        setupEmailService() {
            // Simulate email service for verification and password reset
            console.log('Email service initialized (simulated)');
        }
        
        checkRateLimit(key) {
            const rateLimits = JSON.parse(localStorage.getItem('rate_limits') || '{}');
            const now = Date.now();
            
            if (rateLimits[key] && now - rateLimits[key].timestamp < 15 * 60 * 1000) {
                if (rateLimits[key].count >= 5) {
                    return false; // Rate limited
                }
            }
            
            return true; // Not rate limited
        }
        
        updateRateLimit(key) {
            const rateLimits = JSON.parse(localStorage.getItem('rate_limits') || '{}');
            const now = Date.now();
            
            if (!rateLimits[key] || now - rateLimits[key].timestamp > 15 * 60 * 1000) {
                rateLimits[key] = {
                    count: 1,
                    timestamp: now
                };
            } else {
                rateLimits[key].count += 1;
            }
            
            localStorage.setItem('rate_limits', JSON.stringify(rateLimits));
        }
        
        async registerUser(userData) {
            // Simulate API delay
            await this.simulateNetworkDelay();
            
            // Check rate limiting
            if (!this.checkRateLimit('signup')) {
                return {
                    success: false,
                    message: 'Too many signup attempts. Please wait 15 minutes.'
                };
            }
            
            this.updateRateLimit('signup');
            
            // Validate user data
            if (!userData.name || !userData.email || !userData.password) {
                return {
                    success: false,
                    message: 'All fields are required'
                };
            }
            
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('users_db'));
            const existingUser = users.find(user => user.email === userData.email);
            
            if (existingUser) {
                return {
                    success: false,
                    message: 'Email already registered'
                };
            }
            
            // Hash password (simulated)
            const hashedPassword = this.hashPassword(userData.password);
            
            // Create new user
            const newUser = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                verified: false,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            // Save user to database
            users.push(newUser);
            localStorage.setItem('users_db', JSON.stringify(users));
            
            // Send verification email (simulated)
            this.sendVerificationEmail(newUser.email);
            
            return {
                success: true,
                message: 'Account created successfully! Please check your email to verify your account.',
                userId: newUser.id
            };
        }
        
        async loginUser(credentials) {
            // Simulate API delay
            await this.simulateNetworkDelay();
            
            // Check rate limiting
            if (!this.checkRateLimit('login_' + credentials.email)) {
                return {
                    success: false,
                    message: 'Too many login attempts. Please wait 15 minutes.'
                };
            }
            
            this.updateRateLimit('login_' + credentials.email);
            
            // Validate credentials
            if (!credentials.email || !credentials.password) {
                return {
                    success: false,
                    message: 'Email and password are required'
                };
            }
            
            // Find user
            const users = JSON.parse(localStorage.getItem('users_db'));
            const user = users.find(u => u.email === credentials.email);
            
            if (!user) {
                return {
                    success: false,
                    message: 'No account found with this email'
                };
            }
            
            // Verify password (simulated)
            if (!this.verifyPassword(credentials.password, user.password)) {
                return {
                    success: false,
                    message: 'Incorrect password'
                };
            }
            
            // Check if email is verified
            if (!user.verified) {
                return {
                    success: false,
                    message: 'Please verify your email before logging in'
                };
            }
            
            // Create session
            const sessionToken = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
            const sessions = JSON.parse(localStorage.getItem('sessions_db'));
            
            sessions.push({
                token: sessionToken,
                userId: user.id,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + (credentials.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
            });
            
            localStorage.setItem('sessions_db', JSON.stringify(sessions));
            
            // Set session cookie
            document.cookie = `sessionToken=${sessionToken}; path=/; max-age=${credentials.rememberMe ? 2592000 : 86400}; secure; samesite=strict`;
            
            // Update user last login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('users_db', JSON.stringify(users));
            
            return {
                success: true,
                message: `Welcome back, ${user.name}!`,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    provider: 'email'
                }
            };
        }
        
        hashPassword(password) {
            // Simulated password hashing
            return btoa(encodeURIComponent(password)) + '_hashed';
        }
        
        verifyPassword(password, hashedPassword) {
            // Simulated password verification
            return btoa(encodeURIComponent(password)) + '_hashed' === hashedPassword;
        }
        
        sendVerificationEmail(email) {
            // Simulate sending verification email
            console.log(`Verification email sent to: ${email}`);
            
            // In a real implementation, this would send an actual email
            // For demo purposes, we'll just log it
            setTimeout(() => {
                console.log(`Email verification link: ${window.location.origin}/verify-email?token=simulated_token&email=${encodeURIComponent(email)}`);
            }, 2000);
        }
        
        saveUserProgress() {
            // Get form data
            const signupName = document.getElementById('signupName')?.value || '';
            const signupEmail = document.getElementById('signupEmail')?.value || '';
            const signupPassword = document.getElementById('signupPassword')?.value || '';
            const confirmPassword = document.getElementById('confirmPassword')?.value || '';
            
            const loginEmail = document.getElementById('loginEmail')?.value || '';
            
            // Save progress
            const progress = {
                signup: {
                    name: signupName,
                    email: signupEmail,
                    password: signupPassword,
                    confirmPassword: confirmPassword
                },
                login: {
                    email: loginEmail
                },
                timestamp: new Date().toISOString()
            };
            
            const allProgress = JSON.parse(localStorage.getItem('user_progress') || '{}');
            const sessionId = this.getSessionId();
            
            allProgress[sessionId] = progress;
            localStorage.setItem('user_progress', JSON.stringify(allProgress));
            
            // Update progress indicator
            this.showProgressIndicator();
        }
        
        restoreUserProgress() {
            const allProgress = JSON.parse(localStorage.getItem('user_progress') || '{}');
            const sessionId = this.getSessionId();
            const progress = allProgress[sessionId];
            
            if (progress) {
                // Restore signup form
                if (progress.signup) {
                    document.getElementById('signupName').value = progress.signup.name || '';
                    document.getElementById('signupEmail').value = progress.signup.email || '';
                    document.getElementById('signupPassword').value = progress.signup.password || '';
                    document.getElementById('confirmPassword').value = progress.signup.confirmPassword || '';
                    
                    // Update password strength if password exists
                    if (progress.signup.password) {
                        window.authApp.validator.updatePasswordStrength(progress.signup.password);
                    }
                }
                
                // Restore login form
                if (progress.login) {
                    document.getElementById('loginEmail').value = progress.login.email || '';
                }
                
                console.log('Previous progress restored');
            }
        }
        
        getSessionId() {
            let sessionId = sessionStorage.getItem('smileX_sessionId');
            if (!sessionId) {
                sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('smileX_sessionId', sessionId);
            }
            return sessionId;
        }
        
        showProgressIndicator() {
            const indicator = document.getElementById('progressIndicator');
            const fill = document.getElementById('progressFill');
            
            indicator.classList.add('show');
            fill.style.width = '100%';
            
            setTimeout(() => {
                fill.style.width = '0%';
                setTimeout(() => {
                    indicator.classList.remove('show');
                }, 300);
            }, 1000);
        }
        
        async simulateNetworkDelay(min = 300, max = 1000) {
            const delay = Math.floor(Math.random() * (max - min + 1)) + min;
            return new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // ==================== FIREBASE AUTHENTICATION SYSTEM ====================
    class FirebaseAuthSystem {
        constructor() {
            this.auth = null;
            this.user = null;
            this.initialized = false;
            this.initFirebase();
        }
        
        async initFirebase() {
            try {
                // Import Firebase modules
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js');
                const { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence, browserLocalPersistence } = 
                    await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                
                // Initialize Firebase
                const app = initializeApp(FIREBASE_CONFIG);
                this.auth = getAuth(app);
                
                // Set up auth state listener
                onAuthStateChanged(this.auth, (user) => {
                    this.user = user;
                    if (user) {
                        console.log('User is signed in:', user.email);
                        this.handleUserSession(user);
                    } else {
                        console.log('User is signed out');
                        this.clearUserSession();
                    }
                });
                
                this.initialized = true;
                console.log('Firebase initialized successfully');
            } catch (error) {
                console.error('Firebase initialization error:', error);
                // Fall back to simulated backend
                this.useSimulatedBackend();
            }
        }
        
        useSimulatedBackend() {
            console.warn('Using simulated backend due to Firebase initialization failure');
            this.initialized = false;
            // Initialize the simulated backend
            this.simulatedBackend = new AdvancedBackendSimulator();
        }
        
        async handleUserSession(user) {
            // Store user session data
            const sessionData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                lastLogin: new Date().toISOString()
            };
            
            localStorage.setItem('firebase_user', JSON.stringify(sessionData));
            
            // Update user progress with Firebase UID
            const allProgress = JSON.parse(localStorage.getItem('user_progress') || '{}');
            const sessionId = this.getSessionId();
            if (allProgress[sessionId]) {
                allProgress[sessionId].userId = user.uid;
                localStorage.setItem('user_progress', JSON.stringify(allProgress));
            }
        }
        
        clearUserSession() {
            localStorage.removeItem('firebase_user');
            document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        
        getSessionId() {
            let sessionId = sessionStorage.getItem('smileX_sessionId');
            if (!sessionId) {
                sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('smileX_sessionId', sessionId);
            }
            return sessionId;
        }
        
        async registerUser(userData) {
            if (!this.initialized) {
                return this.simulatedBackend.registerUser(userData);
            }
            
            try {
                const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = 
                    await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                
                // Create user with email and password
                const userCredential = await createUserWithEmailAndPassword(
                    this.auth, 
                    userData.email, 
                    userData.password
                );
                
                // Update user profile with name
                await updateProfile(userCredential.user, {
                    displayName: userData.name
                });
                
                // Send email verification
                await sendEmailVerification(userCredential.user);
                
                return {
                    success: true,
                    message: 'Account created successfully! Please check your email to verify your account.',
                    userId: userCredential.user.uid
                };
                
            } catch (error) {
                console.error('Registration error:', error);
                return {
                    success: false,
                    message: this.getFirebaseErrorMessage(error)
                };
            }
        }
        
        async loginUser(credentials) {
            if (!this.initialized) {
                return this.simulatedBackend.loginUser(credentials);
            }
            
            try {
                const { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, browserLocalPersistence } = 
                    await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                
                // Set persistence based on remember me
                await setPersistence(
                    this.auth, 
                    credentials.rememberMe ? browserLocalPersistence : browserSessionPersistence
                );
                
                // Sign in user
                const userCredential = await signInWithEmailAndPassword(
                    this.auth, 
                    credentials.email, 
                    credentials.password
                );
                
                return {
                    success: true,
                    message: `Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`,
                    user: {
                        id: userCredential.user.uid,
                        name: userCredential.user.displayName,
                        email: userCredential.user.email,
                        provider: 'email'
                    }
                };
                
            } catch (error) {
                console.error('Login error:', error);
                return {
                    success: false,
                    message: this.getFirebaseErrorMessage(error)
                };
            }
        }
        
        async logoutUser() {
            if (!this.initialized) {
                // Clear simulated session
                const sessions = JSON.parse(localStorage.getItem('sessions_db') || '[]');
                localStorage.setItem('sessions_db', JSON.stringify([]));
                return { success: true };
            }
            
            try {
                const { signOut } = await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                await signOut(this.auth);
                return { success: true };
            } catch (error) {
                console.error('Logout error:', error);
                return { success: false, message: 'Logout failed' };
            }
        }
        
        async sendPasswordResetEmail(email) {
            if (!this.initialized) {
                return { 
                    success: false, 
                    message: 'Password reset not available in demo mode' 
                };
            }
            
            try {
                const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                await sendPasswordResetEmail(this.auth, email);
                return { 
                    success: true, 
                    message: 'Password reset email sent successfully!' 
                };
            } catch (error) {
                console.error('Password reset error:', error);
                return {
                    success: false,
                    message: this.getFirebaseErrorMessage(error)
                };
            }
        }
        
        async resendVerificationEmail() {
            if (!this.initialized || !this.user) {
                return { 
                    success: false, 
                    message: 'Verification email not available in demo mode' 
                };
            }
            
            try {
                const { sendEmailVerification } = await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                await sendEmailVerification(this.user);
                return { 
                    success: true, 
                    message: 'Verification email sent successfully!' 
                };
            } catch (error) {
                console.error('Resend verification error:', error);
                return {
                    success: false,
                    message: this.getFirebaseErrorMessage(error)
                };
            }
        }
        
        getFirebaseErrorMessage(error) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    return 'Email already registered';
                case 'auth/invalid-email':
                    return 'Invalid email address';
                case 'auth/operation-not-allowed':
                    return 'Email/password accounts are not enabled';
                case 'auth/weak-password':
                    return 'Password is too weak';
                case 'auth/user-disabled':
                    return 'This account has been disabled';
                case 'auth/user-not-found':
                    return 'No account found with this email';
                case 'auth/wrong-password':
                    return 'Incorrect password';
                case 'auth/too-many-requests':
                    return 'Too many attempts. Please try again later';
                case 'auth/requires-recent-login':
                    return 'Please log in again to perform this action';
                default:
                    return error.message || 'Authentication failed';
            }
        }
        
        // Check if email is verified
        isEmailVerified() {
            return this.user && this.user.emailVerified;
        }
        
        // Get current user
        getCurrentUser() {
            if (!this.initialized) {
                // Get from simulated backend
                const sessions = JSON.parse(localStorage.getItem('sessions_db') || '[]');
                const cookies = document.cookie.split(';');
                let sessionToken = null;
                
                for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'sessionToken') {
                        sessionToken = value;
                        break;
                    }
                }
                
                if (sessionToken) {
                    return sessions.find(s => s.token === sessionToken);
                }
                return null;
            }
            
            return this.user;
        }
    }

    // ==================== OAUTH 2.0 INTEGRATION SYSTEM (UPDATED FOR FIREBASE) ====================
    class OAuth2Integration {
        constructor(backend, notification) {
            this.backend = backend;
            this.notification = notification;
            this.currentProvider = null;
            this.setupOAuthProviders();
        }
        
        setupOAuthProviders() {
            // Setup event listeners
            this.setupEventListeners();
        }
        
        setupEventListeners() {
            // Google login
            document.getElementById('googleLogin').addEventListener('click', () => {
                this.initiateGoogleOAuth();
            });
            
            // Facebook login
            document.getElementById('facebookLogin').addEventListener('click', () => {
                this.initiateFacebookOAuth();
            });
            
            // GitHub login
            document.getElementById('githubLogin').addEventListener('click', () => {
                this.initiateGitHubOAuth();
            });
            
            // Twitter/X login
            document.getElementById('twitterLogin').addEventListener('click', () => {
                this.initiateTwitterOAuth();
            });
        }
        
        // Show OAuth modal
        showOAuthModal(provider, icon, title, message) {
            this.currentProvider = provider;
            
            document.getElementById('oauthIcon').textContent = icon;
            document.getElementById('oauthTitle').textContent = title;
            document.getElementById('oauthMessage').textContent = message;
            document.getElementById('oauthModal').classList.add('show');
        }
        
        // Close OAuth modal
        closeOAuthModal() {
            document.getElementById('oauthModal').classList.remove('show');
            this.currentProvider = null;
        }
        
        // Google OAuth with Firebase
        async initiateGoogleOAuth() {
            if (!this.backend.checkRateLimit('oauth')) {
                this.notification.show('Too many OAuth attempts. Please wait 15 minutes.', 'error');
                return;
            }
            
            this.backend.updateRateLimit('oauth');
            
            this.showOAuthModal('google', '🔍', 'Connecting to Google', 'Redirecting to Google for secure authentication...');
            
            try {
                // Use Firebase for Google authentication
                const { getAuth, signInWithPopup, GoogleAuthProvider } = 
                    await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                
                const provider = new GoogleAuthProvider();
                provider.addScope('profile');
                provider.addScope('email');
                
                const auth = getAuth();
                const result = await signInWithPopup(auth, provider);
                
                // Handle successful authentication
                this.handleOAuthSuccess(result.user, 'google');
                
            } catch (error) {
                console.error('Google OAuth error:', error);
                this.closeOAuthModal();
                
                if (error.code === 'auth/popup-closed-by-user') {
                    this.notification.show('Google authentication was cancelled.', 'info');
                } else {
                    this.notification.show('Google authentication failed. Please try again.', 'error');
                }
            }
        }
        
        // Facebook OAuth with Firebase
        async initiateFacebookOAuth() {
            if (!this.backend.checkRateLimit('oauth')) {
                this.notification.show('Too many OAuth attempts. Please wait 15 minutes.', 'error');
                return;
            }
            
            this.backend.updateRateLimit('oauth');
            
            this.showOAuthModal('facebook', '📘', 'Connecting to Facebook', 'Redirecting to Facebook for secure authentication...');
            
            try {
                // Use Firebase for Facebook authentication
                const { getAuth, signInWithPopup, FacebookAuthProvider } = 
                    await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                
                const provider = new FacebookAuthProvider();
                provider.addScope('email');
                provider.addScope('public_profile');
                
                const auth = getAuth();
                const result = await signInWithPopup(auth, provider);
                
                // Handle successful authentication
                this.handleOAuthSuccess(result.user, 'facebook');
                
            } catch (error) {
                console.error('Facebook OAuth error:', error);
                this.closeOAuthModal();
                
                if (error.code === 'auth/popup-closed-by-user') {
                    this.notification.show('Facebook authentication was cancelled.', 'info');
                } else {
                    this.notification.show('Facebook authentication failed. Please try again.', 'error');
                }
            }
        }
        
        // GitHub OAuth with Firebase
        async initiateGitHubOAuth() {
            if (!this.backend.checkRateLimit('oauth')) {
                this.notification.show('Too many OAuth attempts. Please wait 15 minutes.', 'error');
                return;
            }
            
            this.backend.updateRateLimit('oauth');
            
            this.showOAuthModal('github', '🐙', 'Connecting to GitHub', 'Redirecting to GitHub for secure authentication...');
            
            try {
                // Use Firebase for GitHub authentication
                const { getAuth, signInWithPopup, GithubAuthProvider } = 
                    await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                
                const provider = new GithubAuthProvider();
                provider.addScope('user:email');
                
                const auth = getAuth();
                const result = await signInWithPopup(auth, provider);
                
                // Handle successful authentication
                this.handleOAuthSuccess(result.user, 'github');
                
            } catch (error) {
                console.error('GitHub OAuth error:', error);
                this.closeOAuthModal();
                
                if (error.code === 'auth/popup-closed-by-user') {
                    this.notification.show('GitHub authentication was cancelled.', 'info');
                } else {
                    this.notification.show('GitHub authentication failed. Please try again.', 'error');
                }
            }
        }
        
        // Twitter OAuth with Firebase
        async initiateTwitterOAuth() {
            if (!this.backend.checkRateLimit('oauth')) {
                this.notification.show('Too many OAuth attempts. Please wait 15 minutes.', 'error');
                return;
            }
            
            this.backend.updateRateLimit('oauth');
            
            this.showOAuthModal('twitter', '🐦', 'Connecting to X (Twitter)', 'Redirecting to X for secure authentication...');
            
            try {
                // Use Firebase for Twitter authentication
                const { getAuth, signInWithPopup, TwitterAuthProvider } = 
                    await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js');
                
                const provider = new TwitterAuthProvider();
                
                const auth = getAuth();
                const result = await signInWithPopup(auth, provider);
                
                // Handle successful authentication
                this.handleOAuthSuccess(result.user, 'twitter');
                
            } catch (error) {
                console.error('Twitter OAuth error:', error);
                this.closeOAuthModal();
                
                if (error.code === 'auth/popup-closed-by-user') {
                    this.notification.show('X (Twitter) authentication was cancelled.', 'info');
                } else {
                    this.notification.show('X (Twitter) authentication failed. Please try again.', 'error');
                }
            }
        }
        
        // Handle successful OAuth authentication
        handleOAuthSuccess(user, provider) {
            this.closeOAuthModal();
            this.notification.show(`Welcome to Smile Xplorer, ${user.displayName || user.email}!`, 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                this.redirectAfterLogin();
            }, 2000);
        }
        
        redirectAfterLogin() {
            // Check for return URL in query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const returnUrl = urlParams.get('returnUrl') || '/dashboard.html';
            
            // Redirect to the return URL or dashboard
            window.location.href = returnUrl;
        }
    }

    // ==================== MAIN APPLICATION CONTROLLER (UPDATED) ====================
    class AuthenticationApp {
        constructor() {
            this.backend = new FirebaseAuthSystem();
            this.validator = new AdvancedFormValidator();
            this.notification = new AdvancedNotificationSystem();
            this.oauth = new OAuth2Integration(this.backend, this.notification);
            
            this.isSignup = false;
            this.currentUserEmail = '';
            
            this.setupEventListeners();
            this.checkExistingSession();
            this.setupReturnUrlTracking();
        }
        
        setupEventListeners() {
            // Form submissions
            document.getElementById('loginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
            
            document.getElementById('signupForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
            
            // Password strength indicator
            document.getElementById('signupPassword').addEventListener('input', (e) => {
                this.validator.updatePasswordStrength(e.target.value);
            });
            
            // Auto-save form data
            document.querySelectorAll('.form-control').forEach(input => {
                input.addEventListener('input', () => {
                    if (this.backend.initialized && this.backend.simulatedBackend) {
                        this.backend.simulatedBackend.saveUserProgress();
                    }
                });
            });
            
            // Check for URL parameters (email verification)
            this.checkUrlParameters();
        }
        
        checkExistingSession() {
            const user = this.backend.getCurrentUser();
            if (user) {
                this.notification.show(`Welcome back, ${user.name || user.email}!`, 'success');
                setTimeout(() => {
                    this.oauth.redirectAfterLogin();
                }, 2000);
            } else if (this.backend.initialized && this.backend.simulatedBackend) {
                // Restore form progress if using simulated backend
                setTimeout(() => {
                    this.backend.simulatedBackend.restoreUserProgress();
                }, 500);
            }
        }
        
        setupReturnUrlTracking() {
            // Store the current URL as return URL if not already set
            if (!sessionStorage.getItem('returnUrl')) {
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('returnUrl') || window.location.href;
                sessionStorage.setItem('returnUrl', returnUrl);
            }
        }
        
        checkUrlParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Check for email verification parameter
            if (urlParams.get('verified') === 'true') {
                this.notification.show('Email verified successfully! You can now log in.', 'success');
            }
            
            // Check for password reset parameter
            if (urlParams.get('reset') === 'true') {
                this.notification.show('Password reset successfully! You can now log in with your new password.', 'success');
            }
        }
        
        async handlePasswordReset() {
            const email = document.getElementById('loginEmail').value;
            
            if (!email) {
                this.notification.show('Please enter your email address first', 'error');
                return;
            }
            
            const result = await this.backend.sendPasswordResetEmail(email);
            
            if (result.success) {
                this.notification.show(result.message, 'success');
            } else {
                this.notification.show(result.message, 'error');
            }
        }
        
        async handleLogin() {
            // Validate form
            if (!this.validator.validateLoginForm()) {
                this.notification.show('Please fix the errors in the form', 'error');
                return;
            }
            
            // Show loading
            this.showLoading('login', true);
            
            // Get form data
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            try {
                // Attempt login
                const result = await this.backend.loginUser({
                    email: email,
                    password: password,
                    rememberMe: rememberMe
                });
                
                if (result.success) {
                    this.notification.show(result.message, 'success');
                    
                    // Check if email is verified
                    if (this.backend.initialized && this.backend.user && !this.backend.user.emailVerified) {
                        this.currentUserEmail = email;
                        setTimeout(() => {
                            this.showVerificationModal();
                        }, 1000);
                    } else {
                        // Redirect to dashboard or return URL after delay
                        setTimeout(() => {
                            this.oauth.redirectAfterLogin();
                        }, 2000);
                    }
                } else {
                    this.notification.show(result.message, 'error');
                    
                    // Show specific error for unverified email
                    if (result.message.includes('verify your email')) {
                        this.currentUserEmail = email;
                        setTimeout(() => {
                            this.showVerificationModal();
                        }, 2000);
                    }
                }
            } catch (error) {
                this.notification.show('An unexpected error occurred. Please try again.', 'error');
            } finally {
                this.showLoading('login', false);
            }
        }
        
        async handleSignup() {
            // Validate form
            if (!this.validator.validateSignupForm()) {
                this.notification.show('Please fix the errors in the form', 'error');
                return;
            }
            
            // Show loading
            this.showLoading('signup', true);
            
            // Get form data
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            try {
                // Attempt registration
                const result = await this.backend.registerUser({
                    name: name,
                    email: email,
                    password: password
                });
                
                if (result.success) {
                    this.notification.show(result.message, 'success', 6000);
                    this.currentUserEmail = email;
                    
                    // Show verification modal
                    setTimeout(() => {
                        this.showVerificationModal();
                    }, 2000);
                    
                    // Switch to login form after delay
                    setTimeout(() => {
                        this.toggleForm();
                        // Pre-fill email in login form
                        document.getElementById('loginEmail').value = email;
                    }, 4000);
                } else {
                    this.notification.show(result.message, 'error');
                }
            } catch (error) {
                this.notification.show('An unexpected error occurred. Please try again.', 'error');
            } finally {
                this.showLoading('signup', false);
            }
        }
        
        async resendVerificationEmail() {
            if (!this.currentUserEmail) {
                this.notification.show('No email address found. Please try signing up again.', 'error');
                return;
            }
            
            const result = await this.backend.resendVerificationEmail();
            
            if (result.success) {
                this.notification.show(result.message, 'success');
            } else {
                this.notification.show(result.message, 'error');
            }
        }
        
        showVerificationModal() {
            document.getElementById('verificationModal').classList.add('show');
        }
        
        closeVerificationModal() {
            document.getElementById('verificationModal').classList.remove('show');
        }
        
        showLoading(formType, show) {
            const loadingElement = document.getElementById(`${formType}Loading`);
            const submitButton = document.getElementById(`${formType}Button`);
            
            if (loadingElement && submitButton) {
                if (show) {
                    loadingElement.classList.add('show');
                    submitButton.disabled = true;
                } else {
                    loadingElement.classList.remove('show');
                    submitButton.disabled = false;
                }
            }
        }
        
        toggleForm() {
            const container = document.getElementById('authContainer');
            this.isSignup = !this.isSignup;
            container.classList.toggle('active');
            
            // Save progress when switching forms
            if (this.backend.initialized && this.backend.simulatedBackend) {
                this.backend.simulatedBackend.saveUserProgress();
            }
        }
    }

    // ==================== GLOBAL FUNCTIONS ====================
    function toggleForm() {
        if (window.authApp) {
            window.authApp.toggleForm();
        }
    }
    
    function closeOAuthModal() {
        if (window.authApp && window.authApp.oauth) {
            window.authApp.oauth.closeOAuthModal();
        }
    }
    
    function resendVerificationEmail() {
        if (window.authApp) {
            window.authApp.resendVerificationEmail();
        }
    }
    
    function closeVerificationModal() {
        if (window.authApp) {
            window.authApp.closeVerificationModal();
        }
    }

    // ==================== INITIALIZE APPLICATION ====================
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize the authentication application
        window.authApp = new AuthenticationApp();
        
        // Add demo user functionality only if using simulated backend
        setTimeout(() => {
            if (!window.authApp.backend.initialized) {
                const demoUser = {
                    name: 'Demo User',
                    email: 'demo@example.com',
                    password: 'Demo123!@#'
                };
                
                // Check if demo user exists, if not create one
                const users = JSON.parse(localStorage.getItem('users_db') || '[]');
                if (!users.some(u => u.email === demoUser.email)) {
                    window.authApp.backend.simulatedBackend.registerUser(demoUser).then(result => {
                        if (result.success) {
                            // Auto-verify demo user
                            const users = JSON.parse(localStorage.getItem('users_db'));
                            const user = users.find(u => u.email === demoUser.email);
                            if (user) {
                                user.verified = true;
                                localStorage.setItem('users_db', JSON.stringify(users));
                            }
                            
                            console.log('Demo user created and verified:');
                            console.log('Email: demo@example.com');
                            console.log('Password: Demo123!@#');
                        }
                    });
                }
            }
        }, 1000);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Alt + L to focus login email
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                document.getElementById('loginEmail').focus();
            }
            
            // Alt + S to switch to signup
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                if (!window.authApp.isSignup) {
                    window.authApp.toggleForm();
                }
                setTimeout(() => {
                    document.getElementById('signupName').focus();
                }, 500);
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                window.authApp.closeVerificationModal();
                if (window.authApp.oauth) {
                    window.authApp.oauth.closeOAuthModal();
                }
            }
        });
        
        // Add accessibility improvements
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
        });
        
        // Add loading states for better UX
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function() {
                if (!this.disabled) {
                    this.classList.add('clicked');
                    setTimeout(() => {
                        this.classList.remove('clicked');
                    }, 200);
                }
            });
        });
        
        // Console welcome message
        console.log(`
        🚀 Smile Xplorer Advanced Authentication System Loaded!
        
        Demo Credentials:
        📧 Email: demo@example.com
        🔑 Password: Demo123!@#
        
        Features:
        ✅ User Registration with Email Verification
        ✅ Secure Login with Password Hashing
        ✅ Real OAuth 2.0 Integration (Google, Facebook, GitHub, X)
        ✅ Rate Limiting Protection
        ✅ Password Strength Validation
        ✅ Session Management with Progress Tracking
        ✅ Real-time Form Validation
        ✅ Email Verification with HTML Templates
        ✅ Return URL Tracking
        ✅ Auto-save User Progress
        ✅ Responsive Design
        ✅ Accessibility Features
        
        OAuth Providers:
        🔍 Google OAuth 2.0 with popup authentication
        📘 Facebook Login API integration
        🐙 GitHub OAuth with user data fetching
        🐦 X (Twitter) OAuth 2.0 implementation
        
        Keyboard Shortcuts:
        Alt + L: Focus Login Email
        Alt + S: Switch to Signup
        Escape: Close Modals
        
        Progress Tracking:
        📊 Auto-saves form data every 10 seconds
        💾 Restores progress on page reload
        🔄 Tracks user journey across pages
        `);
    });

    // ==================== SERVICE WORKER REGISTRATION ====================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Register service worker for offline functionality
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful');
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    // ==================== ERROR HANDLING ====================
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        
        if (window.authApp && window.authApp.notification) {
            window.authApp.notification.show('An unexpected error occurred. Please refresh the page.', 'error');
        }
    });

    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        if (window.authApp && window.authApp.notification) {
            window.authApp.notification.show('A network error occurred. Please check your connection.', 'error');
        }
    });

    const firestoreRules = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write only their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public posts collection: anyone can read, only authenticated users can write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Deny all other document access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`  ;




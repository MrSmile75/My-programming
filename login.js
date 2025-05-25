       // Form Toggle Function
       function toggleForm() {
        const container = document.getElementById('authContainer');
        container.classList.toggle('active');
    }

    // Password Strength Checker
    function checkPasswordStrength(password) {
        const strengthMeter = document.querySelector('.password-strength-meter');
        const criteria = [
            { regex: /.{8,}/, points: 20 },     // Length
            { regex: /[A-Z]/, points: 20 },     // Uppercase
            { regex: /[a-z]/, points: 20 },     // Lowercase
            { regex: /[0-9]/, points: 20 },     // Number
            { regex: /[^A-Za-z0-9]/, points: 20 } // Special Character
        ];

        let strength = 0;
        criteria.forEach(criterion => {
            if (criterion.regex.test(password)) {
                strength += criterion.points;
            }
        });

            /* © SMILEX - This code is licensed and protected. */

        strengthMeter.style.width = `${strength}%`;
        
        // Color coding
        if (strength <= 40) strengthMeter.style.backgroundColor = 'red';
        else if (strength <= 80) strengthMeter.style.backgroundColor = 'orange';
        else strengthMeter.style.backgroundColor = 'green';

        return strength === 100;
    }

    // Signup Form Validation
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;

        // Comprehensive Validation
        if (!name || !email) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const isStrongPassword = checkPasswordStrength(password);
        if (!isStrongPassword) {
            alert('Password is not strong enough. Include uppercase, lowercase, numbers, and special characters.');
            return;
        }

        // Successful Signup Logic
        alert('Signup Successful!');
    });

        /* © SMILEX - This code is licensed and protected. */

    // Login Form Validation
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Simulated Login Logic
        if (rememberMe) {
            // In real-world scenario, implement secure token storage
            localStorage.setItem('rememberedEmail', email);
        }

        
    });

        /* © SMILEX - This code is licensed and protected. */

    // Password Strength Real-time Check
    document.getElementById('signupPassword').addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

    // Check for Remembered Email on Page Load
    window.addEventListener('load', () => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            document.getElementById('loginEmail').value = rememberedEmail;
        }
    });


    class StarBackground {
        constructor() {
            this.starfield = document.getElementById('starfield');
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            
            this.createStars();
            this.setupEventListeners();
        }

        createStars() {
            const starCount = 400;

            for (let i = 0; i < starCount; i++) {
                const star = this.createSingleStar();
                this.starfield.appendChild(star);
            }
        }

        createSingleStar() {
            const star = document.createElement('div');
            star.classList.add('star');

            // Random vertical positioning
            const y = Math.random() * this.height;

            // Random size
            const size = Math.random() * 2;

            // Random animation duration for varied movement
            const animationDuration = (Math.random() * 10 + 5) + 's';

            star.style.cssText = `
                top: ${y}px;
                left: -10px;
                width: ${size}px;
                height: ${size}px;
                animation-duration: ${animationDuration};
                opacity: ${Math.random()};
            `;

            // Remove star when it goes off-screen
            star.addEventListener('animationend', () => {
                this.starfield.removeChild(star);
                this.starfield.appendChild(this.createSingleStar());
            });
            /* © SMILEX - This code is licensed and protected. */

            return star;
        }

        setupEventListeners() {
            window.addEventListener('resize', () => {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
            });
        }
    }
/* © SMILEX - This code is licensed and protected. */
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        new StarBackground();
    });

        /* © SMILEX - This code is licensed and protected. */
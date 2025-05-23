    /* © SMILEX - This code is licensed and protected. */
class DynamicTypingText {
    constructor(element, phrases, options = {}) {
        this.element = element;
        this.phrases = phrases;
        this.options = {
            typingSpeed: 100,
            deletingSpeed: 50,
            pauseBetween: 8000,
            ...options
        };
        this.phraseIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.cursorElement = null;
        this.init();
    }

        /* © SMILEX - This code is licensed and protected. */

    init() {
        this.createCursor();
        this.type();
    }

    createCursor() {
        this.cursorElement = document.createElement('span');
        this.cursorElement.classList.add('typing-cursor');
        this.element.parentNode.appendChild(this.cursorElement);
    }

        /* © SMILEX - This code is licensed and protected. */

    type() {
        const currentPhrase = this.phrases[this.phraseIndex];
        const speed = this.isDeleting ? this.options.deletingSpeed : this.options.typingSpeed;

        if (!this.isDeleting && this.charIndex <= currentPhrase.length) {
            this.element.textContent = currentPhrase.substring(0, this.charIndex + 1);
            this.charIndex++;
        } 
        else if (this.isDeleting && this.charIndex >= 0) {
            this.element.textContent = currentPhrase.substring(0, this.charIndex);
            this.charIndex--;
        } 

            /* © SMILEX - This code is licensed and protected. */
        else {
            this.isDeleting = !this.isDeleting;
            this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;

            if (!this.isDeleting) {
                setTimeout(() => this.type(), this.options.pauseBetween);
                return;
            }
        }

        setTimeout(() => this.type(), speed);
    }
}

    /* © SMILEX - This code is licensed and protected. */

// Initialize the dynamic typing text when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const typingTextElement = document.getElementById('typing-text');
    
    // Array of phrases to type
    const phrases = [
        'Hello,there.',
        'Bring dreams to reality',
        'By Typing Anying',
    ];

        /* © SMILEX - This code is licensed and protected. */

    new DynamicTypingText(typingTextElement, phrases, {
        typingSpeed: 100,
        deletingSpeed: 50,
        pauseBetween: 400,
    });
});

    /* © SMILEX - This code is licensed and protected. */


class QuantumMessenger {
    constructor() {
        this.input = document.getElementById('quantumInput');
        this.charCount = document.getElementById('charCount');
        this.notificationArea = document.getElementById('notificationArea');
        this.notification = document.getElementById('notification');
        
        this.setupEventListeners();
    }

        /* © SMILEX - This code is licensed and protected. */

    setupEventListeners() {
        this.input.addEventListener('input', () => this.updateCharCount());
        
        document.querySelector('.emoji-picker').addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                this.input.value += e.target.textContent;
                this.input.focus();
                this.updateCharCount();
            }
        });
    }

        /* © SMILEX - This code is licensed and protected. */

    updateCharCount() {
        const currentLength = this.input.value.length;
        this.charCount.textContent = `${currentLength} / 250`;
        
        this.charCount.style.color = currentLength > 250 
            ? 'rgba(255,0,0,0.7)' 
            : 'var(--primary-color)';
    }

        /* © SMILEX - This code is licensed and protected. */

    showNotification(message, type = 'error') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notificationArea.style.opacity = '1';
        
        setTimeout(() => {
            this.notificationArea.style.opacity = '0';
        }, 3000);
    }

        /* © SMILEX - This code is licensed and protected. */

    validateMessage(message) {
        if (!message) {
            this.showNotification('Input Something');
            return false;
        }

        if (message.length > 250) {
            this.showNotification('Too Lengthy');
            return false;
        }

        return true;
    }

        /* © SMILEX - This code is licensed and protected. */

    transmitMessage() {
        const message = this.input.value.trim();

        if (!this.validateMessage(message)) return;

        // Simulated message transmission
        console.log('Transmitting input:', message);
        
        this.showNotification('Input transmitting!', 'success');
        
        // Reset input
        this.input.value = '';
        this.updateCharCount();
    }
}

    /* © SMILEX - This code is licensed and protected. */

// Initialize the Quantum Messenger
const quantumMessenger = new QuantumMessenger();

// Expose transmit method globally
function transmitMessage() {
    quantumMessenger.transmitMessage();
}

    /* © SMILEX - This code is licensed and protected. */


document.addEventListener('DOMContentLoaded', () => {
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    const welcomeText = document.getElementById('welcomeText');

    // Create particle effect
    function createParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            particle.style.width = `${Math.random() * 10}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${5 + Math.random() * 5}s`;
            particle.style.opacity = Math.random();

            welcomeOverlay.appendChild(particle);
        }
    }

        /* © SMILEX - This code is licensed and protected. */

    createParticles();

    // Check if name is stored
    const storedName = localStorage.getItem('userName');

    if (storedName) {
        welcomeText.textContent = `Welcome, ${storedName}!`;
    } else {
        // Prompt for name if not stored
        const name = prompt('Please enter your name:');
        if (name) {
            localStorage.setItem('userName', name);
            welcomeText.textContent = `Welcome, ${name}!`;
        }
    }

        /* © SMILEX - This code is licensed and protected. */

    // Fade out and remove overlay after 3 seconds
    setTimeout(() => {
        welcomeOverlay.style.opacity = '0';
        setTimeout(() => {
            welcomeOverlay.style.display = 'none';
        }, 1000);
    }, 3000);
});


    /* © SMILEX - This code is licensed and protected. */
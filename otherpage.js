 // Star Field Generation
 function createStarField() {
    const starField = document.getElementById('starField');
    const starCount = 300;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;

        starField.appendChild(star);
    }
}




// Advanced Personalized Welcome
function personalizeWelcome() {
    const username = prompt("Enter your name, Explorer:") || "Explorer";
    const welcomeMessage = document.getElementById('welcome-message');
    welcomeMessage.textContent = `Welcome, ${username}`;
}

// Quantum Countdown Mechanism
function startQuantumCountdown() {
    const countdownEl = document.getElementById('countdown');
    const goButton = document.getElementById('go-button');
    let count = 10;

    const quantumEffects = [
        () => countdownEl.style.color = 'cyan',
        () => countdownEl.style.transform = 'rotate(5deg)',
        () => countdownEl.style.textShadow = '0 0 30px cyan'
    ];

    const timer = setInterval(() => {
        countdownEl.textContent = count;
        
        // Random quantum visual effects
        if (count % 3 === 0) {
            quantumEffects[Math.floor(Math.random() * quantumEffects.length)]();
        }

        count--;

        if (count < 0) {
            clearInterval(timer);
            countdownEl.style.display = 'none';
            goButton.style.display = 'block';
        }
    }, 1000);

    goButton.addEventListener('click', () => {
        // Advanced transition or redirect
        document.body.style.transition = 'all 1s ease';
        document.body.style.transform = 'scale(2) rotate(360deg)';
        document.body.style.opacity = 0;
        
        setTimeout(() => {
            window.location.href = 'form.html';
        }, 1000);
    });
}

// Initialize on page load
window.onload = () => {
    createStarField();
    personalizeWelcome();
    startQuantumCountdown();
};
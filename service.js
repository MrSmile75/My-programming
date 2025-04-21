    // Background bubble animation
    function createBubbles() {
        const backgroundAnimation = document.getElementById('backgroundAnimation');
        const bubbleCount = 40;
    
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            
            // Random sizing
            const size = Math.random() * 50 + 10;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // Random positioning
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.animationDuration = `${Math.random() * 20 + 10}s`;
            bubble.style.animationDelay = `${Math.random() * 10}s`;
            
            backgroundAnimation.appendChild(bubble);
        }
    }
    
    // Initialize bubbles on page load
    createBubbles();
    

// EmailJS initialization and form submission
(function(){
    emailjs.init("BSgchpWL-Aup83us2"); // Replace with your EmailJS User ID
})();

document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const statusMessage = document.getElementById('statusMessage');
    const submitBtn = document.querySelector('.submit-btn');

    // Disable submit button and clear previous messages
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';

    // EmailJS template parameters
    const templateParams = {
        from_name: name,
        from_email: email,
        message: message
    };

    // Send email using EmailJS
    emailjs.send(
        'service_36lbox4',    // Replace with your EmailJS Service ID
        'template_sd5aila',   // Replace with your EmailJS Template ID
        templateParams
    )
    .then(function(response) {
        // Success
        statusMessage.textContent = 'Message sent successfully!';
        statusMessage.classList.add('success');
        
        // Reset form
        document.getElementById('contactForm').reset();
    }, function(error) {
        // Error
        statusMessage.textContent = 'Failed to send message. Please try again.';
        statusMessage.classList.add('error');
        console.log('Error:', error);
    })
    .finally(function() {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    });
});
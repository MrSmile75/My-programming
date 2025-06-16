      document.addEventListener('contextmenu', event => event.preventDefault());

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
   
   // Background bubble animation
    function createBubbles() {
        const backgroundAnimation = document.getElementById('backgroundAnimation');
        const bubbleCount = 40;

            /* © SMILEX - This code is licensed and protected. */
    


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

        /* © SMILEX - This code is licensed and protected. */
    
    // Initialize bubbles on page load
    createBubbles();

        /* © SMILEX - This code is licensed and protected. */
    

// EmailJS initialization and form submission
(function(){
    emailjs.init("BSgchpWL-Aup83us2"); // Replace with your EmailJS User ID
})();

    /* © SMILEX - This code is licensed and protected. */

document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

        /* © SMILEX - This code is licensed and protected. */

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const statusMessage = document.getElementById('statusMessage');
    const submitBtn = document.querySelector('.submit-btn');

        /* © SMILEX - This code is licensed and protected. */

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

        /* © SMILEX - This code is licensed and protected. */

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

            /* © SMILEX - This code is licensed and protected. */
        
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

    /* © SMILEX - This code is licensed and protected. */
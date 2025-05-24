      // Advanced loading simulation
      function simulateLoading() {
        const loader = document.querySelector('.chat-preloader');

            /* © SMILEX - This code is licensed and protected. */
        
        setTimeout(() => {
            loader.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
            loader.style.transform = 'rotateX(0deg) scale(0)';
            loader.style.opacity = 0;

                /* © SMILEX - This code is licensed and protected. */
            
            // Optional: Trigger next screen or chat interface
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }, 4000);
    }

        /* © SMILEX - This code is licensed and protected. */

    // Initialize loading
    simulateLoading();

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('registrationForm');
        const submitBtn = document.getElementById('submitBtn');
        const inputs = form.querySelectorAll('input, select');
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');

        // Prevent multiple registrations
        if (localStorage.getItem('userRegistered') === 'true') {
            document.getElementById('onboardingModal').style.display = 'none';
            return;
        }

        // Validation function
        function validateForm() {
            const allInputsFilled = Array.from(inputs)
                .every(input => input.validity.valid);
            
            const allCheckboxesChecked = Array.from(checkboxes)
                .every(checkbox => checkbox.checked);

            submitBtn.disabled = !(allInputsFilled && allCheckboxesChecked);
        }

        // Add event listeners
        inputs.forEach(input => {
            input.addEventListener('input', validateForm);
            input.addEventListener('change', validateForm);
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', validateForm);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const userData = Object.fromEntries(formData.entries());

            // Remove consent checkboxes from stored data
            delete userData['ageConsent'];
            delete userData['termsConsent'];
            delete userData['privacyConsent'];

            // Store user data
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userRegistered', 'true');

            // Hide modal or redirect
            document.getElementById('onboardingModal').style.display = 'none';

            // Notification
            alert('Welcome to SMILEX! Your profile is now complete.');
        });
    });
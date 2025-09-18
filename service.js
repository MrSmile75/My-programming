  // Enhanced security measures
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
                // Optionally redirect or show warning
            }
            if (!(width || height) && devtoolsOpen) {
                devtoolsOpen = false;
            }
        }, 1000);
   
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

        // EmailJS initialization
        (function(){
            emailjs.init("BSgchpWL-Aup83us2"); // Replace with your EmailJS User ID
        })();

        // Cache API implementation for offline functionality
        const CACHE_NAME = 'smile-xplorer-contact-form-v1';
        const FORM_DATA_KEY = 'contactFormData';

        // Initialize cache on load
        async function initializeCache() {
            if ('caches' in window) {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    console.log('Cache initialized successfully');
                } catch (error) {
                    console.error('Failed to initialize cache:', error);
                }
            }
        }

        // Save form data to cache and localStorage
        async function saveFormData(formData) {
            // Save to localStorage as fallback
            localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
            
            // Save to Cache API if available
            if ('caches' in window) {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    const response = new Response(JSON.stringify(formData), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    await cache.put('/form-data', response);
                    console.log('Form data saved to cache');
                } catch (error) {
                    console.error('Failed to save to cache:', error);
                }
            }
            
            // Show saved notice
            const notice = document.getElementById('formSavedNotice');
            notice.style.display = 'block';
            setTimeout(() => {
                notice.style.display = 'none';
            }, 3000);
        }

        // Retrieve form data from cache
        async function getFormData() {
            // First try Cache API
            if ('caches' in window) {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    const response = await cache.match('/form-data');
                    
                    if (response) {
                        const data = await response.json();
                        return data;
                    }
                } catch (error) {
                    console.error('Failed to retrieve from cache:', error);
                }
            }
            
            // Fallback to localStorage
            const savedData = localStorage.getItem(FORM_DATA_KEY);
            return savedData ? JSON.parse(savedData) : null;
        }

        // Clear saved form data
        async function clearFormData() {
            // Clear localStorage
            localStorage.removeItem(FORM_DATA_KEY);
            
            // Clear cache
            if ('caches' in window) {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.delete('/form-data');
                } catch (error) {
                    console.error('Failed to clear cache:', error);
                }
            }
        }

        // Network status detection
        function monitorNetworkStatus() {
            if (!navigator.onLine) {
                document.getElementById('offlineIndicator').style.display = 'block';
            }
            
            window.addEventListener('online', () => {
                document.getElementById('offlineIndicator').style.display = 'none';
                // Try to send any saved forms when coming back online
                trySendSavedForms();
            });
            
            window.addEventListener('offline', () => {
                document.getElementById('offlineIndicator').style.display = 'block';
            });
        }

        // Try to send any forms that were saved while offline
        async function trySendSavedForms() {
            const formData = await getFormData();
            if (formData) {
                // Try to send the form
                if (await sendEmail(formData)) {
                    // If successful, clear the saved data
                    await clearFormData();
                }
            }
        }

        // Form validation
        function validateForm() {
            let isValid = true;
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Name validation
            if (name.length < 2) {
                document.getElementById('nameError').style.display = 'block';
                isValid = false;
            } else {
                document.getElementById('nameError').style.display = 'none';
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                document.getElementById('emailError').style.display = 'block';
                isValid = false;
            } else {
                document.getElementById('emailError').style.display = 'none';
            }
            
            // Message validation
            if (message.length < 10) {
                document.getElementById('messageError').style.display = 'block';
                isValid = false;
            } else {
                document.getElementById('messageError').style.display = 'none';
            }
            
            return isValid;
        }

        // Send email function
        async function sendEmail(formData) {
            const statusMessage = document.getElementById('statusMessage');
            const submitBtn = document.querySelector('.submit-btn');
            
            // Disable submit button and clear previous messages
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';

            // EmailJS template parameters
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                message: formData.message
            };

            try {
                // Send email using EmailJS
                const response = await emailjs.send(
                    'service_36lbox4',    // Replace with your EmailJS Service ID
                    'template_sd5aila',   // Replace with your EmailJS Template ID
                    templateParams
                );
                
                // Success
                statusMessage.textContent = 'Message sent successfully!';
                statusMessage.classList.add('success');
                
                // Reset form
                document.getElementById('contactForm').reset();
                
                return true;
            } catch (error) {
                // Error
                statusMessage.textContent = 'Failed to send message. Please try again.';
                statusMessage.classList.add('error');
                console.log('Error:', error);
                return false;
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ri-send-plane-fill"></i> Send Message';
            }
        }

        // Load saved form data on page load
        async function loadSavedFormData() {
            const formData = await getFormData();
            if (formData) {
                document.getElementById('name').value = formData.name || '';
                document.getElementById('email').value = formData.email || '';
                document.getElementById('message').value = formData.message || '';
                
                // Show notice that there's saved data
                const notice = document.getElementById('formSavedNotice');
                notice.textContent = 'Previously saved form data loaded';
                notice.style.display = 'block';
                setTimeout(() => {
                    notice.style.display = 'none';
                }, 3000);
            }
        }

        // Form submission handler
        document.getElementById('contactForm').addEventListener('submit', async function(event) {
            event.preventDefault();

            if (!validateForm()) {
                return;
            }

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                message: document.getElementById('message').value.trim(),
                timestamp: new Date().toISOString()
            };

            // If offline, save the form data and show message
            if (!navigator.onLine) {
                await saveFormData(formData);
                const statusMessage = document.getElementById('statusMessage');
                statusMessage.textContent = 'You are offline. Form saved and will be sent when you are back online.';
                statusMessage.classList.add('success');
                return;
            }

            // If online, try to send the email
            const success = await sendEmail(formData);
            
            // If sending failed, save the form data for later
            if (!success) {
                await saveFormData(formData);
            }
        });

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            initializeCache();
            monitorNetworkStatus();
            loadSavedFormData();
        });
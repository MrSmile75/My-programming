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




  // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const html = document.documentElement;
        
        // Check for saved user preference or system preference
        const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && userPrefersDark)) {
            html.classList.add('dark');
        }
        
        darkModeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'dark');
        });
        
        // Sample functionality for upvoting/downvoting
        document.querySelectorAll('.vote-button').forEach(button => {
            button.addEventListener('click', function() {
                const voteContainer = this.closest('.flex.flex-col.items-center');
                const countElement = voteContainer.querySelector('span.font-medium');
                let count = parseInt(countElement.textContent.replace(/[^\d]/g, ''));
                
                if (this.querySelector('.fa-arrow-up')) {
                    if (this.classList.contains('text-smile-500')) {
                        // Already upvoted - remove vote
                        this.classList.remove('text-smile-500');
                        count--;
                    } else {
                        // Upvote
                        this.classList.add('text-smile-500');
                        const downButton = voteContainer.querySelector('.fa-arrow-down').closest('button');
                        if (downButton.classList.contains('text-blue-500')) {
                            downButton.classList.remove('text-blue-500');
                            count += 2; // Remove downvote and add upvote
                        } else {
                            count++;
                        }
                    }
                } else if (this.querySelector('.fa-arrow-down')) {
                    if (this.classList.contains('text-blue-500')) {
                        // Already downvoted - remove vote
                        this.classList.remove('text-blue-500');
                        count++;
                    } else {
                        // Downvote
                        this.classList.add('text-blue-500');
                        const upButton = voteContainer.querySelector('.fa-arrow-up').closest('button');
                        if (upButton.classList.contains('text-smile-500')) {
                            upButton.classList.remove('text-smile-500');
                            count -= 2; // Remove upvote and add downvote
                        } else {
                            count--;
                        }
                    }
                }
                
                countElement.textContent = count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count;
            });
        });
        
        // Simulate loading more posts
        document.querySelector('button:contains("Load more posts")').addEventListener('click', function() {
            this.textContent = 'Loading...';
            this.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                const postsFeed = document.getElementById('posts-feed');
                
                // Create a new sample post
                const newPost = document.createElement('div');
                newPost.className = 'bg-white dark:bg-dark-800 rounded-lg shadow-sm post-card fade-in';
                newPost.innerHTML = `
                    <div class="p-4">
                        <div class="flex items-start">
                            <div class="flex flex-col items-center mr-4">
                                <button class="vote-button text-gray-400 hover:text-smile-500">
                                    <i class="fas fa-arrow-up text-xl"></i>
                                </button>
                                <span class="my-1 font-medium text-gray-600 dark:text-gray-300">2.1k</span>
                                <button class="vote-button text-gray-400 hover:text-blue-500">
                                    <i class="fas fa-arrow-down text-xl"></i>
                                </button>
                            </div>
                            
                            <div class="flex-1">
                                <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    <span class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs mr-2">f</span>
                                    <span class="font-medium">f/Food</span>
                                    <span class="mx-1">•</span>
                                    <span>Posted by u/chef_extraordinaire</span>
                                    <span class="mx-1">•</span>
                                    <span>3 hours ago</span>
                                </div>
                                
                                <h3 class="text-xl font-medium mb-2">My homemade sourdough after 6 months of practice</h3>
                                
                                <div class="mb-4">
                                    <img src="https://source.unsplash.com/random/800x600/?bread,sourdough" 
                                        alt="Sourdough bread" 
                                        class="w-full h-auto rounded-lg object-cover max-h-96">
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div class="flex space-x-4">
                                        <button class="flex items-center text-gray-500 dark:text-gray-400 hover:text-smile-500 dark:hover:text-smile-400">
                                            <i class="far fa-comment mr-1"></i>
                                            <span>327 Comments</span>
                                        </button>
                                        <button class="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-500">
                                            <i class="fas fa-share mr-1"></i>
                                            <span>Share</span>
                                        </button>
                                        <button class="flex items-center text-gray-500 dark:text-gray-400 hover:text-yellow-500">
                                            <i class="far fa-bookmark mr-1"></i>
                                            <span>Save</span>
                                        </button>
                                    </div>
                                    <button class="text-gray-500 dark:text-gray-400 hover:text-red-500">
                                        <i class="fas fa-ellipsis-h"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add the new post to the feed
                postsFeed.appendChild(newPost);
                
                // Reattach event listeners to the new vote buttons
                newPost.querySelectorAll('.vote-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const voteContainer = this.closest('.flex.flex-col.items-center');
                        const countElement = voteContainer.querySelector('span.font-medium');
                        let count = parseInt(countElement.textContent.replace(/[^\d]/g, ''));
                        
                        if (this.querySelector('.fa-arrow-up')) {
                            if (this.classList.contains('text-smile-500')) {
                                this.classList.remove('text-smile-500');
                                count--;
                            } else {
                                this.classList.add('text-smile-500');
                                const downButton = voteContainer.querySelector('.fa-arrow-down').closest('button');
                                if (downButton.classList.contains('text-blue-500')) {
                                    downButton.classList.remove('text-blue-500');
                                    count += 2;
                                } else {
                                    count++;
                                }
                            }
                        } else if (this.querySelector('.fa-arrow-down')) {
                            if (this.classList.contains('text-blue-500')) {
                                this.classList.remove('text-blue-500');
                                count++;
                            } else {
                                this.classList.add('text-blue-500');
                                const upButton = voteContainer.querySelector('.fa-arrow-up').closest('button');
                                if (upButton.classList.contains('text-smile-500')) {
                                    upButton.classList.remove('text-smile-500');
                                    count -= 2;
                                } else {
                                    count--;
                                }
                            }
                        }
                        
                        countElement.textContent = count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count;
                    });
                });
                
                // Reset the button
                this.textContent = 'Load more posts';
                this.disabled = false;
            }, 1000);
        });

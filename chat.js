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






    class CommunityConnect {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.loadProfile();
    }

    initElements() {
        // Profile Setup Elements
        this.profileSetup = document.getElementById('profile-setup');
        this.usernameInput = document.getElementById('username-input');
        this.profilePicPreview = document.getElementById('profile-pic-preview');
        this.profilePicInput = document.getElementById('profile-pic-input');
        this.saveProfileBtn = document.getElementById('save-profile-btn');
        this.takePhotoBtn = document.getElementById('take-photo-btn');

        // Camera Elements
        this.cameraModal = document.getElementById('camera-modal');
        this.cameraFeed = document.getElementById('camera-feed');
        this.photoCanvas = document.getElementById('photo-canvas');
        this.capturBtn = document.getElementById('capture-btn');
        this.closeCameraBtn = document.getElementById('close-camera-btn');

        // Chat Elements
        this.messagesContainer = document.getElementById('messages-container');
        this.messageInput = document.getElementById('message-input');
        this.sendMessageBtn = document.getElementById('send-message-btn');
        this.fileUploadBtn = document.getElementById('file-upload-btn');
        this.fileInput = document.getElementById('file-input');
        this.recordAudioBtn = document.getElementById('record-audio-btn');
    }

    initEventListeners() {
        // Profile Picture Upload
        this.profilePicInput.addEventListener('change', this.handleProfilePicUpload.bind(this));
        this.saveProfileBtn.addEventListener('click', this.saveProfile.bind(this));

        // Camera Functionality
        this.takePhotoBtn.addEventListener('click', this.openCamera.bind(this));
        this.capturBtn.addEventListener('click', this.capturePhoto.bind(this));
        this.closeCameraBtn.addEventListener('click', this.closeCamera.bind(this));

        // Chat Functionality
        this.sendMessageBtn.addEventListener('click', this.sendMessage.bind(this));
        this.messageInput.addEventListener('keypress', this.handleEnterKey.bind(this));
        this.fileUploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        this.recordAudioBtn.addEventListener('click', this.recordAudio.bind(this));
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            this.profileSetup.style.display = 'none';
            this.profilePicPreview.src = profile.profilePic;
            this.usernameInput.value = profile.username;
        } else {
            this.profileSetup.style.display = 'flex';
        }
    }

    handleProfilePicUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profilePicPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfile() {
        const username = this.usernameInput.value.trim();
        const profilePic = this.profilePicPreview.src;

        if (username && profilePic) {
            const profile = { username, profilePic };
            localStorage.setItem('userProfile', JSON.stringify(profile));
            this.profileSetup.style.display = 'none';
        } else {
            alert('Please enter a username and select a profile picture');
        }
    }

    openCamera() {
        this.cameraModal.style.display = 'flex';
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.cameraFeed.srcObject = stream;
                this.cameraFeed.play();
            })
            .catch(error => {
                console.error('Camera access error:', error);
                
            });
    }

    capturePhoto() {
        const context = this.photoCanvas.getContext('2d');
        this.photoCanvas.width = this.cameraFeed.videoWidth;
        this.photoCanvas.height = this.cameraFeed.videoHeight;
        
        context.drawImage(this.cameraFeed, 0, 0);
        const photoDataUrl = this.photoCanvas.toDataURL('image/jpeg');
        
        this.profilePicPreview.src = photoDataUrl;
        this.closeCamera();
    }

    closeCamera() {
        const stream = this.cameraFeed.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        this.cameraModal.style.display = 'none';
    }

    sendMessage() {
        const messageText = this.messageInput.value.trim();
        if (messageText) {
            const profile = JSON.parse(localStorage.getItem('userProfile'));
            const message = {
                text: messageText,
                user: profile,
                timestamp: new Date().toISOString(),
                type: 'text'
            };

            this.renderMessage(message);
            this.saveMessage(message);
            this.messageInput.value = '';
        }
    }

    handleEnterKey(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const profile = JSON.parse(localStorage.getItem('userProfile'));
                const message = {
                    text: file.name,
                    user: profile,
                    timestamp: new Date().toISOString(),
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    content: e.target.result
                };

                this.renderMessage(message);
                this.saveMessage(message);
            };
            reader.readAsDataURL(file);
        }
    }

    recordAudio() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    const profile = JSON.parse(localStorage.getItem('userProfile'));
                    const message = {
                        text: 'Audio Message',
                        user: profile,
                        timestamp: new Date().toISOString(),
                        type: 'audio',
                        content: audioUrl
                    };

                    this.renderMessage(message);
                    this.saveMessage(message);
                });

                mediaRecorder.start();
                
                setTimeout(() => {
                    mediaRecorder.stop();
                    stream.getTracks().forEach(track => track.stop());
                }, 5000); // Record for 5 seconds
            })
            .catch(error => {
                console.error('Audio recording error:', error);
                
            });
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        let contentHTML = '';
        switch(message.type) {
            case 'text':
                contentHTML = `<p>${message.text}</p>`;
                break;
            case 'image':
                contentHTML = `<img src="${message.content}" style="max-width:200px; border-radius:10px;">`;
                break;
            case 'video':
                contentHTML = `
                    <video controls style="max-width:200px; border-radius:10px;">
                        <source src="${message.content}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
                break;
            case 'audio':
                contentHTML = `
                    <audio controls style="max-width:200px;">
                        <source src="${message.content}" type="audio/wav">
                        Your browser does not support the audio element.
                    </audio>
                `;
                break;
        }

        messageElement.innerHTML = `
            <img src="${message.user.profilePic}" alt="${message.user.username}" class="profile-pic">
            <div class="message-content">
                <strong>${message.user.username}</strong>
                ${contentHTML}
                <small>${this.formatTimestamp(message.timestamp)}</small>
            </div>
        `;

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        this.saveMessage(message);
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    saveMessage(message) {
        let messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        messages.push(message);
        
        // Limit message history to last 100 messages
        if (messages.length > 100) {
            messages = messages.slice(-100);
        }

        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }

    loadSavedMessages() {
        const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        savedMessages.forEach(message => this.renderMessage(message));
    }

    clearChat() {
        localStorage.removeItem('chatMessages');
        this.messagesContainer.innerHTML = '';
    }

    exportChat() {
        const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        const chatExport = JSON.stringify(messages, null, 2);
        const blob = new Blob([chatExport], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_export_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importChat(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedMessages = JSON.parse(e.target.result);
                    localStorage.setItem('chatMessages', JSON.stringify(importedMessages));
                    this.messagesContainer.innerHTML = '';
                    importedMessages.forEach(message => this.renderMessage(message));
                } catch (error) {
                    console.error('Import error:', error);
                    alert('Invalid chat file');
                }
            };
            reader.readAsText(file);
        }
    }

    initAdvancedFeatures() {
        // Add import/export buttons to UI
        const advancedFeaturesContainer = document.createElement('div');
        advancedFeaturesContainer.innerHTML = `
          
            
        `;

        this.messagesContainer.prepend(advancedFeaturesContainer);

        // Event Listeners
        document.getElementById('export-chat-btn').addEventListener('click', () => this.exportChat());
        document.getElementById('import-chat-btn').addEventListener('click', () => {
            document.getElementById('import-chat').click();
        });
        document.getElementById('import-chat').addEventListener('change', this.importChat.bind(this));
        document.getElementById('clear-chat-btn').addEventListener('click', () => {
            if(confirm('Are you sure you want to clear the entire chat?')) {
                this.clearChat();
            }
        });
    }

    init() {
        // Load saved profile
        this.loadProfile();
        
        // Load saved messages
        this.loadSavedMessages();
        
        // Initialize advanced features
        this.initAdvancedFeatures();
        
        // Scroll to bottom on init
        this.scrollToBottom();
    }
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new CommunityConnect();
    app.init();
});



class EmojiPicker {
    constructor(inputElement) {
        this.emojiBtn = document.getElementById('emoji-btn');
        this.emojiPicker = document.getElementById('emoji-picker');
        this.messageInput = inputElement;
        
        this.emojis = {
            smileys: [
                '😀', '😃', '😄', '😁', '😆', '😅', 
                '🤣', '😂', '🙂', '🙃', '😉', '😊', 
                '😇', '🥰', '😍', '🤩', '😘', '😗'
            ],
            animals: [
                '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', 
                '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', 
                '🐷', '🐸', '🐵', '🐒', '🦄', '🐧'
            ],
            food: [
                '🍎', '🍌', '🍇', '🍊', '🍋', '🍒', 
                '🍓', '🥝', '🍍', '🥭', '🍉', '🍈', 
                '🍏', '🍐', '🍑', '🍅', '🥑', '🥒'
            ]
        };

        this.init();
    }

    init() {
        // Toggle emoji picker
        this.emojiBtn.addEventListener('click', () => {
            this.toggleEmojiPicker();
        });

        // Category switching
        this.emojiPicker.querySelectorAll('.emoji-category').forEach(category => {
            category.addEventListener('click', (e) => {
                // Remove active from all categories
                this.emojiPicker.querySelectorAll('.emoji-category').forEach(cat => 
                    cat.classList.remove('active')
                );
                
                // Add active to clicked category
                e.target.classList.add('active');
                
                // Render emojis for selected category
                this.renderEmojis(e.target.dataset.category);
            });

            // Default render
            this.renderEmojis('smileys');
        });

        // Close picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.emojiPicker.contains(e.target) && 
                !this.emojiBtn.contains(e.target)) {
                this.emojiPicker.style.display = 'none';
            }
        });
    }

    toggleEmojiPicker() {
        this.emojiPicker.style.display = 
            this.emojiPicker.style.display === 'none' ? 'block' : 'none';
    }

    renderEmojis(category) {
        const emojiGrid = this.emojiPicker.querySelector('.emoji-grid');
        emojiGrid.innerHTML = '';

        this.emojis[category].forEach(emoji => {
            const emojiEl = document.createElement('div');
            emojiEl.classList.add('emoji-item');
            emojiEl.textContent = emoji;
            emojiEl.addEventListener('click', () => {
                // Insert emoji at cursor position
                this.insertEmojiAtCursor(emoji);
                this.emojiPicker.style.display = 'none';
            });
            emojiGrid.appendChild(emojiEl);
        });
    }

    insertEmojiAtCursor(emoji) {
        const input = this.messageInput;
        const startPos = input.selectionStart;
        const endPos = input.selectionEnd;
        
        input.value = 
            input.value.substring(0, startPos) + 
            emoji + 
            input.value.substring(endPos);
        
        // Move cursor after inserted emoji
        input.selectionStart = input.selectionEnd = startPos + emoji.length;
        
        // Trigger input event (for any listeners)
        input.dispatchEvent(new Event('input'));
        
        // Focus back on input
        input.focus();
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    // Pass the message input element when initializing
    const emojiPicker = new EmojiPicker(document.getElementById('message-input'));
});



        class AdvancedProfileManager {
            constructor() {
                this.initElements();
                this.loadProfileData();
                this.setupEventListeners();
            }

            initElements() {
                // Profile Elements
                this.profileToggle = document.getElementById('profileToggle');
                this.profileDropdown = document.getElementById('profileDropdown');
                this.profileImage = document.getElementById('profileImage');
                this.largeProfileAvatar = document.getElementById('largeProfileAvatar');
                this.profileName = document.getElementById('profileName');
                this.profileEmail = document.getElementById('profileEmail');

                // Buttons
                this.editProfileBtn = document.getElementById('editProfileBtn');
                this.changePasswordBtn = document.getElementById('changePasswordBtn');
                this.settingsBtn = document.getElementById('settingsBtn');
                this.helpBtn = document.getElementById('helpBtn');
                this.logoutBtn = document.getElementById('logoutBtn');

                // Camera Modal Elements
                this.cameraModal = document.getElementById('cameraModal');
                this.cameraFeed = document.getElementById('cameraFeed');
                this.captureCanvas = document.getElementById('captureCanvas');
                this.captureBtn = document.getElementById('captureBtn');
                this.uploadBtn = document.getElementById('uploadBtn');
                this.closeModalBtn = document.getElementById('closeModalBtn');
            }

            loadProfileData() {
                // Load profile picture
                const savedProfilePic = localStorage.getItem('userProfilePic');
                if (savedProfilePic) {
                    this.profileImage.src = savedProfilePic;
                    this.largeProfileAvatar.src = savedProfilePic;
                } else {
                    // Default profile image
                    const defaultImage = 'https://via.placeholder.com/150?text=👤';
                    this.profileImage.src = defaultImage;
                    this.largeProfileAvatar.src = defaultImage;
                }

                // Load user details
                const userName = localStorage.getItem('userName') || 'MEMBER';
                const userEmail = localStorage.getItem('userEmail') || '';

                this.profileName.textContent = userName;
                this.profileEmail.textContent = userEmail;
            }

            setupEventListeners() {
                // Profile Dropdown Toggle
                this.profileToggle.addEventListener('click', () => {
                    this.profileDropdown.style.display = 
                        this.profileDropdown.style.display === 'block' ? 'none' : 'block';
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (event) => {
                    if (!this.profileToggle.contains(event.target) && 
                        !this.profileDropdown.contains(event.target)) {
                        this.profileDropdown.style.display = 'none';
                    }
                });

                // Camera Modal Setup
                this.setupCameraModal();

                // Button Event Listeners
                this.setupButtonListeners();
            }

            setupCameraModal() {
                // Open Camera Modal
                this.editProfileBtn.addEventListener('click', () => {
                    this.openCameraModal();
                });

                // Close Modal
                this.closeModalBtn.addEventListener('click', () => {
                    this.cameraModal.style.display = 'none';
                    this.stopCamera();
                });

                // Capture Button
                this.captureBtn.addEventListener('click', () => {
                    this.captureImage();
                });

                // Upload Button
                this.uploadBtn.addEventListener('click', () => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.onchange = (e) => this.handleFileUpload(e);
                    fileInput.click();
                });
            }

            openCameraModal() {
                this.cameraModal.style.display = 'flex';
                this.startCamera();
            }

            async startCamera() {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    this.cameraFeed.srcObject = stream;
                } catch (error) {
                    console.error('Camera access denied:', error);
                    
                }
            }

            stopCamera() {
                const stream = this.cameraFeed.srcObject;
                if (stream) {
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());
                }
            }

            captureImage() {
                const context = this.captureCanvas.getContext('2d');
                this.captureCanvas.width = this.cameraFeed.videoWidth;
                this.captureCanvas.height = this.cameraFeed.videoHeight;
                
                context.drawImage(this.cameraFeed, 0, 0);
                
                const imageDataUrl = this.captureCanvas.toDataURL('image/jpeg');
                this.updateProfilePicture(imageDataUrl);
                this.cameraModal.style.display = 'none';
                this.stopCamera();
            }

            handleFileUpload(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.updateProfilePicture(e.target.result);
                        this.cameraModal.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            }

            updateProfilePicture(imageDataUrl) {
                // Update profile picture in all places
                this.profileImage.src = imageDataUrl;
                this.largeProfileAvatar.src = imageDataUrl;

                // Save to local storage
                localStorage.setItem('userProfilePic', imageDataUrl);
            }

            setupButtonListeners() {
                // Placeholder implementations
                this.changePasswordBtn.addEventListener('click', () => {
              
                });

                this.settingsBtn.addEventListener('click', () => {
                    
                });

                this.helpBtn.addEventListener('click', () => {
                   
                });

                this.logoutBtn.addEventListener('click', () => {
                    // Implement logout logic
                    localStorage.clear();
                    window.location.href = '/login'; // Redirect to login page
                });
            }
        }

        // Initialize on DOM load
        document.addEventListener('DOMContentLoaded', () => {
            new AdvancedProfileManager();
        });

        function showOnboarding() {
    const overlay = document.querySelector('.overlay');
    overlay.classList.add('active');
}

function hideOnboarding() {
    const overlay = document.querySelector('.overlay');
    overlay.classList.remove('active');
}

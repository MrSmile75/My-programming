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


    class AdvancedChatApp {
        constructor() {
            this.initializeElements();
            this.loadSavedUsername();
            this.addEventListeners();
        }

            /* © SMILEX - This code is licensed and protected. */

        initializeElements() {
            // Modal and Form Elements
            this.usernameModal = document.getElementById('username-modal');
            this.usernameInput = document.getElementById('username-input');
            this.usernameSubmit = document.getElementById('username-submit');
            this.profileUsername = document.getElementById('profile-username');

                /* © SMILEX - This code is licensed and protected. */
            
            // Chat Elements
            this.messageArea = document.getElementById('message-area');
            this.messageInput = document.getElementById('message-input');
            this.fileInput = document.getElementById('file-input');
            this.sendBtn = document.getElementById('send-btn');
            this.voiceRecordBtn = document.getElementById('voice-record');

            // Emoji Picker
            this.emojiPicker = document.querySelectorAll('.emoji-picker span');
        }

            /* © SMILEX - This code is licensed and protected. */

        loadSavedUsername() {
            const savedUsername = localStorage.getItem('chatUsername');
            if (savedUsername) {
                this.setUsername(savedUsername);
                this.usernameModal.style.display = 'none';
            }
        }

            /* © SMILEX - This code is licensed and protected. */

        addEventListeners() {
            // Username Submission
            this.usernameSubmit.addEventListener('click', () => this.handleUsernameSubmit());

            // Emoji Selection
            this.emojiPicker.forEach(emoji => {
                emoji.addEventListener('click', () => {
                    this.usernameInput.value = emoji.textContent + this.usernameInput.value;
                });
            });

                /* © SMILEX - This code is licensed and protected. */

            // Message Sending
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        handleUsernameSubmit() {
            const username = this.usernameInput.value.trim();
            if (username) {
                this.setUsername(username);
                this.usernameModal.style.display = 'none';
            } else {
                alert('Please enter a username');
            }
        }

            /* © SMILEX - This code is licensed and protected. */

        setUsername(username) {
            // Save username to local storage
            localStorage.setItem('chatUsername', username);
            
            // Update profile
            this.profileUsername.textContent = username;
        }

            /* © SMILEX - This code is licensed and protected. */

        sendMessage() {
            const messageText = this.messageInput.value.trim();
            const fileToSend = this.fileInput.files[0];

            if (messageText || fileToSend) {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message', 'sent');

                // Message Content
                if (messageText) {
                    const textSpan = document.createElement('p');
                    textSpan.textContent = messageText;
                    messageDiv.appendChild(textSpan);
                }

                    /* © SMILEX - This code is licensed and protected. */

                // File Attachment
                if (fileToSend) {
                    const mediaElement = fileToSend.type.startsWith('image/') 
                        ? document.createElement('img') 
                        : document.createElement('video');
                    
                    mediaElement.src = URL.createObjectURL(fileToSend);
                    mediaElement.controls = true;
                    mediaElement.style.maxWidth = '100%';
                    messageDiv.appendChild(mediaElement);
                }

                    /* © SMILEX - This code is licensed and protected. */

                this.messageArea.appendChild(messageDiv);
                this.messageArea.scrollTop = this.messageArea.scrollHeight;

                // Reset inputs
                this.messageInput.value = '';
                this.fileInput.value = '';
            }
        }
    }

        /* © SMILEX - This code is licensed and protected. */

    // Initialize Chat Application
    document.addEventListener('DOMContentLoaded', () => {
        new AdvancedChatApp();
    });

        /* © SMILEX - This code is licensed and protected. */

    // Advanced Chat Application Logic
    class ChatApp {
        constructor() {
            this.username = '';
            this.initializeElements();
            this.addEventListeners();
        }

        initializeElements() {
            // DOM Element References
            this.usernameModal = document.getElementById('username-modal');
            this.usernameInput = document.getElementById('username-input');
            this.usernameSubmit = document.getElementById('username-submit');
            this.messageArea = document.getElementById('message-area');
            this.messageInput = document.getElementById('message-input');
            this.fileInput = document.getElementById('file-input');
            this.sendBtn = document.getElementById('send-btn');
            this.voiceRecordBtn = document.getElementById('voice-record');

            // Media Recording Variables
            this.mediaRecorder = null;
            this.audioChunks = [];
        }

            /* © SMILEX - This code is licensed and protected. */

        addEventListeners() {
            // Username Selection
            this.usernameSubmit.addEventListener('click', () => this.setUsername());
            
            // Message Sending
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

                /* © SMILEX - This code is licensed and protected. */

            // Voice Recording
            this.voiceRecordBtn.addEventListener('click', () => this.toggleVoiceRecording());

            // File Input
            this.fileInput.addEventListener('change', () => this.handleFilePreview());
        }

            /* © SMILEX - This code is licensed and protected. */

     

        sendMessage() {
            const messageText = this.messageInput.value.trim();
            const fileToSend = this.fileInput.files[0];

            if (messageText || fileToSend) {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message');

                // Message Header with Username and Timestamp
                const headerDiv = document.createElement('div');
                headerDiv.classList.add('message-header');

                    /* © SMILEX - This code is licensed and protected. */

                const usernameSpan = document.createElement('span');
                usernameSpan.classList.add('username');
                usernameSpan.textContent = this.username;

                const timestampSpan = document.createElement('span');
                timestampSpan.classList.add('timestamp');
                timestampSpan.textContent = this.getCurrentTime();

                    /* © SMILEX - This code is licensed and protected. */

                headerDiv.appendChild(usernameSpan);
                headerDiv.appendChild(timestampSpan);
                messageDiv.appendChild(headerDiv);

                    /* © SMILEX - This code is licensed and protected. */

                // Message Content
                if (messageText) {
                    const textSpan = document.createElement('p');
                    textSpan.textContent = messageText;
                    messageDiv.appendChild(textSpan);
                }

                    /* © SMILEX - This code is licensed and protected. */

                // File Attachment
                if (fileToSend) {
                    const mediaElement = fileToSend.type.startsWith('image/') 
                        ? document.createElement('img') 
                        : document.createElement('video');
                    
                    mediaElement.src = URL.createObjectURL(fileToSend);
                    mediaElement.controls = true;
                    mediaElement.classList.add('media-preview');
                    messageDiv.appendChild(mediaElement);
                }

                this.messageArea.appendChild(messageDiv);
                this.messageArea.scrollTop = this.messageArea.scrollHeight;

                // Reset inputs
                this.messageInput.value = '';
                this.fileInput.value = '';
            }
        }

            /* © SMILEX - This code is licensed and protected. */

        handleFilePreview() {
            const file = this.fileInput.files[0];
            if (file) {
                // Optional: Add file preview logic
                console.log('File selected:', file.name);
            }
        }

            /* © SMILEX - This code is licensed and protected. */

        async toggleVoiceRecording() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);

                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };

                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message');

                        /* © SMILEX - This code is licensed and protected. */

                    const headerDiv = document.createElement('div');
                    headerDiv.classList.add('message-header');

                    const usernameSpan = document.createElement('span');
                    usernameSpan.classList.add('username');
                    usernameSpan.textContent = this.username;

                        /* © SMILEX - This code is licensed and protected. */

                    const timestampSpan = document.createElement('span');
                    timestampSpan.classList.add('timestamp');
                    timestampSpan.textContent = this.getCurrentTime();

                        /* © SMILEX - This code is licensed and protected. */

                    headerDiv.appendChild(usernameSpan);
                    headerDiv.appendChild(timestampSpan);
                    messageDiv.appendChild(headerDiv);

                    const audioElement = document.createElement('audio');
                    audioElement.src = audioUrl;
                    audioElement.controls = true;
                    messageDiv.appendChild(audioElement);

                        /* © SMILEX - This code is licensed and protected. */

                    this.messageArea.appendChild(messageDiv);
                    this.messageArea.scrollTop = this.messageArea.scrollHeight;

                    this.audioChunks = [];
                };

                    /* © SMILEX - This code is licensed and protected. */

                this.mediaRecorder.start();
                this.voiceRecordBtn.textContent = '🛑 Stop';
                this.voiceRecordBtn.onclick = () => {
                    this.mediaRecorder.stop();
                    this.voiceRecordBtn.textContent = '🎤 Voice';
                };
            } catch (error) {
                console.error('Voice recording error:', error);
                alert('Unable to access microphone');
            }
        }

        getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

        /* © SMILEX - This code is licensed and protected. */

    // Initialize Chat Application
    document.addEventListener('DOMContentLoaded', () => {
        new ChatApp();
    });

        /* © SMILEX - This code is licensed and protected. */
    

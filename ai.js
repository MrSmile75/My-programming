    // ===== CONFIGURATION =====
        const CONFIG = {
            OPENAI_API_KEY: 'your-openai-api-key-here', // Replace with your actual OpenAI API key
            OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
            VISION_API_URL: 'https://api.openai.com/v1/chat/completions',
            GOOGLE_ADS_CLIENT: 'ca-pub-XXXXXXXXXX', // Replace with your Google Ads client ID
            MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
            MAX_PROMPT_LENGTH: 1000,
            GENERATION_TIMEOUT: 300000, // 5 minutes
            API_TIMEOUT: 30000 // 30 seconds
        };

        // ===== USER DATA MANAGEMENT =====
        let userData = {
            name: '',
            isPremium: false,
            isSubscribed: false,
            trialsRemaining: 3,
            generationHistory: [],
            dailyDownloads: 0,
            lastDownloadDate: null,
            subscriptionDate: null,
            subscriptionId: null,
            uploadedImages: [],
            favorites: [],
            settings: {
                autoSave: true,
                notifications: true,
                quality: 'auto'
            }
        };

        // ===== CURRENT GENERATION DATA =====
        let currentGeneration = {
            id: null,
            prompt: '',
            imagePrompt: '',
            uploadedImage: null,
            style: 'realistic',
            duration: 15,
            quality: '1080p HD',
            videoUrl: '',
            hasWatermark: true,
            timestamp: null,
            enhancedPrompt: '',
            processingTime: 0,
            thumbnail: null
        };

        // ===== STATE MANAGEMENT =====
        let appState = {
            isGenerating: false,
            isAnalyzing: false,
            isDownloading: false,
            currentTab: 'text',
            generationProgress: {
                stage: '',
                progress: 0,
                estimatedTime: 0
            }
        };

        // ===== PYTHON INTEGRATION SIMULATION =====
        class PythonVideoProcessor {
            static async processVideo(videoData, options) {
                console.log('Python: Processing video with options:', options);
                
                // Simulate Python video processing
                await this.sleep(2000);
                
                return {
                    success: true,
                    processedVideoUrl: videoData.url,
                    watermarkApplied: options.addWatermark,
                    quality: options.quality,
                    processingTime: Date.now() - videoData.startTime
                };
            }
            
            static async enhancePrompt(prompt, style, duration) {
                console.log('Python: Enhancing prompt with AI models');
                
                // Simulate Python AI enhancement
                await this.sleep(1500);
                
                const enhancements = {
                    realistic: 'with photorealistic rendering, natural lighting, and cinematic camera work',
                    animated: 'with smooth animation, vibrant colors, and dynamic character movements',
                    cinematic: 'with professional cinematography, dramatic lighting, and epic camera angles',
                    artistic: 'with artistic flair, creative visual effects, and unique aesthetic style',
                    fantasy: 'with magical elements, mystical atmosphere, and fantastical visual effects',
                    'sci-fi': 'with futuristic elements, advanced technology, and sci-fi visual effects'
                };
                
                return `${prompt} Enhanced with ${style} cinematography, optimized for ${duration} seconds duration with professional lighting and smooth camera movements. ${enhancements[style] || ''}`;
            }
            
            static async analyzeImage(imageData) {
                console.log('Python: Analyzing image with computer vision');
                
                // Simulate Python image analysis
                await this.sleep(2000);
                
                const analyses = [
                    "A beautifully composed scene with rich colors and dynamic lighting, perfect for cinematic video generation with smooth transitions and atmospheric effects.",
                    "An artistic composition featuring dramatic contrasts and compelling visual elements, ideal for creating engaging video content with fluid camera movements.",
                    "A visually striking image with excellent depth and composition, suitable for generating high-quality video with professional cinematography techniques.",
                    "A captivating scene with vibrant colors and interesting textures, perfect for AI video generation with creative camera work and visual storytelling.",
                    "An impressive composition with strong visual impact, ideal for creating dynamic video content with cinematic flair and professional production values."
                ];
                
                return analyses[Math.floor(Math.random() * analyses.length)];
            }
            
            static async applyWatermark(videoPath, watermarkText = "SmileX AI") {
                console.log('AI: Applying watermark to video');
                
                // Simulate Python watermark processing
                await this.sleep(3000);
                
                return {
                    success: true,
                    watermarkedPath: videoPath.replace('.mp4', '_watermarked.mp4'),
                    watermarkText: watermarkText
                };
            }
            
            static async generateVideo(promptData, userPremium = false) {
                console.log('SmileX AI: Generating video with advanced AI models');
                
                // Calculate realistic generation time
                const baseTime = promptData.duration * 2000; // 2 seconds per video second
                const qualityMultiplier = userPremium ? 2 : 1;
                const styleMultiplier = this.getStyleComplexity(promptData.style);
                
                const estimatedTime = baseTime * qualityMultiplier * styleMultiplier;
                
                // Simulate progressive generation
                const stages = [
                    { name: "Initializing AI models", duration: 0.1, progress: 5 },
                    { name: "Analyzing prompt complexity", duration: 0.15, progress: 15 },
                    { name: "Processing visual elements", duration: 0.2, progress: 30 },
                    { name: "Generating keyframes", duration: 0.25, progress: 50 },
                    { name: "Creating smooth transitions", duration: 0.2, progress: 70 },
                    { name: "Applying effects and lighting", duration: 0.15, progress: 85 },
                    { name: "Rendering final video", duration: 0.05, progress: 100 }
                ];
                
                for (const stage of stages) {
                    const stageDuration = estimatedTime * stage.duration;
                    await this.sleep(Math.min(stageDuration, 5000)); // Cap at 5 seconds for demo
                    
                    // Update progress
                    updateGenerationProgress(stage.name, stage.progress);
                }
                
                // Generate sample video URL
                const sampleVideos = [
                    "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
                ];
                
                return {
                    success: true,
                    videoUrl: sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
                    thumbnail: `https://picsum.photos/320/180?random=${Date.now()}`,
                    processingTime: estimatedTime,
                    quality: userPremium ? "4K Ultra HD" : "1080p HD",
                    hasWatermark: !userPremium
                };
            }
            
            static getStyleComplexity(style) {
                const complexity = {
                    realistic: 1.0,
                    animated: 1.2,
                    cinematic: 1.5,
                    artistic: 1.3,
                    fantasy: 1.4,
                    'sci-fi': 1.6
                };
                return complexity[style] || 1.0;
            }
            
            static async sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        }

        // ===== OPENAI INTEGRATION =====
        class OpenAIIntegration {
            static async analyzeImage(imageData) {
                if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'your-openai-api-key-here') {
                    // Fallback to Python simulation
                    return await PythonVideoProcessor.analyzeImage(imageData);
                }
                
                try {
                    const base64Image = imageData.split(',')[1]; // Remove data URL prefix
                    
                    const response = await fetch(CONFIG.VISION_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: "gpt-4-vision-preview",
                            messages: [
                                {
                                    role: "user",
                                    content: [
                                        {
                                            type: "text",
                                            text: "Analyze this image and provide a detailed, cinematic description perfect for AI video generation. Focus on visual elements, mood, lighting, composition, colors, movements, and atmosphere. Be creative and descriptive, using professional cinematography terms. Keep it under 200 words but make it vivid and engaging for video creation."
                                        },
                                        {
                                            type: "image_url",
                                            image_url: {
                                                url: imageData,
                                                detail: "high"
                                            }
                                        }
                                    ]
                                }
                            ],
                            max_tokens: 300,
                            temperature: 0.8
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`API request failed: ${response.status}`);
                    }

                    const data = await response.json();
                    return data.choices[0]?.message?.content || await PythonVideoProcessor.analyzeImage(imageData);
                    
                } catch (error) {
                    console.error('OpenAI Vision API error:', error);
                    return await PythonVideoProcessor.analyzeImage(imageData);
                }
            }
            
            static async enhancePrompt(prompt, imagePrompt, style, duration) {
                if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'your-openai-api-key-here') {
                    // Fallback to Python simulation
                    return await PythonVideoProcessor.enhancePrompt(prompt, style, duration);
                }
                
                try {
                    const combinedPrompt = imagePrompt ? 
                        `${prompt} Based on image: ${imagePrompt}` : prompt;
                    
                    const response = await fetch(CONFIG.OPENAI_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: "gpt-4",
                            messages: [
                                {
                                    role: "system",
                                    content: `You are an expert at creating detailed video generation prompts. Enhance the user's prompt to be more specific and cinematic, considering the style (${style}) and duration (${duration}s). Focus on visual details, camera movements, lighting, atmosphere, and specific cinematography techniques. Keep the enhanced prompt under 300 words but make it vivid and specific for AI video generation.`
                                },
                                {
                                    role: "user",
                                    content: `Enhance this video prompt for ${style} style, ${duration} seconds duration: "${combinedPrompt}"`
                                }
                            ],
                            max_tokens: 400,
                            temperature: 0.8
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`API request failed: ${response.status}`);
                    }

                    const data = await response.json();
                    return data.choices[0]?.message?.content || combinedPrompt;
                    
                } catch (error) {
                    console.error('Prompt enhancement failed:', error);
                    return await PythonVideoProcessor.enhancePrompt(prompt, style, duration);
                }
            }
        }

        // ===== INITIALIZATION =====
        document.addEventListener('DOMContentLoaded', function() {
            loadUserData();
            setupEventListeners();
            checkUserWelcome();
            updateUI();
            initializeWordCounter();
            initializeGoogleAds();
        });

        // ===== USER DATA MANAGEMENT =====
        function loadUserData() {
            const saved = localStorage.getItem('smileXUserData');
            if (saved) {
                try {
                    const parsedData = JSON.parse(saved);
                    userData = { ...userData, ...parsedData };
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            }
            
            // Reset daily downloads if new day
            const today = new Date().toDateString();
            if (userData.lastDownloadDate !== today) {
                userData.dailyDownloads = 0;
                userData.lastDownloadDate = today;
                saveUserData();
            }
            
            // Check subscription status
            checkSubscriptionStatus();
        }

        function saveUserData() {
            try {
                localStorage.setItem('smileXUserData', JSON.stringify(userData));
            } catch (error) {
                console.error('Error saving user data:', error);
            }
        }

        function checkSubscriptionStatus() {
            if (userData.subscriptionId && userData.subscriptionDate) {
                const subscriptionDate = new Date(userData.subscriptionDate);
                const now = new Date();
                const daysDiff = (now - subscriptionDate) / (1000 * 60 * 60 * 24);
                
                // Check if subscription is still valid (30 days)
                if (daysDiff <= 30) {
                    userData.isPremium = true;
                    userData.isSubscribed = true;
                } else {
                    userData.isPremium = false;
                    userData.isSubscribed = false;
                    userData.subscriptionId = null;
                    userData.subscriptionDate = null;
                    saveUserData();
                    showNotification('Your premium subscription has expired', 'warning');
                }
            }
        }

        function checkUserWelcome() {
            if (!userData.name) {
                setTimeout(() => {
                    document.getElementById('welcomeModal').classList.add('active');
                }, 1000);
            } else {
                showUserWelcome();
            }
        }

        function saveUserName() {
            const nameInput = document.getElementById('nameInput');
            const name = nameInput.value.trim();
            
            if (!name) {
                showNotification('Please enter your name', 'error');
                return;
            }
            
            if (name.length < 2) {
                showNotification('Name must be at least 2 characters long', 'error');
                return;
            }
            
            if (name.length > 50) {
                showNotification('Name must be less than 50 characters', 'error');
                return;
            }
            
            userData.name = name;
            saveUserData();
            
            document.getElementById('welcomeModal').classList.remove('active');
            showUserWelcome();
            showNotification(`Welcome to SmileX AI, ${name}! 🚀`, 'success');
        }

        function showUserWelcome() {
            const welcomeEl = document.getElementById('userWelcome');
            const userNameEl = document.getElementById('userName');
            const userAvatarEl = document.getElementById('userAvatar');
            
            if (userData.name) {
                userNameEl.textContent = userData.name;
                userAvatarEl.textContent = userData.name.charAt(0).toUpperCase();
                welcomeEl.style.display = 'flex';
            }
        }

        // ===== EVENT LISTENERS =====
        function setupEventListeners() {
            const videoPrompt = document.getElementById('videoPrompt');
            const imagePrompt = document.getElementById('imagePrompt');
            const nameInput = document.getElementById('nameInput');
            const imageInput = document.getElementById('imageInput');
            const uploadArea = document.getElementById('imageUploadArea');
            
            // Text input counters
            videoPrompt.addEventListener('input', updateWordCounter);
            imagePrompt.addEventListener('input', updateWordCounter);
            
            // Enter key shortcuts
            videoPrompt.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    startGeneration();
                }
            });
            
            nameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveUserName();
                }
            });
            
            // File upload
            imageInput.addEventListener('change', handleImageUpload);
            
            // Drag and drop
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('dragleave', handleDragLeave);
            uploadArea.addEventListener('drop', handleFileDrop);
            
            // Close modals on outside click
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('modal')) {
                    e.target.classList.remove('active');
                }
            });
            
            // Prevent right-click for security
            document.addEventListener('contextmenu', e => e.preventDefault());
            
            // Handle window resize
            window.addEventListener('resize', handleResize);
            
            // Handle online/offline status
            window.addEventListener('online', () => {
                showNotification('Connection restored! 🌐', 'success');
            });
            
            window.addEventListener('offline', () => {
                showNotification('You are offline. Some features may not work.', 'warning');
            });
        }

        function handleResize() {
            // Adjust UI for different screen sizes
            const isMobile = window.innerWidth <= 768;
            const navContainer = document.querySelector('.nav-container');
            
            if (isMobile) {
                navContainer.style.flexDirection = 'column';
            } else {
                navContainer.style.flexDirection = 'row';
            }
        }

        // ===== WORD COUNTER =====
        function initializeWordCounter() {
            updateWordCounter();
        }

        function updateWordCounter() {
            const videoPrompt = document.getElementById('videoPrompt');
            const imagePrompt = document.getElementById('imagePrompt');
            const wordCountEl = document.getElementById('wordCount');
            const charCountEl = document.getElementById('charCount');
            
            const activeTab = document.querySelector('.tab-content.active');
            const isTextTab = activeTab && activeTab.id === 'textTab';
            
            const text = isTextTab ? videoPrompt.value.trim() : 
                        (videoPrompt.value.trim() + ' ' + imagePrompt.value.trim()).trim();
            
            const words = text === '' ? 0 : text.split(/\s+/).filter(word => word.length > 0).length;
            const chars = isTextTab ? videoPrompt.value.length : videoPrompt.value.length + imagePrompt.value.length;
            
            if (wordCountEl) wordCountEl.textContent = `${words} words`;
            if (charCountEl) charCountEl.textContent = `${chars}/${CONFIG.MAX_PROMPT_LENGTH} characters`;
            
            // Color coding based on word count
            if (wordCountEl) {
                if (words > 100) {
                    wordCountEl.style.color = '#fa709a';
                } else if (words > 50) {
                    wordCountEl.style.color = '#fee140';
                } else if (words > 0) {
                    wordCountEl.style.color = 'var(--neon-green)';
                } else {
                    wordCountEl.style.color = 'var(--text-muted)';
                }
            }
        }

        // ===== TAB MANAGEMENT =====
        function switchTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab-trigger').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            appState.currentTab = tabName;
            updateWordCounter();
        }

        // ===== IMAGE UPLOAD =====
        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                processImageFile(file);
            }
        }

        function handleDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('dragover');
        }

        function handleDragLeave(event) {
            event.currentTarget.classList.remove('dragover');
        }

        function handleFileDrop(event) {
            event.preventDefault();
            event.currentTarget.classList.remove('dragover');
            
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                processImageFile(files[0]);
            }
        }

        async function processImageFile(file) {
            // Validate file
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file', 'error');
                return;
            }
            
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                showNotification('File size must be less than 10MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                const imageData = e.target.result;
                
                // Show image preview
                const preview = document.getElementById('imagePreview');
                const uploadContent = document.getElementById('imageUploadContent');
                const previewContainer = document.getElementById('imagePreviewContainer');
                
                preview.src = imageData;
                uploadContent.classList.add('hidden');
                previewContainer.classList.remove('hidden');
                
                // Store uploaded image
                currentGeneration.uploadedImage = imageData;
                userData.uploadedImages.push({
                    id: Date.now(),
                    data: imageData,
                    timestamp: new Date().toISOString(),
                    filename: file.name
                });
                saveUserData();
                
                // Show analysis status
                document.getElementById('analysisStatus').classList.remove('hidden');
                document.getElementById('analysisResult').classList.add('hidden');
                appState.isAnalyzing = true;
                
                try {
                    // Analyze image with AI
                    const analysis = await OpenAIIntegration.analyzeImage(imageData);
                    
                    // Hide analysis status and show result
                    document.getElementById('analysisStatus').classList.add('hidden');
                    document.getElementById('analysisResult').classList.remove('hidden');
                    document.getElementById('analysisText').textContent = analysis;
                    
                    // Auto-fill image prompt
                    document.getElementById('imagePrompt').value = analysis;
                    currentGeneration.imagePrompt = analysis;
                    
                    updateWordCounter();
                    showNotification('Image analyzed successfully! 🎯', 'success');
                    
                } catch (error) {
                    console.error('Image analysis failed:', error);
                    document.getElementById('analysisStatus').classList.add('hidden');
                    showNotification('Image analysis failed. Please try again.', 'error');
                } finally {
                    appState.isAnalyzing = false;
                }
            };
            
            reader.readAsDataURL(file);
        }

        function removeImage() {
            document.getElementById('imageUploadContent').classList.remove('hidden');
            document.getElementById('imagePreviewContainer').classList.add('hidden');
            document.getElementById('imageInput').value = '';
            document.getElementById('analysisResult').classList.add('hidden');
            currentGeneration.uploadedImage = null;
            currentGeneration.imagePrompt = '';
            document.getElementById('imagePrompt').value = '';
            updateWordCounter();
        }

        // ===== VIDEO GENERATION =====
        async function startGeneration() {
            const videoPrompt = document.getElementById('videoPrompt').value.trim();
            const imagePrompt = document.getElementById('imagePrompt').value.trim();
            const activeTab = document.querySelector('.tab-content.active');
            const isImageTab = activeTab && activeTab.id === 'imageTab';
            
            // Validation
            if (!videoPrompt && !imagePrompt) {
                showNotification('Please provide a description or upload an image', 'error');
                return;
            }
            
            if (!isImageTab && videoPrompt.split(/\s+/).length < 5) {
                showNotification('Please provide a more detailed description (at least 5 words)', 'error');
                return;
            }
            
            if (isImageTab && !currentGeneration.uploadedImage) {
                showNotification('Please upload an image first', 'error');
                return;
            }
            
            // Check trials
            if (!userData.isPremium && userData.trialsRemaining <= 0) {
                showNotification('No generations remaining. Subscribe to Premium for unlimited access!', 'warning');
                showPremiumModal();
                return;
            }
            
            // Get generation parameters
            const style = document.getElementById('videoStyle').value;
            const duration = parseInt(document.getElementById('videoDuration').value);
            const quality = userData.isPremium ? '4K Ultra HD' : '1080p HD';
            
            // Check premium requirements
            if (duration > 30 && !userData.isPremium) {
                showNotification('Premium subscription required for longer videos', 'warning');
                showPremiumModal();
                return;
            }
            
            // Prepare generation data
            currentGeneration = {
                id: Date.now().toString(),
                prompt: videoPrompt,
                imagePrompt: imagePrompt,
                uploadedImage: currentGeneration.uploadedImage,
                style: style,
                duration: duration,
                quality: quality,
                hasWatermark: !userData.isPremium,
                timestamp: new Date().toISOString()
            };
            
            // Start generation process
            await generateVideoWithAI();
        }

        async function generateVideoWithAI() {
            const overlay = document.getElementById('generationOverlay');
            
            // Update display values
            document.getElementById('promptDisplay').textContent = 
                (currentGeneration.prompt || currentGeneration.imagePrompt).substring(0, 40) + '...';
            document.getElementById('styleDisplay').textContent = currentGeneration.style;
            document.getElementById('durationDisplay').textContent = currentGeneration.duration + 's';
            document.getElementById('qualityDisplayGen').textContent = currentGeneration.quality;
            
            // Show generation overlay
            overlay.classList.add('active');
            appState.isGenerating = true;
            
            // Disable generate button
            const generateBtn = document.getElementById('generateBtn');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            try {
                // Step 1: Enhance prompt with AI
                updateGenerationProgress('Enhancing prompt with AI...', 10);
                await sleep(2000);
                
                const enhancedPrompt = await OpenAIIntegration.enhancePrompt(
                    currentGeneration.prompt, 
                    currentGeneration.imagePrompt, 
                    currentGeneration.style, 
                    currentGeneration.duration
                );
                
                currentGeneration.enhancedPrompt = enhancedPrompt;
                
                // Step 2: Generate video using Python integration
                const videoResult = await PythonVideoProcessor.generateVideo(currentGeneration, userData.isPremium);
                
                if (videoResult.success) {
                    currentGeneration.videoUrl = videoResult.videoUrl;
                    currentGeneration.thumbnail = videoResult.thumbnail;
                    currentGeneration.processingTime = videoResult.processingTime;
                    
                    // Add to history
                    const newHistory = [currentGeneration, ...userData.generationHistory].slice(0, 50);
                    userData.generationHistory = newHistory;
                    
                    // Update trials for non-premium users
                    if (!userData.isPremium) {
                        userData.trialsRemaining = Math.max(0, userData.trialsRemaining - 1);
                    }
                    
                    saveUserData();
                    
                    // Show generated video
                    showGeneratedVideo();
                    updateUI();
                    
                    showNotification(`Video generated successfully! Quality: ${currentGeneration.quality} 🎬`, 'success');
                } else {
                    throw new Error('Video generation failed');
                }
                
            } catch (error) {
                console.error('Generation error:', error);
                showNotification('Video generation failed. Please try again.', 'error');
            } finally {
                overlay.classList.remove('active');
                appState.isGenerating = false;
                
                // Re-enable generate button
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Video';
            }
        }

        function updateGenerationProgress(stage, progress) {
            document.getElementById('generationStatus').textContent = stage;
            document.getElementById('progressBar').style.width = progress + '%';
            
            appState.generationProgress = {
                stage: stage,
                progress: progress,
                estimatedTime: 0
            };
        }

        function showGeneratedVideo() {
            const section = document.getElementById('videoSection');
            const player = document.getElementById('videoPlayer');
            const watermark = document.getElementById('videoWatermark');
            
            player.src = currentGeneration.videoUrl;
            player.poster = currentGeneration.thumbnail;
            
            // Show/hide watermark based on user status
            if (currentGeneration.hasWatermark) {
                watermark.style.display = 'block';
            } else {
                watermark.style.display = 'none';
            }
            
            section.classList.add('active');
            section.scrollIntoView({ behavior: 'smooth' });
        }

        function regenerateVideo() {
            if (!userData.isPremium && userData.trialsRemaining <= 0) {
                showNotification('No regenerations remaining. Subscribe to Premium for unlimited tries!', 'warning');
                showPremiumModal();
                return;
            }
            
            generateVideoWithAI();
        }

        // ===== DOWNLOAD FUNCTIONALITY =====
        function showDownloadModal() {
            if (!currentGeneration.videoUrl) {
                showNotification('No video to download. Generate a video first.', 'error');
                return;
            }
            
            // Update downloads remaining display
            const remaining = Math.max(0, 3 - userData.dailyDownloads);
            document.getElementById('downloadsRemaining').textContent = `Downloads remaining today: ${remaining}`;
            
            document.getElementById('downloadModal').classList.add('active');
        }

        async function downloadVideo(type) {
            if (type === 'premium' && !userData.isPremium) {
                showNotification('Premium subscription required for high-quality downloads', 'warning');
                showPremiumModal();
                return;
            }
            
            // Check daily download limit for free users
            if (!userData.isPremium && userData.dailyDownloads >= 3) {
                showNotification('Daily download limit reached (3/3). Subscribe to Premium for unlimited downloads.', 'warning');
                showPremiumModal();
                return;
            }
            
            closeModal('downloadModal');
            
            if (type === 'free') {
                // Show ad first for free users
                showAdModal(() => {
                    performDownload('1080p HD with SmileX watermark');
                });
            } else {
                performDownload('4K Ultra HD');
            }
        }

        function showAdModal(callback) {
            const modal = document.getElementById('adModal');
            const countdown = document.getElementById('adCountdown');
            const progressBar = document.getElementById('adProgressBar');
            
            modal.classList.add('active');
            
            let timeLeft = 30;
            countdown.textContent = timeLeft;
            progressBar.style.width = '0%';
            
            const adInterval = setInterval(() => {
                timeLeft--;
                countdown.textContent = timeLeft;
                progressBar.style.width = `${((30 - timeLeft) / 30) * 100}%`;
                
                if (timeLeft <= 0) {
                    clearInterval(adInterval);
                    modal.classList.remove('active');
                    showNotification('Advertisement completed! Starting download...', 'success');
                    callback();
                }
            }, 1000);
        }

        async function performDownload(quality) {
            try {
                appState.isDownloading = true;
                showNotification(`Preparing ${quality} download...`, 'info');
                
                // Simulate download processing with Python integration
                const downloadResult = await PythonVideoProcessor.processVideo(
                    { url: currentGeneration.videoUrl, startTime: Date.now() },
                    { 
                        addWatermark: quality.includes('watermark'),
                        quality: quality.includes('4K') ? '4K' : '1080p'
                    }
                );
                
                if (downloadResult.success) {
                    // Create download link
                    const link = document.createElement('a');
                    link.href = currentGeneration.videoUrl;
                    link.download = `smileX-${currentGeneration.style}-${Date.now()}.mp4`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Update download count for free users
                    if (!userData.isPremium) {
                        userData.dailyDownloads++;
                        saveUserData();
                    }
                    
                    showNotification(`Downloading ${quality} video... 📥`, 'success');
                } else {
                    throw new Error('Download processing failed');
                }
                
            } catch (error) {
                console.error('Download error:', error);
                showNotification('Download failed. Please try again.', 'error');
            } finally {
                appState.isDownloading = false;
            }
        }

        // ===== SHARING FUNCTIONALITY =====
        function shareVideo() {
            if (!currentGeneration.videoUrl) {
                showNotification('No video to share. Generate a video first.', 'error');
                return;
            }
            
            const shareData = {
                title: 'Check out my AI-generated video!',
                text: `I created this amazing video using SmileX AI: "${currentGeneration.prompt || currentGeneration.imagePrompt}"`,
                url: window.location.href
            };
            
            if (navigator.share) {
                navigator.share(shareData).catch(console.error);
            } else {
                // Fallback to clipboard
                const shareText = `${shareData.text} ${shareData.url}`;
                navigator.clipboard.writeText(shareText).then(() => {
                    showNotification('Share text copied to clipboard! 📋', 'success');
                }).catch(() => {
                    showNotification('Unable to share. Please copy the URL manually.', 'error');
                });
            }
        }

        function addToFavorites() {
            if (!currentGeneration.videoUrl) {
                showNotification('No video to add to favorites.', 'error');
                return;
            }
            
            const favorite = {
                id: currentGeneration.id,
                timestamp: new Date().toISOString(),
                videoData: { ...currentGeneration }
            };
            
            userData.favorites.push(favorite);
            saveUserData();
            
            showNotification('Video added to favorites! ❤️', 'success');
        }

        // ===== PREMIUM FUNCTIONALITY =====
        function subscribeToPremium() {
            showNotification('Redirecting to secure payment...', 'info');
            
            // Simulate payment process
            setTimeout(() => {
                userData.isPremium = true;
                userData.isSubscribed = true;
                userData.subscriptionDate = new Date().toISOString();
                userData.subscriptionId = 'sub_' + Math.random().toString(36).substr(2, 9);
                userData.trialsRemaining = Number.POSITIVE_INFINITY;
                userData.dailyDownloads = 0;
                
                saveUserData();
                updateUI();
                closeModal('premiumModal');
                
                showNotification('Welcome to SmileX Premium! You now have unlimited access to all features. 👑', 'success');
            }, 2000);
        }

        function showPremiumModal() {
            document.getElementById('premiumModal').classList.add('active');
        }

        // ===== HISTORY FUNCTIONALITY =====
        function toggleHistory() {
            const modal = document.getElementById('historyModal');
            const content = document.getElementById('historyContent');
            
            if (userData.generationHistory.length === 0) {
                content.innerHTML = `
                    <div class="text-center" style="padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-video" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <h3>No videos generated yet</h3>
                        <p>Start creating amazing videos with AI!</p>
                    </div>
                `;
            } else {
                content.innerHTML = `
                    <div class="history-grid">
                        ${userData.generationHistory.map(video => `
                            <div class="history-item" onclick="loadHistoryVideo('${video.id}')">
                                <div class="history-thumbnail">
                                    <i class="fas fa-play" style="font-size: 2rem;"></i>
                                </div>
                                <div class="history-title">${video.prompt || video.imagePrompt}</div>
                                <div class="history-meta">
                                    <span>${video.style} • ${video.duration}s</span>
                                    <span>${new Date(video.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div class="history-tags">
                                    <span class="history-tag">${video.style}</span>
                                    <span class="history-tag">${video.duration}s</span>
                                    <span class="history-tag">${video.quality}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            modal.classList.add('active');
        }

        function loadHistoryVideo(videoId) {
            const video = userData.generationHistory.find(v => v.id === videoId);
            if (video) {
                currentGeneration = { ...video };
                showGeneratedVideo();
                closeModal('historyModal');
                showNotification('Video loaded from history', 'success');
            }
        }

        // ===== UI UPDATES =====
        function updateUI() {
            updateTrialsDisplay();
            updatePremiumButton();
            updateQualityOptions();
            updateAdVisibility();
        }

        function updateTrialsDisplay() {
            const statusEl = document.getElementById('userStatus');
            const trialsEl = document.getElementById('videoInfoText');
            const trialsInfo = document.getElementById('trialsInfo');
            
            if (userData.isPremium) {
                const premiumText = '✨ Premium: Unlimited generations';
                if (statusEl) statusEl.textContent = premiumText;
                if (trialsEl) trialsEl.textContent = premiumText;
                if (trialsInfo) trialsInfo.textContent = 'Premium users have unlimited access';
            } else {
                const remaining = userData.trialsRemaining;
                const freeText = `Free: ${remaining} generation${remaining !== 1 ? 's' : ''} remaining`;
                if (statusEl) statusEl.textContent = freeText;
                if (trialsEl) trialsEl.textContent = freeText;
                if (trialsInfo) trialsInfo.textContent = 'Free users get 3 daily generations';
            }
        }

        function updatePremiumButton() {
            const btn = document.getElementById('premiumBtn');
            const btnText = document.getElementById('premiumBtnText');
            
            if (userData.isSubscribed) {
                btn.style.background = 'var(--success-gradient)';
                btnText.innerHTML = '<i class="fas fa-crown"></i> Premium Active';
                btn.onclick = () => showNotification('You are already subscribed to Premium! 👑', 'success');
            } else {
                btn.style.background = 'var(--premium-gradient)';
                btnText.innerHTML = '<i class="fas fa-crown"></i> Go Premium';
                btn.onclick = () => showPremiumModal();
            }
        }

        function updateQualityOptions() {
            const qualityDisplay = document.getElementById('qualityDisplay');
            const durationSelect = document.getElementById('videoDuration');
            
            if (userData.isPremium) {
                qualityDisplay.textContent = '4K Ultra HD (Premium)';
                
                // Enable premium duration options
                Array.from(durationSelect.options).forEach(option => {
                    option.disabled = false;
                    if (option.classList.contains('premium-option')) {
                        option.textContent = option.textContent.replace(' (Premium)', '');
                    }
                });
            } else {
                qualityDisplay.textContent = '1080p HD (Free)';
                
                // Disable premium duration options
                Array.from(durationSelect.options).forEach(option => {
                    if (option.classList.contains('premium-option')) {
                        option.disabled = true;
                        if (!option.textContent.includes('(Premium)')) {
                            option.textContent += ' (Premium)';
                        }
                    }
                });
                
                // Reset to free option if premium option is selected
                if (durationSelect.value > 30) {
                    durationSelect.value = '30';
                }
            }
        }

        function updateAdVisibility() {
            const adContainer = document.getElementById('adContainer');
            if (userData.isPremium) {
                adContainer.style.display = 'none';
            } else {
                adContainer.style.display = 'flex';
            }
        }

        // ===== MODAL MANAGEMENT =====
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // ===== NOTIFICATION SYSTEM =====
        function showNotification(message, type = 'info') {
            const notification = document.getElementById('notification');
            
            // Clear any existing timeout
            if (notification.timeout) {
                clearTimeout(notification.timeout);
            }
            
            notification.innerHTML = message;
            notification.className = `notification ${type} show`;
            
            // Auto-hide after 5 seconds
            notification.timeout = setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }

        // ===== GOOGLE ADS INTEGRATION =====
        function initializeGoogleAds() {
            if (CONFIG.GOOGLE_ADS_CLIENT !== 'ca-pub-XXXXXXXXXX') {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (error) {
                    console.error('Google Ads initialization error:', error);
                }
            }
        }

        // ===== UTILITY FUNCTIONS =====
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        function formatFileSize(bytes) {
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 Bytes';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        }

        function generateUniqueId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // ===== ERROR HANDLING =====
        window.addEventListener('error', function(event) {
            console.error('Application error:', event.error);
            showNotification('An unexpected error occurred. Please refresh the page.', 'error');
        });

        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            showNotification('A network error occurred. Please check your connection.', 'error');
        });

        // ===== PERFORMANCE MONITORING =====
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`SmileX AI loaded in ${loadTime.toFixed(2)}ms`);
            
            // Initialize performance observer
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'navigation') {
                            console.log(`Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
                        }
                    }
                });
                observer.observe({ entryTypes: ['navigation'] });
            }
        });

        // ===== KEYBOARD SHORTCUTS =====
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!appState.isGenerating) {
                    startGeneration();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
            
            // Ctrl/Cmd + H for history
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                toggleHistory();
            }
        });

        // ===== ACCESSIBILITY ENHANCEMENTS =====
        function enhanceAccessibility() {
            // Add ARIA labels
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                if (!button.getAttribute('aria-label') && button.textContent) {
                    button.setAttribute('aria-label', button.textContent.trim());
                }
            });
            
            // Add focus indicators
            const focusableElements = document.querySelectorAll('button, input, textarea, select, [tabindex]');
            focusableElements.forEach(element => {
                element.addEventListener('focus', function() {
                    this.style.outline = '2px solid var(--neon-blue)';
                    this.style.outlineOffset = '2px';
                });
                
                element.addEventListener('blur', function() {
                    this.style.outline = '';
                    this.style.outlineOffset = '';
                });
            });
        }

        // Initialize accessibility enhancements
        document.addEventListener('DOMContentLoaded', enhanceAccessibility);

        // ===== ANALYTICS AND TRACKING =====
        function trackEvent(eventName, eventData = {}) {
            // Placeholder for analytics tracking
            console.log('Analytics Event:', eventName, eventData);
            
            // Example: Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, eventData);
            }
        }

        // Track user interactions
        function setupAnalytics() {
            // Track video generations
            const originalStartGeneration = startGeneration;
            startGeneration = function() {
                trackEvent('video_generation_started', {
                    style: document.getElementById('videoStyle').value,
                    duration: document.getElementById('videoDuration').value,
                    user_type: userData.isPremium ? 'premium' : 'free'
                });
                return originalStartGeneration.apply(this, arguments);
            };
            
            // Track downloads
            const originalDownloadVideo = downloadVideo;
            downloadVideo = function(type) {
                trackEvent('video_download_started', {
                    download_type: type,
                    user_type: userData.isPremium ? 'premium' : 'free'
                });
                return originalDownloadVideo.apply(this, arguments);
            };
        }

        // Initialize analytics
        document.addEventListener('DOMContentLoaded', setupAnalytics);

        // ===== FINAL INITIALIZATION =====
        console.log('SmileX AI Video Generator - Complete Edition Loaded');
        console.log('Features: AI Video Generation, Image Analysis, Premium Subscriptions, Watermarking, Google Ads Integration');
        console.log('Technologies: SMILEX OPERATIONS');

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
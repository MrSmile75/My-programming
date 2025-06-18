// Application Configuration
const CONFIG = {
  API_BASE_URL: "/api",
  OPENAI_API_URL: "https://api.openai.com/v1",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PROMPT_LENGTH: 2000,
  GENERATION_TIMEOUT: 300000, // 5 minutes
  SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/gif", "image/webp"],
}

// Content Filtering System
const CONTENT_FILTERS = {
  hate_violence: [
    "kill",
    "murder",
    "violence",
    "hate",
    "nazi",
    "terrorist",
    "bomb",
    "weapon",
    "gun",
    "knife",
    "blood",
    "gore",
    "torture",
    "abuse",
    "assault",
    "attack",
    "fight",
    "war",
    "death",
    "suicide",
  ],
  adult_nsfw: [
    "nude",
    "naked",
    "sex",
    "porn",
    "adult",
    "explicit",
    "erotic",
    "sexual",
    "intimate",
    "breast",
    "genitals",
    "orgasm",
    "masturbation",
    "fetish",
    "bdsm",
    "strip",
    "underwear",
    "lingerie",
  ],
  malware_fraud: [
    "hack",
    "malware",
    "virus",
    "trojan",
    "phishing",
    "scam",
    "fraud",
    "steal",
    "password",
    "credit card",
    "bank account",
    "social security",
    "identity theft",
    "ransomware",
    "exploit",
    "backdoor",
  ],
  political: [
    "vote for",
    "elect",
    "campaign",
    "politician",
    "election",
    "ballot",
    "candidate",
    "political party",
    "democrat",
    "republican",
    "liberal",
    "conservative",
    "propaganda",
    "rally",
    "protest",
  ],
  misinformation: [
    "fake news",
    "conspiracy",
    "hoax",
    "lie",
    "false information",
    "misleading",
    "disinformation",
    "rumor",
    "unverified",
    "debunked",
    "myth",
    "fabricated",
  ],
}

// Application State
const appState = {
  user: null,
  isAuthenticated: false,
  currentGeneration: null,
  isGenerating: false,
  uploadedImage: null,
  currentTab: "text",
}

// Utility Functions
function showNotification(message, type = "info", duration = 5000) {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `notification ${type} show`

  setTimeout(() => {
    notification.classList.remove("show")
  }, duration)
}

function showModal(modalId) {
  document.getElementById(modalId).classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

function formatFileSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Content Filtering
function checkContentRestrictions(text) {
  const lowerText = text.toLowerCase()
  const violations = []

  for (const [category, keywords] of Object.entries(CONTENT_FILTERS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        violations.push({
          category: category.replace("_", " "),
          keyword: keyword,
          severity: "high",
        })
      }
    }
  }

  return violations
}

// API Functions
async function apiRequest(endpoint, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  }

  if (appState.user?.token) {
    defaultOptions.headers.Authorization = `Bearer ${appState.user.token}`
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "API request failed")
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Authentication Functions
async function login(email, password) {
  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    appState.user = response.user
    appState.isAuthenticated = true

    localStorage.setItem("user", JSON.stringify(response.user))

    updateUI()
    closeModal("authModal")
    showNotification("Login successful!", "success")

    return response
  } catch (error) {
    showNotification(error.message, "error")
    throw error
  }
}

async function signup(email, password, name) {
  try {
    const response = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })

    appState.user = response.user
    appState.isAuthenticated = true

    localStorage.setItem("user", JSON.stringify(response.user))

    updateUI()
    closeModal("authModal")
    showNotification("Account created successfully!", "success")

    return response
  } catch (error) {
    showNotification(error.message, "error")
    throw error
  }
}

function logout() {
  appState.user = null
  appState.isAuthenticated = false
  localStorage.removeItem("user")

  updateUI()
  showNotification("Logged out successfully", "info")
}

// UI Functions
function updateUI() {
  const loginBtn = document.getElementById("loginBtn")
  const signupBtn = document.getElementById("signupBtn")
  const logoutBtn = document.getElementById("logoutBtn")
  const premiumBtn = document.getElementById("premiumBtn")
  const userInfo = document.getElementById("userInfo")
  const userName = document.getElementById("userName")
  const userAvatar = document.getElementById("userAvatar")
  const userStatus = document.getElementById("userStatus")
  const authRequired = document.getElementById("authRequired")
  const generatorContent = document.getElementById("generatorContent")
  const dashboardLink = document.getElementById("dashboardLink")

  if (appState.isAuthenticated && appState.user) {
    // Show authenticated UI
    loginBtn.style.display = "none"
    signupBtn.style.display = "none"
    logoutBtn.style.display = "inline-flex"
    premiumBtn.style.display = "inline-flex"
    userInfo.style.display = "flex"
    dashboardLink.style.display = "inline-block"

    userName.textContent = appState.user.name
    userAvatar.textContent = appState.user.name.charAt(0).toUpperCase()
    userStatus.textContent = appState.user.isPremium ? "Premium" : "Free"

    authRequired.style.display = "none"
    generatorContent.style.display = "block"

    updateGenerationUI()
  } else {
    // Show unauthenticated UI
    loginBtn.style.display = "inline-flex"
    signupBtn.style.display = "inline-flex"
    logoutBtn.style.display = "none"
    premiumBtn.style.display = "none"
    userInfo.style.display = "none"
    dashboardLink.style.display = "none"

    authRequired.style.display = "block"
    generatorContent.style.display = "none"
  }
}

function updateGenerationUI() {
  if (!appState.user) return

  const qualityDisplay = document.getElementById("qualityDisplay")
  const generationsDisplay = document.getElementById("generationsDisplay")
  const generationInfo = document.getElementById("generationInfo")
  const videoDuration = document.getElementById("videoDuration")

  if (appState.user.isPremium) {
    qualityDisplay.textContent = "4K Ultra HD"
    generationsDisplay.textContent = "Unlimited"
    generationInfo.textContent = "Premium users have unlimited access"

    // Enable premium options
    Array.from(videoDuration.options).forEach((option) => {
      option.disabled = false
      if (option.classList.contains("premium-option")) {
        option.textContent = option.textContent.replace(" (Premium)", "")
      }
    })
  } else {
    qualityDisplay.textContent = "1080p HD"
    generationsDisplay.textContent = `${appState.user.generationsLeft || 0} remaining`
    generationInfo.textContent = "Free users get 3 daily generations"

    // Disable premium options
    Array.from(videoDuration.options).forEach((option) => {
      if (option.classList.contains("premium-option")) {
        option.disabled = true
        if (!option.textContent.includes("(Premium)")) {
          option.textContent += " (Premium)"
        }
      }
    })
  }
}

function updateWordCount() {
  const videoPrompt = document.getElementById("videoPrompt")
  const imagePrompt = document.getElementById("imagePrompt")
  const charCount = document.getElementById("charCount")
  const wordCount = document.getElementById("wordCount")

  const activeTab = document.querySelector(".tab-content.active")
  const isTextTab = activeTab && activeTab.id === "textTab"

  const text = isTextTab ? videoPrompt.value.trim() : (videoPrompt.value.trim() + " " + imagePrompt.value.trim()).trim()

  const words = text === "" ? 0 : text.split(/\s+/).filter((word) => word.length > 0).length
  const chars = isTextTab ? videoPrompt.value.length : videoPrompt.value.length + imagePrompt.value.length

  if (charCount) charCount.textContent = `${chars}/${CONFIG.MAX_PROMPT_LENGTH} characters`
  if (wordCount) wordCount.textContent = `${words} words`
}

// Tab Management
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))
  document.getElementById(tabName + "Tab").classList.add("active")

  appState.currentTab = tabName
  updateWordCount()
}

// Image Upload Functions
function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
}

function handleDragOver(event) {
  event.preventDefault()
  event.currentTarget.classList.add("dragover")
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("dragover")
}

function handleFileDrop(event) {
  event.preventDefault()
  event.currentTarget.classList.remove("dragover")

  const files = event.dataTransfer.files
  if (files.length > 0) {
    processImageFile(files[0])
  }
}

async function processImageFile(file) {
  // Validate file
  if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
    showNotification("Please select a valid image file (JPEG, PNG, GIF, WebP)", "error")
    return
  }

  if (file.size > CONFIG.MAX_FILE_SIZE) {
    showNotification(`File size must be less than ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`, "error")
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const imageData = e.target.result

    // Show image preview
    const uploadContent = document.getElementById("uploadContent")
    const imagePreview = document.getElementById("imagePreview")
    const previewImg = document.getElementById("previewImg")

    previewImg.src = imageData
    uploadContent.style.display = "none"
    imagePreview.style.display = "block"

    appState.uploadedImage = {
      data: imageData,
      file: file,
      name: file.name,
      size: file.size,
    }

    // Analyze image with AI
    try {
      showNotification("Analyzing image with AI...", "info")
      const analysis = await analyzeImageWithAI(imageData)

      // Show AI analysis
      const aiAnalysis = document.getElementById("aiAnalysis")
      const analysisContent = document.getElementById("analysisContent")

      analysisContent.textContent = analysis
      aiAnalysis.style.display = "block"

      // Auto-fill image prompt
      document.getElementById("imagePrompt").value = analysis
      updateWordCount()

      showNotification("Image analyzed successfully!", "success")
    } catch (error) {
      console.error("Image analysis failed:", error)
      showNotification("Image analysis failed. You can still add a manual description.", "warning")
    }
  }

  reader.readAsDataURL(file)
}

function removeImage() {
  const uploadContent = document.getElementById("uploadContent")
  const imagePreview = document.getElementById("imagePreview")
  const aiAnalysis = document.getElementById("aiAnalysis")
  const imageInput = document.getElementById("imageInput")
  const imagePrompt = document.getElementById("imagePrompt")

  uploadContent.style.display = "block"
  imagePreview.style.display = "none"
  aiAnalysis.style.display = "none"
  imageInput.value = ""
  imagePrompt.value = ""

  appState.uploadedImage = null
  updateWordCount()
}

// AI Integration Functions
async function analyzeImageWithAI(imageData) {
  try {
    const response = await apiRequest("/ai/analyze-image", {
      method: "POST",
      body: JSON.stringify({ imageData }),
    })

    return response.analysis
  } catch (error) {
    console.error("AI analysis error:", error)
    throw error
  }
}

async function enhancePromptWithAI(prompt, style, duration) {
  try {
    const response = await apiRequest("/ai/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ prompt, style, duration }),
    })

    return response.enhancedPrompt
  } catch (error) {
    console.error("Prompt enhancement error:", error)
    return prompt // Fallback to original prompt
  }
}

// Video Generation Functions
async function generateVideo() {
  if (!appState.isAuthenticated) {
    showNotification("Please log in to generate videos", "error")
    showAuthModal("login")
    return
  }

  const videoPrompt = document.getElementById("videoPrompt").value.trim()
  const imagePrompt = document.getElementById("imagePrompt").value.trim()
  const style = document.getElementById("videoStyle").value
  const duration = Number.parseInt(document.getElementById("videoDuration").value)

  // Validation
  if (!videoPrompt && !imagePrompt) {
    showNotification("Please provide a description or upload an image", "error")
    return
  }

  if (appState.currentTab === "text" && videoPrompt.split(/\s+/).length < 5) {
    showNotification("Please provide a more detailed description (at least 5 words)", "error")
    return
  }

  if (appState.currentTab === "image" && !appState.uploadedImage) {
    showNotification("Please upload an image first", "error")
    return
  }

  // Check content restrictions
  const combinedText = (videoPrompt + " " + imagePrompt).trim()
  const violations = checkContentRestrictions(combinedText)

  if (violations.length > 0) {
    const violationTypes = violations.map((v) => v.category).join(", ")
    showNotification(`Content violation detected: ${violationTypes}. Please modify your prompt.`, "error")
    return
  }

  // Check user limits
  if (!appState.user.isPremium && appState.user.generationsLeft <= 0) {
    showNotification("No generations remaining. Upgrade to Premium for unlimited access!", "warning")
    showPremiumModal()
    return
  }

  // Check premium requirements
  if (duration > 30 && !appState.user.isPremium) {
    showNotification("Premium subscription required for longer videos", "warning")
    showPremiumModal()
    return
  }

  // Start generation
  await startVideoGeneration({
    prompt: videoPrompt,
    imagePrompt: imagePrompt,
    uploadedImage: appState.uploadedImage,
    style: style,
    duration: duration,
  })
}

async function startVideoGeneration(generationData) {
  appState.isGenerating = true
  appState.currentGeneration = {
    ...generationData,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  }

  // Update UI
  const generateBtn = document.getElementById("generateBtn")
  generateBtn.disabled = true
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'

  // Show generation modal
  showModal("generationModal")
  updateGenerationProgress("Initializing AI...", 0)

  // Update progress details
  document.getElementById("promptDetail").textContent =
    (generationData.prompt || generationData.imagePrompt).substring(0, 50) + "..."
  document.getElementById("styleDetail").textContent = generationData.style
  document.getElementById("durationDetail").textContent = generationData.duration + "s"

  try {
    // Step 1: Enhance prompt
    updateGenerationProgress("Enhancing prompt with AI...", 10)
    await sleep(2000)

    const enhancedPrompt = await enhancePromptWithAI(
      generationData.prompt || generationData.imagePrompt,
      generationData.style,
      generationData.duration,
    )

    appState.currentGeneration.enhancedPrompt = enhancedPrompt

    // Step 2: Generate video
    updateGenerationProgress("Processing with AI models...", 30)
    await sleep(3000)

    const videoResult = await apiRequest("/ai/generate-video", {
      method: "POST",
      body: JSON.stringify({
        ...generationData,
        enhancedPrompt: enhancedPrompt,
      }),
    })

    // Step 3: Apply watermark if needed
    if (!appState.user.isPremium) {
      updateGenerationProgress("Applying watermark...", 80)
      await sleep(2000)
    }

    // Step 4: Finalize
    updateGenerationProgress("Finalizing video...", 95)
    await sleep(1000)

    updateGenerationProgress("Complete!", 100)
    await sleep(1000)

    // Show result
    appState.currentGeneration.videoUrl = videoResult.videoUrl
    appState.currentGeneration.thumbnail = videoResult.thumbnail

    showVideoResult()
    closeModal("generationModal")

    // Update user data
    if (!appState.user.isPremium) {
      appState.user.generationsLeft = Math.max(0, appState.user.generationsLeft - 1)
      updateGenerationUI()
    }

    showNotification("Video generated successfully!", "success")
  } catch (error) {
    console.error("Generation error:", error)
    closeModal("generationModal")
    showNotification("Video generation failed. Please try again.", "error")
  } finally {
    appState.isGenerating = false

    // Reset generate button
    generateBtn.disabled = false
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Video'
  }
}

function updateGenerationProgress(status, progress) {
  document.getElementById("generationStatus").textContent = status
  document.getElementById("progressFill").style.width = progress + "%"
}

function showVideoResult() {
  const videoResult = document.getElementById("videoResult")
  const resultVideo = document.getElementById("resultVideo")
  const videoWatermark = document.getElementById("videoWatermark")

  resultVideo.src = appState.currentGeneration.videoUrl
  resultVideo.poster = appState.currentGeneration.thumbnail

  // Show/hide watermark
  if (appState.user.isPremium) {
    videoWatermark.style.display = "none"
  } else {
    videoWatermark.style.display = "block"
  }

  videoResult.style.display = "block"
  videoResult.scrollIntoView({ behavior: "smooth" })
}

async function regenerateVideo() {
  if (!appState.currentGeneration) {
    showNotification("No video to regenerate", "error")
    return
  }

  if (!appState.user.isPremium && appState.user.generationsLeft <= 0) {
    showNotification("No generations remaining. Upgrade to Premium!", "warning")
    showPremiumModal()
    return
  }

  await startVideoGeneration(appState.currentGeneration)
}

// Download Functions
async function downloadVideo() {
  if (!appState.currentGeneration?.videoUrl) {
    showNotification("No video to download", "error")
    return
  }

  try {
    showNotification("Preparing download...", "info")

    const response = await apiRequest("/videos/download", {
      method: "POST",
      body: JSON.stringify({
        videoId: appState.currentGeneration.id,
        quality: appState.user.isPremium ? "4K" : "1080p",
      }),
    })

    // Create download link
    const link = document.createElement("a")
    link.href = response.downloadUrl
    link.download = `smileX-${appState.currentGeneration.style}-${Date.now()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification("Download started!", "success")
  } catch (error) {
    console.error("Download error:", error)
    showNotification("Download failed. Please try again.", "error")
  }
}

function shareVideo() {
  if (!appState.currentGeneration?.videoUrl) {
    showNotification("No video to share", "error")
    return
  }

  const shareData = {
    title: "Check out my AI-generated video!",
    text: `I created this amazing video using SmileX AI: "${appState.currentGeneration.prompt || appState.currentGeneration.imagePrompt}"`,
    url: window.location.href,
  }

  if (navigator.share) {
    navigator.share(shareData).catch(console.error)
  } else {
    // Fallback to clipboard
    const shareText = `${shareData.text} ${shareData.url}`
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        showNotification("Share text copied to clipboard!", "success")
      })
      .catch(() => {
        showNotification("Unable to share. Please copy the URL manually.", "error")
      })
  }
}

async function addToFavorites() {
  if (!appState.currentGeneration) {
    showNotification("No video to add to favorites", "error")
    return
  }

  try {
    await apiRequest("/user/favorites", {
      method: "POST",
      body: JSON.stringify({
        videoId: appState.currentGeneration.id,
      }),
    })

    showNotification("Video added to favorites!", "success")
  } catch (error) {
    console.error("Favorites error:", error)
    showNotification("Failed to add to favorites", "error")
  }
}

// Premium Functions
async function subscribeToPremium() {
  try {
    showNotification("Redirecting to secure payment...", "info")

    const response = await apiRequest("/payments/create-subscription", {
      method: "POST",
    })

    // Redirect to payment processor
    window.location.href = response.paymentUrl
  } catch (error) {
    console.error("Subscription error:", error)
    showNotification("Failed to start subscription process", "error")
  }
}

function showPremiumModal() {
  showModal("premiumModal")
}

// Auth Modal Functions
function showAuthModal(mode) {
  const authTitle = document.getElementById("authTitle")
  const authSubmitText = document.getElementById("authSubmitText")
  const authSwitchText = document.getElementById("authSwitchText")
  const authSwitchBtn = document.getElementById("authSwitchBtn")
  const nameGroup = document.getElementById("nameGroup")

  if (mode === "login") {
    authTitle.textContent = "Login"
    authSubmitText.textContent = "Login"
    authSwitchText.textContent = "Don't have an account?"
    authSwitchBtn.textContent = "Sign Up"
    nameGroup.style.display = "none"
    authSwitchBtn.onclick = () => showAuthModal("signup")
  } else {
    authTitle.textContent = "Sign Up"
    authSubmitText.textContent = "Sign Up"
    authSwitchText.textContent = "Already have an account?"
    authSwitchBtn.textContent = "Login"
    nameGroup.style.display = "block"
    authSwitchBtn.onclick = () => showAuthModal("login")
  }

  showModal("authModal")
}

function toggleAuthMode() {
  const authTitle = document.getElementById("authTitle")
  const currentMode = authTitle.textContent.toLowerCase()
  showAuthModal(currentMode === "login" ? "signup" : "login")
}

// Navigation Functions
function scrollToGenerator() {
  document.getElementById("generator").scrollIntoView({ behavior: "smooth" })
}

function showDemo() {
  showNotification("Demo video coming soon!", "info")
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Hide loading screen
  setTimeout(() => {
    document.getElementById("loadingScreen").style.opacity = "0"
    setTimeout(() => {
      document.getElementById("loadingScreen").style.display = "none"
    }, 500)
  }, 2000)

  // Check for saved user
  const savedUser = localStorage.getItem("user")
  if (savedUser) {
    try {
      appState.user = JSON.parse(savedUser)
      appState.isAuthenticated = true
    } catch (error) {
      console.error("Error loading saved user:", error)
      localStorage.removeItem("user")
    }
  }

  updateUI()

  // Setup form listeners
  const authForm = document.getElementById("authForm")
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("authEmail").value
    const password = document.getElementById("authPassword").value
    const name = document.getElementById("authName").value
    const isSignup = document.getElementById("authTitle").textContent === "Sign Up"

    try {
      if (isSignup) {
        await signup(email, password, name)
      } else {
        await login(email, password)
      }
    } catch (error) {
      // Error already handled in login/signup functions
    }
  })

  // Setup input listeners
  const videoPrompt = document.getElementById("videoPrompt")
  const imagePrompt = document.getElementById("imagePrompt")
  const imageInput = document.getElementById("imageInput")
  const uploadArea = document.getElementById("uploadArea")

  videoPrompt.addEventListener("input", updateWordCount)
  imagePrompt.addEventListener("input", updateWordCount)
  imageInput.addEventListener("change", handleImageUpload)

  // Drag and drop
  uploadArea.addEventListener("dragover", handleDragOver)
  uploadArea.addEventListener("dragleave", handleDragLeave)
  uploadArea.addEventListener("drop", handleFileDrop)

  // Close modals on outside click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active")
    }
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      if (!appState.isGenerating && appState.isAuthenticated) {
        generateVideo()
      }
    }

    // Escape to close modals
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".modal.active")
      if (activeModal) {
        activeModal.classList.remove("active")
      }
    }
  })

  // Security measures
  document.addEventListener("contextmenu", (e) => e.preventDefault())

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i"))
    ) {
      e.preventDefault()
    }
  })
})

// Initialize word counter
setTimeout(updateWordCount, 100)

console.log("SmileX AI - Professional Video Generator Loaded")

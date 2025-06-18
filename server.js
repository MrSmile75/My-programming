const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const ffmpeg = require("fluent-ffmpeg")
const path = require("path")
const fs = require("fs").promises
const { v4: uuidv4 } = require("uuid")
const OpenAI = require("openai")
const sharp = require("sharp")

// Environment variables
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Security Configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'", "blob:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  }),
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: "Too many authentication attempts, please try again later.",
})

const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 generations per hour
  message: "Generation limit exceeded, please try again later.",
})

app.use(generalLimiter)
app.use(express.json({ limit: "10mb" }))
app.use(express.static("public"))

// File upload configuration
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."))
    }
  },
})

// In-memory database (replace with real database in production)
const users = new Map()
const videos = new Map()
const sessions = new Map()

// Content Moderation System
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

// Content moderation function
function moderateContent(text) {
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

// OpenAI moderation check
async function checkOpenAIModerationAPI(text) {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    })

    return moderation.results[0]
  } catch (error) {
    console.error("OpenAI moderation error:", error)
    return { flagged: false }
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "fallback-secret", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// User management functions
function createUser(email, password, name) {
  const hashedPassword = bcrypt.hashSync(password, 10)
  const user = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    name,
    isPremium: false,
    generationsLeft: 3,
    lastGenerationReset: new Date().toDateString(),
    createdAt: new Date().toISOString(),
    favorites: [],
    generationHistory: [],
  }

  users.set(user.id, user)
  return user
}

function getUserByEmail(email) {
  for (const user of users.values()) {
    if (user.email === email) {
      return user
    }
  }
  return null
}

function resetDailyGenerations(user) {
  const today = new Date().toDateString()
  if (user.lastGenerationReset !== today) {
    user.generationsLeft = user.isPremium ? Number.POSITIVE_INFINITY : 3
    user.lastGenerationReset = today
    users.set(user.id, user)
  }
}

// Video processing functions
async function applyWatermark(inputPath, outputPath, watermarkText = "SmileX AI") {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters([
        {
          filter: "drawtext",
          options: {
            text: watermarkText,
            fontsize: 24,
            fontcolor: "white",
            x: "w-tw-10",
            y: "h-th-10",
            box: 1,
            boxcolor: "black@0.8",
            boxborderw: 5,
          },
        },
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run()
  })
}

async function generateSampleVideo(prompt, style, duration, quality = "1080p") {
  // Simulate video generation with sample videos
  const sampleVideos = [
    "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  ]

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, duration * 1000))

  return {
    videoUrl: sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
    thumbnail: `https://picsum.photos/320/180?random=${Date.now()}`,
    processingTime: duration * 1000,
    quality: quality,
  }
}

// Routes

// Authentication routes
app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" })
    }

    // Check if user exists
    if (getUserByEmail(email)) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Create user
    const user = createUser(email, password, name)

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    res.json({
      user: { ...userWithoutPassword, token },
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const user = getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Reset daily generations if needed
    resetDailyGenerations(user)

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    res.json({
      user: { ...userWithoutPassword, token },
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// AI routes
app.post("/api/ai/analyze-image", authenticateToken, async (req, res) => {
  try {
    const { imageData } = req.body

    if (!imageData) {
      return res.status(400).json({ error: "Image data is required" })
    }

    // Extract base64 data
    const base64Data = imageData.split(",")[1]
    if (!base64Data) {
      return res.status(400).json({ error: "Invalid image data format" })
    }

    // Analyze with OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and provide a detailed, cinematic description perfect for AI video generation. Focus on visual elements, mood, lighting, composition, colors, movements, and atmosphere. Be creative and descriptive, using professional cinematography terms. Keep it under 200 words but make it vivid and engaging for video creation.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    })

    const analysis = response.choices[0]?.message?.content || "Unable to analyze image"

    res.json({ analysis })
  } catch (error) {
    console.error("Image analysis error:", error)
    res.status(500).json({ error: "Image analysis failed" })
  }
})

app.post("/api/ai/enhance-prompt", authenticateToken, async (req, res) => {
  try {
    const { prompt, style, duration } = req.body

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    // Content moderation
    const violations = moderateContent(prompt)
    if (violations.length > 0) {
      return res.status(400).json({
        error: "Content policy violation detected",
        violations,
      })
    }

    // OpenAI moderation
    const moderation = await checkOpenAIModerationAPI(prompt)
    if (moderation.flagged) {
      return res.status(400).json({
        error: "Content flagged by AI moderation system",
      })
    }

    // Enhance prompt with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating detailed video generation prompts. Enhance the user's prompt to be more specific and cinematic, considering the style (${style}) and duration (${duration}s). Focus on visual details, camera movements, lighting, atmosphere, and specific cinematography techniques. Keep the enhanced prompt under 300 words but make it vivid and specific for AI video generation.`,
        },
        {
          role: "user",
          content: `Enhance this video prompt for ${style} style, ${duration} seconds duration: "${prompt}"`,
        },
      ],
      max_tokens: 400,
      temperature: 0.8,
    })

    const enhancedPrompt = response.choices[0]?.message?.content || prompt

    res.json({ enhancedPrompt })
  } catch (error) {
    console.error("Prompt enhancement error:", error)
    res.status(500).json({ error: "Prompt enhancement failed" })
  }
})

app.post("/api/ai/generate-video", authenticateToken, generationLimiter, async (req, res) => {
  try {
    const { prompt, imagePrompt, style, duration, enhancedPrompt } = req.body
    const userId = req.user.userId

    // Get user
    const user = users.get(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Reset daily generations if needed
    resetDailyGenerations(user)

    // Check user limits
    if (!user.isPremium && user.generationsLeft <= 0) {
      return res.status(403).json({ error: "Generation limit exceeded" })
    }

    // Check premium requirements
    if (duration > 30 && !user.isPremium) {
      return res.status(403).json({ error: "Premium subscription required for longer videos" })
    }

    const combinedPrompt = enhancedPrompt || prompt || imagePrompt

    // Content moderation
    const violations = moderateContent(combinedPrompt)
    if (violations.length > 0) {
      return res.status(400).json({
        error: "Content policy violation detected",
        violations,
      })
    }

    // OpenAI moderation
    const moderation = await checkOpenAIModerationAPI(combinedPrompt)
    if (moderation.flagged) {
      return res.status(400).json({
        error: "Content flagged by AI moderation system",
      })
    }

    // Generate video (simulated)
    const quality = user.isPremium ? "4K" : "1080p"
    const videoResult = await generateSampleVideo(combinedPrompt, style, duration, quality)

    // Create video record
    const videoId = uuidv4()
    const videoRecord = {
      id: videoId,
      userId: userId,
      prompt: combinedPrompt,
      style: style,
      duration: duration,
      quality: quality,
      videoUrl: videoResult.videoUrl,
      thumbnail: videoResult.thumbnail,
      hasWatermark: !user.isPremium,
      createdAt: new Date().toISOString(),
      processingTime: videoResult.processingTime,
    }

    videos.set(videoId, videoRecord)

    // Update user
    if (!user.isPremium) {
      user.generationsLeft = Math.max(0, user.generationsLeft - 1)
    }

    user.generationHistory.unshift(videoRecord)
    user.generationHistory = user.generationHistory.slice(0, 50) // Keep last 50

    users.set(userId, user)

    res.json(videoResult)
  } catch (error) {
    console.error("Video generation error:", error)
    res.status(500).json({ error: "Video generation failed" })
  }
})

// Video routes
app.post("/api/videos/download", authenticateToken, async (req, res) => {
  try {
    const { videoId, quality } = req.body
    const userId = req.user.userId

    // Get video
    const video = videos.get(videoId)
    if (!video || video.userId !== userId) {
      return res.status(404).json({ error: "Video not found" })
    }

    // Get user
    const user = users.get(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // For premium users, provide direct download
    // For free users, apply watermark
    let downloadUrl = video.videoUrl

    if (!user.isPremium && !video.hasWatermark) {
      // Apply watermark (simulated)
      downloadUrl = video.videoUrl + "?watermark=true"
    }

    res.json({ downloadUrl })
  } catch (error) {
    console.error("Download error:", error)
    res.status(500).json({ error: "Download preparation failed" })
  }
})

// User routes
app.post("/api/user/favorites", authenticateToken, async (req, res) => {
  try {
    const { videoId } = req.body
    const userId = req.user.userId

    // Get user
    const user = users.get(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Get video
    const video = videos.get(videoId)
    if (!video || video.userId !== userId) {
      return res.status(404).json({ error: "Video not found" })
    }

    // Add to favorites
    if (!user.favorites.includes(videoId)) {
      user.favorites.push(videoId)
      users.set(userId, user)
    }

    res.json({ message: "Video added to favorites" })
  } catch (error) {
    console.error("Favorites error:", error)
    res.status(500).json({ error: "Failed to add to favorites" })
  }
})

// Payment routes (simulated)
app.post("/api/payments/create-subscription", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Simulate payment URL generation
    const paymentUrl = `https://payment-processor.example.com/subscribe?user=${userId}&plan=premium`

    res.json({ paymentUrl })
  } catch (error) {
    console.error("Payment error:", error)
    res.status(500).json({ error: "Payment processing failed" })
  }
})

// Webhook for payment confirmation (simulated)
app.post("/api/payments/webhook", async (req, res) => {
  try {
    const { userId, subscriptionId, status } = req.body

    if (status === "active") {
      const user = users.get(userId)
      if (user) {
        user.isPremium = true
        user.subscriptionId = subscriptionId
        user.subscriptionDate = new Date().toISOString()
        user.generationsLeft = Number.POSITIVE_INFINITY
        users.set(userId, user)
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" })
})

// Start server
app.listen(PORT, () => {
  console.log(`SmileX AI Server running on port ${PORT}`)
  console.log("Features: OpenAI Integration, Content Moderation, User Authentication, Video Processing")
  console.log("Security: Rate Limiting, Content Filtering, JWT Authentication, Helmet Protection")
})

module.exports = app

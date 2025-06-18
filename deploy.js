#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs").promises

async function deploy() {
  console.log("🚀 Deploying SmileX AI Video Generator...\n")

  try {
    // Security checks
    console.log("🔒 Running security checks...")

    // Check for sensitive files
    const sensitiveFiles = [".env", "private.key", "certificate.crt"]
    for (const file of sensitiveFiles) {
      try {
        await fs.access(file)
        console.log(`⚠️  Found sensitive file: ${file}`)
      } catch {
        // File doesn't exist, which is good for some files
      }
    }

    // Run security audit
    console.log("📊 Running npm audit...")
    try {
      execSync("npm audit --audit-level moderate", { stdio: "inherit" })
      console.log("✅ Security audit passed")
    } catch (error) {
      console.log("⚠️  Security vulnerabilities found, please review")
    }

    // Run tests
    console.log("🧪 Running tests...")
    try {
      execSync("npm test", { stdio: "inherit" })
      console.log("✅ All tests passed")
    } catch (error) {
      console.error("❌ Tests failed, aborting deployment")
      process.exit(1)
    }

    // Build application
    console.log("🔨 Building application...")
    execSync("npm run build", { stdio: "inherit" })
    console.log("✅ Build completed")

    // Docker deployment
    console.log("🐳 Building Docker images...")
    execSync("docker-compose build", { stdio: "inherit" })
    console.log("✅ Docker images built")

    console.log("🚀 Starting services...")
    execSync("docker-compose up -d", { stdio: "inherit" })
    console.log("✅ Services started")

    // Health check
    console.log("🏥 Performing health check...")
    await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

    try {
      execSync("curl -f http://localhost:3000/api/health", { stdio: "pipe" })
      console.log("✅ Health check passed")
    } catch (error) {
      console.error("❌ Health check failed")
      process.exit(1)
    }

    console.log("\n🎉 Deployment completed successfully!")
    console.log("🌐 Application is running at: http://localhost:3000")
    console.log("📊 Monitor logs with: docker-compose logs -f")
    console.log("🛑 Stop services with: docker-compose down")
  } catch (error) {
    console.error("❌ Deployment failed:", error.message)
    process.exit(1)
  }
}

deploy()

#!/usr/bin/env node

/**
 * Production Build Script for Next.js Portfolio
 * Cross-platform Node.js version for building and packaging production releases
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load dotenv to read .env.production file
try {
  require("dotenv").config({
    path: path.join(process.cwd(), ".env.production"),
  });
} catch (error) {
  // dotenv is optional, continue without it
}

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: "inherit",
      encoding: "utf8",
      ...options,
    });
  } catch (error) {
    log(`Error executing: ${command}`, "red");
    throw error;
  }
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
}

// Main build function
async function buildProduction() {
  const PROJECT_NAME = "mahbub-portfolio";
  const BUILD_DIR = ".next";
  const DIST_DIR = "dist";
  const ZIP_NAME = `${PROJECT_NAME}-production-${getTimestamp()}.zip`;
  const ROOT_DIR = process.cwd();

  // Deployment Configuration (set DEPLOY=true to enable automatic deployment)
  const DEPLOY = process.env.DEPLOY === "true" || process.env.DEPLOY === "1";
  const SSH_KEY =
    process.env.SSH_KEY || "/Users/mahbub/.ssh/ssh-key-2025-02-17.key";
  const SERVER_USER = process.env.SERVER_USER || "ubuntu";
  const SERVER_HOST = process.env.SERVER_HOST || "144.24.142.36";
  const SERVER_PATH = process.env.SERVER_PATH || "/var/www/html/Portfolio";

  try {
    log("\n🚀 Starting Production Build Process...\n", "green");

    // Step 1: Clean previous builds
    log("📦 Step 1: Cleaning previous builds...", "yellow");
    removeDir(BUILD_DIR);
    removeDir(DIST_DIR);

    // Remove old zip files
    const files = fs.readdirSync(ROOT_DIR);
    files.forEach((file) => {
      if (
        file.startsWith(`${PROJECT_NAME}-production-`) &&
        file.endsWith(".zip")
      ) {
        fs.unlinkSync(path.join(ROOT_DIR, file));
      }
    });

    // Optional: Clean node_modules if CLEAN_NODE_MODULES is set
    const cleanNodeModules =
      process.env.CLEAN_NODE_MODULES === "true" ||
      process.env.CLEAN_NODE_MODULES === "1";
    if (cleanNodeModules) {
      log("   Cleaning node_modules for fresh install...", "yellow");
      const nodeModulesPath = path.join(ROOT_DIR, "node_modules");
      if (fs.existsSync(nodeModulesPath)) {
        removeDir(nodeModulesPath);
      }
    }

    log("✅ Cleanup complete\n", "green");

    // Step 2: Load production environment variables
    log("📦 Step 2: Loading production environment variables...", "yellow");
    const envProdPath = path.join(ROOT_DIR, ".env.production");
    if (fs.existsSync(envProdPath)) {
      try {
        require("dotenv").config({ path: envProdPath });
        log("✅ Loaded .env.production", "green");
      } catch (error) {
        log("⚠️  Failed to load .env.production: " + error.message, "yellow");
      }
    } else {
      log("⚠️  .env.production not found, continuing without it", "yellow");
    }

    // Set NODE_ENV to production for the build
    process.env.NODE_ENV = "production";
    log("✅ Environment configured for production\n", "green");

    // Step 3: Install dependencies (including devDependencies needed for build)
    log(
      "📦 Step 3: Installing dependencies (including devDependencies for build)...",
      "yellow"
    );
    const hasYarn = fs.existsSync(path.join(ROOT_DIR, "yarn.lock"));
    if (hasYarn) {
      exec("yarn install --frozen-lockfile --production=false");
    } else {
      exec("npm ci");
    }
    log("✅ Dependencies installed\n", "green");

    // Step 4: Build Next.js application
    log("🔨 Step 4: Building Next.js application...", "yellow");
    if (hasYarn) {
      exec("yarn build");
    } else {
      exec("npm run build");
    }

    // Check if build was successful
    if (!fs.existsSync(BUILD_DIR)) {
      throw new Error(`Build failed: ${BUILD_DIR} directory not found`);
    }

    // Check if standalone build exists
    const standalonePath = path.join(BUILD_DIR, "standalone");
    if (!fs.existsSync(standalonePath)) {
      throw new Error(
        'Build failed: Standalone output not found. Make sure next.config.js has "output: standalone"'
      );
    }

    log("✅ Build successful\n", "green");

    // Step 4: Create distribution directory
    log("📁 Step 4: Preparing distribution package...", "yellow");
    fs.mkdirSync(DIST_DIR, { recursive: true });

    // Copy standalone build
    const standaloneDest = path.join(DIST_DIR);
    copyDir(standalonePath, standaloneDest);

    // Copy static files (required for standalone mode)
    const staticSrc = path.join(BUILD_DIR, "static");
    const staticDest = path.join(DIST_DIR, ".next", "static");
    if (fs.existsSync(staticSrc)) {
      copyDir(staticSrc, staticDest);
    }

    // Copy public directory (required for static assets)
    const publicSrc = path.join(ROOT_DIR, "public");
    if (fs.existsSync(publicSrc)) {
      log("   Copying public folder...", "yellow");
      copyDir(publicSrc, path.join(DIST_DIR, "public"));
      log("   ✅ Public folder copied", "green");
    } else {
      log("⚠️  Public directory not found", "yellow");
    }

    // Copy necessary files for production
    copyFile(
      path.join(ROOT_DIR, "package.json"),
      path.join(DIST_DIR, "package.json")
    );

    if (
      !copyFile(
        path.join(ROOT_DIR, "ecosystem.config.js"),
        path.join(DIST_DIR, "ecosystem.config.js")
      )
    ) {
      log("⚠️  ecosystem.config.js not found, skipping...", "yellow");
    }

    // Copy scripts directory (includes seeder file for production)
    const scriptsSrc = path.join(ROOT_DIR, "scripts");
    if (fs.existsSync(scriptsSrc)) {
      log("   Copying scripts directory (including seeder)...", "yellow");
      copyDir(scriptsSrc, path.join(DIST_DIR, "scripts"));
      const seederPath = path.join(ROOT_DIR, "scripts", "seedProjects.js");
      if (fs.existsSync(seederPath)) {
        log("   ✅ Seeder file (seedProjects.js) included", "green");
      }
    } else {
      log("⚠️  Scripts directory not found", "yellow");
    }

    // Copy environment files
    const envProdFilePath = path.join(ROOT_DIR, ".env.production");
    if (fs.existsSync(envProdFilePath)) {
      log("   Copying .env.production as .env...", "yellow");
      copyFile(envProdFilePath, path.join(DIST_DIR, ".env"));
      log("   ✅ Production environment file copied", "green");
    } else {
      log("⚠️  .env.production not found", "yellow");
      // Copy example file as fallback
      if (
        copyFile(
          path.join(ROOT_DIR, "env.prod.example"),
          path.join(DIST_DIR, ".env.example")
        )
      ) {
        log("   Copied env.prod.example as .env.example", "yellow");
      }
    }

    // Copy yarn.lock if exists
    if (hasYarn) {
      copyFile(
        path.join(ROOT_DIR, "yarn.lock"),
        path.join(DIST_DIR, "yarn.lock")
      );
    } else {
      copyFile(
        path.join(ROOT_DIR, "package-lock.json"),
        path.join(DIST_DIR, "package-lock.json")
      );
    }

    // Create deployment README
    const readmeContent = `# Production Deployment Instructions

## Prerequisites
- Node.js (v18 or higher recommended)
- Yarn or npm package manager
- PM2 (for process management) - Install with: npm install -g pm2

## Setup Steps

1. **Extract the zip file**
   \`\`\`bash
   unzip ${ZIP_NAME}
   cd ${PROJECT_NAME}-production-*/
   \`\`\`

2. **Configure environment variables**
   \`\`\`bash
   cp .env .env.backup || true  # Backup if exists
   cp .env.example .env 2>/dev/null || true
   # Edit .env with your production values (MONGODB_URI, etc.)
   \`\`\`
   **Important:** Make sure \`.env\` file exists and contains \`MONGODB_URI\` before running the seeder.

3. **Install ALL dependencies (required for seeder and build)**
   \`\`\`bash
   yarn install --frozen-lockfile --production=false
   \`\`\`
   or
   \`\`\`bash
   npm ci --production=false
   \`\`\`
   **Note:** Do NOT use \`--production\` flag. The seeder requires dependencies like \`dotenv\` and \`mongoose\`.

4. **Run database seeder (recommended for initial setup)**
   \`\`\`bash
   node scripts/seedProjects.js
   \`\`\`
   or
   \`\`\`bash
   yarn seed
   \`\`\`
   Note: The seeder file is included in the zip package at \`scripts/seedProjects.js\`
   **Make sure dependencies are installed before running the seeder.**

5. **Start the application**

   **Option A: Using PM2 (Recommended)**
   \`\`\`bash
   pm2 start ecosystem.config.js
   pm2 save
   \`\`\`

   **Option B: Using npm/yarn**
   \`\`\`bash
   yarn start
   \`\`\`
   or
   \`\`\`bash
   npm start
   \`\`\`

6. **Verify deployment**
   - Check if the application is running on the configured port
   - Monitor logs: \`pm2 logs\` or check console output

## File Structure
- \`.next/\` - Next.js build output
- \`public/\` - Static assets
- \`scripts/\` - Utility scripts (seeders, etc.)
- \`package.json\` - Project dependencies
- \`ecosystem.config.js\` - PM2 configuration

## Notes
- The standalone build includes all necessary server files
- Static assets are in \`.next/static/\`
- Public assets are in \`public/\`
- Environment variables must be configured in \`.env\`

## Troubleshooting
- Ensure all environment variables are set correctly
- Check Node.js version compatibility
- Verify MongoDB connection (if applicable)
- Review PM2 logs for errors: \`pm2 logs\`
`;

    fs.writeFileSync(path.join(DIST_DIR, "DEPLOYMENT.md"), readmeContent);

    log("✅ Distribution package prepared\n", "green");

    // Step 6: Create zip file
    log("📦 Step 6: Creating zip archive...", "yellow");

    // Use native zip command (works on macOS and Linux)
    // For Windows, you might need 7zip or other tools
    const isWindows = process.platform === "win32";

    if (isWindows) {
      // Try using PowerShell Compress-Archive or suggest manual zipping
      log(
        "⚠️  Windows detected. Please manually zip the dist folder or install 7zip.",
        "yellow"
      );
      log(`   Folder to zip: ${path.resolve(DIST_DIR)}`, "blue");
      log(`   Suggested zip name: ${ZIP_NAME}\n`, "blue");
    } else {
      // Use zip command for Unix-like systems
      const distPath = path.resolve(DIST_DIR);
      exec(`cd "${distPath}" && zip -r "../${ZIP_NAME}" . -q`);

      // Get zip file size
      const stats = fs.statSync(path.join(ROOT_DIR, ZIP_NAME));
      const zipSize = (stats.size / 1024 / 1024).toFixed(2) + " MB";
      log(`✅ Zip file created: ${ZIP_NAME} (${zipSize})\n`, "green");
    }

    // Step 7: Optional deployment to server
    if (DEPLOY) {
      log("🚀 Step 7: Deploying to server...", "yellow");

      // Check if SSH key exists
      if (!fs.existsSync(SSH_KEY)) {
        log(`❌ SSH key not found: ${SSH_KEY}`, "red");
        log(
          "⚠️  Skipping deployment. Zip file is ready for manual deployment.\n",
          "yellow"
        );
      } else {
        // Test SSH connection
        log("   Testing SSH connection...", "yellow");
        try {
          exec(
            `ssh -i "${SSH_KEY}" -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" "echo 'Connection successful'"`,
            { stdio: "pipe" }
          );
          log("   ✅ SSH connection successful", "green");

          // Deploy zip file to server
          log("   Uploading zip file to server...", "yellow");
          exec(
            `sudo scp -i "${SSH_KEY}" "${path.join(
              ROOT_DIR,
              ZIP_NAME
            )}" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"`
          );

          log(
            `✅ Zip file deployed successfully to ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/`,
            "green"
          );
          log("   💡 SSH into server and extract the zip file:", "yellow");
          log(
            `      ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_HOST}`,
            "yellow"
          );
          log(`      cd ${SERVER_PATH} && unzip ${ZIP_NAME}\n`, "yellow");
        } catch (error) {
          log(
            "❌ SSH connection or deployment failed. Please check your SSH key and server connection.",
            "red"
          );
          log("⚠️  Zip file is ready for manual deployment.\n", "yellow");
        }
      }
    } else {
      log(
        "ℹ️  Deployment skipped. Set DEPLOY=true to enable automatic deployment.",
        "yellow"
      );
      log("   Example: DEPLOY=true yarn build:prod\n", "yellow");
    }

    // Step 8: Cleanup
    log("🧹 Step 8: Cleaning up temporary files...", "yellow");
    removeDir(DIST_DIR);
    log("✅ Cleanup complete\n", "green");

    // Final summary
    log("════════════════════════════════════════", "green");
    log("✨ Production Build Complete! ✨", "green");
    log("════════════════════════════════════════", "green");
    log(`📦 Zip file: ${ZIP_NAME}`, "green");
    if (!isWindows) {
      const stats = fs.statSync(path.join(ROOT_DIR, ZIP_NAME));
      const zipSize = (stats.size / 1024 / 1024).toFixed(2) + " MB";
      log(`📊 Size: ${zipSize}`, "green");
    }
    log(`\n📍 Location: ${path.resolve(ROOT_DIR, ZIP_NAME)}`, "yellow");

    if (DEPLOY) {
      log("\n🚀 Deployment: Completed\n", "green");
    } else {
      log("\n✅ Ready for deployment!", "green");
      log("\n💡 To deploy automatically, run:", "yellow");
      log("   DEPLOY=true yarn build:prod\n", "yellow");
    }
  } catch (error) {
    log(`\n❌ Build failed: ${error.message}`, "red");
    process.exit(1);
  }
}

// Run the build
buildProduction();

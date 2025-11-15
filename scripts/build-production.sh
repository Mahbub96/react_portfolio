#!/bin/bash

# Production Build Script for Next.js Portfolio
# This script builds the project and creates a production-ready zip file

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mahbub-portfolio"
BUILD_DIR=".next"
DIST_DIR="dist"
ZIP_NAME="${PROJECT_NAME}-production-$(date +%Y%m%d-%H%M%S).zip"
TEMP_DIR=$(mktemp -d)

# Deployment Configuration (set DEPLOY=true to enable automatic deployment)
DEPLOY="${DEPLOY:-false}"
SSH_KEY="${SSH_KEY:-/Users/mahbub/.ssh/ssh-key-2025-02-17.key}"
SERVER_USER="${SERVER_USER:-ubuntu}"
SERVER_HOST="${SERVER_HOST:-144.24.142.36}"
SERVER_PATH="${SERVER_PATH:-/var/www/html/Portfolio}"

echo -e "${GREEN}🚀 Starting Production Build Process...${NC}\n"

# Step 1: Clean previous builds
echo -e "${YELLOW}📦 Step 1: Cleaning previous builds...${NC}"
rm -rf $BUILD_DIR
rm -rf $DIST_DIR
rm -f ${PROJECT_NAME}-production-*.zip

# Optional: Clean node_modules if CLEAN_NODE_MODULES is set
if [ "$CLEAN_NODE_MODULES" = "true" ] || [ "$CLEAN_NODE_MODULES" = "1" ]; then
    echo -e "${YELLOW}   Cleaning node_modules for fresh install...${NC}"
    rm -rf node_modules
fi

echo -e "${GREEN}✅ Cleanup complete${NC}\n"

# Step 2: Load production environment variables
echo -e "${YELLOW}📦 Step 2: Loading production environment variables...${NC}"
if [ -f ".env.production" ]; then
    # Source the .env.production file to load variables
    set -a
    source .env.production
    set +a
    echo -e "${GREEN}✅ Loaded .env.production${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production not found, continuing without it${NC}"
fi

# Set NODE_ENV to production for the build
export NODE_ENV=production
echo -e "${GREEN}✅ Environment configured for production${NC}\n"

# Step 3: Install dependencies (including devDependencies needed for build)
echo -e "${YELLOW}📦 Step 3: Installing dependencies (including devDependencies for build)...${NC}"
if [ -f "yarn.lock" ]; then
    yarn install --frozen-lockfile --production=false
else
    npm ci
fi
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Step 4: Build Next.js application
echo -e "${YELLOW}🔨 Step 4: Building Next.js application...${NC}"
if [ -f "yarn.lock" ]; then
    yarn build
else
    npm run build
fi

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed: $BUILD_DIR directory not found${NC}"
    exit 1
fi

# Check if standalone build exists
if [ ! -d "$BUILD_DIR/standalone" ]; then
    echo -e "${RED}❌ Build failed: Standalone output not found. Make sure next.config.js has 'output: standalone'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}\n"

# Step 4: Create distribution directory
echo -e "${YELLOW}📁 Step 4: Preparing distribution package...${NC}"
mkdir -p $DIST_DIR

# Copy standalone build
cp -r $BUILD_DIR/standalone/* $DIST_DIR/

# Copy static files (required for standalone mode)
mkdir -p $DIST_DIR/.next/static
cp -r $BUILD_DIR/static/* $DIST_DIR/.next/static/ 2>/dev/null || true

# Copy public directory (required for static assets)
if [ -d "public" ]; then
    echo -e "${YELLOW}   Copying public folder...${NC}"
    cp -r public $DIST_DIR/
    echo -e "${GREEN}   ✅ Public folder copied${NC}"
else
    echo -e "${YELLOW}⚠️  Public directory not found${NC}"
fi

# Copy necessary files for production
cp package.json $DIST_DIR/
cp ecosystem.config.js $DIST_DIR/ 2>/dev/null || echo -e "${YELLOW}⚠️  ecosystem.config.js not found, skipping...${NC}"

# Copy scripts directory (includes seeder file for production)
if [ -d "scripts" ]; then
    echo -e "${YELLOW}   Copying scripts directory (including seeder)...${NC}"
    cp -r scripts $DIST_DIR/
    if [ -f "scripts/seedProjects.js" ]; then
        echo -e "${GREEN}   ✅ Seeder file (seedProjects.js) included${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Scripts directory not found${NC}"
fi

# Copy environment files
if [ -f ".env.production" ]; then
    echo -e "${YELLOW}   Copying .env.production as .env...${NC}"
    cp .env.production $DIST_DIR/.env
    echo -e "${GREEN}   ✅ Production environment file copied${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production not found${NC}"
    # Copy example file as fallback
    if [ -f "env.prod.example" ]; then
        cp env.prod.example $DIST_DIR/.env.example
        echo -e "${YELLOW}   Copied env.prod.example as .env.example${NC}"
    fi
fi

# Copy yarn.lock if exists (for production dependency resolution)
if [ -f "yarn.lock" ]; then
    cp yarn.lock $DIST_DIR/
fi

# Create a README for deployment instructions
cat > $DIST_DIR/DEPLOYMENT.md << EOF
# Production Deployment Instructions

## Prerequisites
- Node.js (v18 or higher recommended)
- Yarn or npm package manager
- PM2 (for process management) - Install with: npm install -g pm2

## Setup Steps

1. **Extract the zip file**
   \`\`\`
   unzip ${ZIP_NAME}
   cd ${PROJECT_NAME}-production-*/
   \`\`\`

2. **Configure environment variables**
   \`\`\`
   cp .env .env.backup || true  # Backup if exists
   cp .env.example .env 2>/dev/null || true
   # Edit .env with your production values (MONGODB_URI, etc.)
   \`\`\`
   **Important:** Make sure \`.env\` file exists and contains \`MONGODB_URI\` before running the seeder.

3. **Install ALL dependencies (required for seeder and build)**
   \`\`\`
   yarn install --frozen-lockfile --production=false
   \`\`\`
   or
   \`\`\`
   npm ci --production=false
   \`\`\`
   **Note:** Do NOT use \`--production\` flag. The seeder requires dependencies like \`dotenv\` and \`mongoose\`.

4. **Run database seeder (recommended for initial setup)**
   \`\`\`
   node scripts/seedProjects.js
   \`\`\`
   or
   \`\`\`
   yarn seed
   \`\`\`
   Note: The seeder file is included in the zip package at \`scripts/seedProjects.js\`
   **Make sure dependencies are installed before running the seeder.**

5. **Start the application**

   **Option A: Using PM2 (Recommended)**
   \`\`\`
   pm2 start ecosystem.config.js
   pm2 save
   \`\`\`

   **Option B: Using npm/yarn**
   \`\`\`
   yarn start
   \`\`\`
   or
   \`\`\`
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
EOF

echo -e "${GREEN}✅ Distribution package prepared${NC}\n"

# Step 6: Create zip file
echo -e "${YELLOW}📦 Step 6: Creating zip archive...${NC}"
cd $DIST_DIR
zip -r ../$ZIP_NAME . -q
cd ..

# Get zip file size
ZIP_SIZE=$(du -h $ZIP_NAME | cut -f1)
echo -e "${GREEN}✅ Zip file created: ${ZIP_NAME} (${ZIP_SIZE})${NC}\n"

# Step 7: Optional deployment to server
if [ "$DEPLOY" = "true" ] || [ "$DEPLOY" = "1" ]; then
    echo -e "${YELLOW}🚀 Step 7: Deploying to server...${NC}"
    
    # Check if SSH key exists
    if [ ! -f "$SSH_KEY" ]; then
        echo -e "${RED}❌ SSH key not found: $SSH_KEY${NC}"
        echo -e "${YELLOW}⚠️  Skipping deployment. Zip file is ready for manual deployment.${NC}\n"
    else
        # Test SSH connection
        echo -e "${YELLOW}   Testing SSH connection...${NC}"
        if ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" "echo 'Connection successful'" > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ SSH connection successful${NC}"
            
            # Deploy zip file to server
            echo -e "${YELLOW}   Uploading zip file to server...${NC}"
            sudo scp -i "$SSH_KEY" "$ZIP_NAME" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Zip file deployed successfully to ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/${NC}"
                echo -e "${YELLOW}   💡 SSH into server and extract the zip file:${NC}"
                echo -e "${YELLOW}      ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST${NC}"
                echo -e "${YELLOW}      cd $SERVER_PATH && unzip $ZIP_NAME${NC}\n"
            else
                echo -e "${RED}❌ Deployment failed${NC}\n"
            fi
        else
            echo -e "${RED}❌ SSH connection failed. Please check your SSH key and server connection.${NC}"
            echo -e "${YELLOW}⚠️  Zip file is ready for manual deployment.${NC}\n"
        fi
    fi
else
    echo -e "${YELLOW}ℹ️  Deployment skipped. Set DEPLOY=true to enable automatic deployment.${NC}"
    echo -e "${YELLOW}   Example: ${GREEN}DEPLOY=true yarn build:prod${NC}\n"
fi

# Step 8: Cleanup
echo -e "${YELLOW}🧹 Step 8: Cleaning up temporary files...${NC}"
rm -rf $DIST_DIR
echo -e "${GREEN}✅ Cleanup complete${NC}\n"

# Final summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Production Build Complete! ✨${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "📦 Zip file: ${GREEN}${ZIP_NAME}${NC}"
echo -e "📊 Size: ${GREEN}${ZIP_SIZE}${NC}"
echo -e "\n${YELLOW}📍 Location: $(pwd)/${ZIP_NAME}${NC}\n"

if [ "$DEPLOY" = "true" ] || [ "$DEPLOY" = "1" ]; then
    echo -e "${GREEN}🚀 Deployment: ${YELLOW}Completed${NC}\n"
else
    echo -e "${GREEN}✅ Ready for deployment!${NC}\n"
    echo -e "${YELLOW}💡 To deploy automatically, run:${NC}"
    echo -e "${YELLOW}   DEPLOY=true yarn build:prod${NC}\n"
fi


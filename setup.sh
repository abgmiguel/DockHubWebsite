#!/bin/bash

# Setup script for the project
# Installs dependencies in both root and astro-multi-tenant directories

set -e

echo "🚀 Setting up Coders in Flow Project"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm is not installed. Please install Node.js first.${NC}"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "astro-multi-tenant" ]; then
    echo -e "${YELLOW}⚠️  Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing root dependencies...${NC}"
echo "   This includes build scripts and shared tools"
npm install
echo -e "${GREEN}✅ Root dependencies installed${NC}"
echo ""

echo -e "${BLUE}📦 Installing astro-multi-tenant dependencies...${NC}"
echo "   This includes Astro, React, Tailwind, and all app dependencies"
cd astro-multi-tenant
npm install
cd ..
echo -e "${GREEN}✅ Astro dependencies installed${NC}"
echo ""

# Check for Go (needed for backend)
if command -v go &> /dev/null; then
    GO_VERSION=$(go version | awk '{print $3}')
    echo -e "${GREEN}✅ Go is installed: $GO_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Go is not installed (needed for backend)${NC}"
    echo "   To install on macOS: brew install go"
    echo "   To install on Linux: sudo apt install golang"
    echo ""
fi

# Check for Docker (needed for MongoDB)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
else
    echo -e "${YELLOW}⚠️  Docker is not installed (needed for MongoDB)${NC}"
    echo "   Visit: https://www.docker.com/get-started"
    echo ""
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creating .env file from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file (please configure it)${NC}"
    else
        # Create a basic .env file
        cat > .env << 'EOF'
# Environment Configuration
NODE_ENV=development
PORT=4321
API_PORT=3001

# API Configuration  
PUBLIC_API_URL=http://localhost:3001
PUBLIC_DEV_API_PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/codersblog
MONGODB_PORT=27017

# Site Configuration
PUBLIC_SITE_URL=http://localhost:4321
EOF
        echo -e "${GREEN}✅ Created default .env file${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review and update .env file if needed"
echo "  2. Run ${BLUE}./scripts/dev.sh${NC} to start the development environment"
echo ""
echo "Available commands:"
echo "  ${BLUE}./scripts/dev.sh${NC}         - Start all services (MongoDB, Backend, Frontend)"
echo "  ${BLUE}./scripts/push-both.sh${NC}   - Push to both GitLab and GitHub"
echo "  ${BLUE}npm run build${NC}            - Build for production"
echo ""
echo "Access the sites:"
echo "  • Dashboard: http://localhost:4321"
echo "  • Coders in Flow: http://codersinflow.localhost:4321"
echo "  • Dark Flows: http://darkflows.localhost:4321"
echo ""
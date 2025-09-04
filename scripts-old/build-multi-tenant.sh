#!/bin/bash

# Build script for multi-tenant setup

echo "🚀 Building Multi-Tenant Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building frontend sites...${NC}"

# Build codersinflow.com
if [ -d "frontends/codersinflow.com" ]; then
    echo "Building codersinflow.com..."
    cd frontends/codersinflow.com
    npm install
    npm run build
    cd ../..
    echo -e "${GREEN}✓ codersinflow.com built${NC}"
else
    echo -e "${RED}❌ frontends/codersinflow.com not found${NC}"
fi

# Build darkflows.com
if [ -d "frontends/darkflows.com" ]; then
    echo "Building darkflows.com..."
    cd frontends/darkflows.com
    npm install
    npm run build
    cd ../..
    echo -e "${GREEN}✓ darkflows.com built${NC}"
else
    echo -e "${RED}❌ frontends/darkflows.com not found${NC}"
fi

echo -e "${YELLOW}🐳 Building Docker container...${NC}"

# Build the multi-tenant Docker image
docker build -f Dockerfile.multi-tenant -t multi-site-app:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Multi-tenant container built successfully!${NC}"
    echo ""
    echo "To run the container:"
    echo "  docker-compose -f docker-compose.multi-tenant.yml up"
    echo ""
    echo "To test different sites:"
    echo "  - Add to /etc/hosts:"
    echo "    127.0.0.1  codersinflow.local"
    echo "    127.0.0.1  darkflows.local"
    echo "  - Visit http://codersinflow.local"
    echo "  - Visit http://darkflows.local"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi
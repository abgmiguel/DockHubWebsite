#!/bin/bash

# Local development script for specific sites
# Usage: ./dev-site.sh <domain> [port]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <domain> [port]${NC}"
    echo ""
    echo "Examples:"
    echo "  $0 codersinflow.com        # Test codersinflow.com on port 4321"
    echo "  $0 darkflows.com 4322      # Test darkflows.com on port 4322"
    echo ""
    echo "Available sites:"
    if [ -f sites-config.json ]; then
        jq -r 'keys[]' sites-config.json 2>/dev/null | sed 's/^/  - /'
    fi
    exit 1
fi

DOMAIN="$1"
PORT="${2:-4321}"
FRONTEND_DIR="frontends/${DOMAIN}"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Local Development for ${DOMAIN}${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if site exists in config
if [ ! -f sites-config.json ]; then
    echo -e "${RED}Error: sites-config.json not found${NC}"
    exit 1
fi

SITE_CONFIG=$(jq -r ".\"${DOMAIN}\"" sites-config.json 2>/dev/null)
if [ "$SITE_CONFIG" == "null" ] || [ -z "$SITE_CONFIG" ]; then
    echo -e "${RED}Error: Site ${DOMAIN} not found in sites-config.json${NC}"
    echo ""
    echo "Available sites:"
    jq -r 'keys[]' sites-config.json | sed 's/^/  - /'
    exit 1
fi

# Extract site info
SITE_ID=$(echo "$SITE_CONFIG" | jq -r '.id')
DATABASE=$(echo "$SITE_CONFIG" | jq -r '.database')

echo "Site Configuration:"
echo "  Domain: ${DOMAIN}"
echo "  Site ID: ${SITE_ID}"
echo "  Database: ${DATABASE}"
echo "  Frontend: ${FRONTEND_DIR}"
echo "  Dev Port: ${PORT}"
echo ""

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${YELLOW}Warning: Frontend directory not found at ${FRONTEND_DIR}${NC}"
    echo "Creating from template..."
    
    # Copy from default or codersinflow template
    if [ -d "frontends/codersinflow.com" ]; then
        cp -r "frontends/codersinflow.com" "$FRONTEND_DIR"
        echo -e "${GREEN}✓ Created from codersinflow.com template${NC}"
    else
        echo -e "${RED}Error: No template found to create frontend${NC}"
        exit 1
    fi
fi

# Check if package.json exists
if [ ! -f "${FRONTEND_DIR}/package.json" ]; then
    echo -e "${RED}Error: package.json not found in ${FRONTEND_DIR}${NC}"
    exit 1
fi

# Start services
echo -e "${YELLOW}Starting services...${NC}"
echo ""

# 1. Check/Start MongoDB
echo -n "1. MongoDB... "
if docker ps | grep -q mongodb-dev; then
    echo -e "${GREEN}already running${NC}"
else
    echo "starting..."
    docker run -d --name mongodb-dev -p 27017:27017 mongo:7.0 --noauth > /dev/null 2>&1 || true
    echo -e "${GREEN}✓ started${NC}"
fi

# 2. Start Backend API (if not running)
echo -n "2. Backend API... "
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}already running on port 3001${NC}"
else
    echo "starting..."
    (
        cd backend
        CORS_ORIGIN="http://localhost:${PORT}" \
        MONGODB_URI="mongodb://localhost:27017/${DATABASE}" \
        PORT=3001 \
        go run cmd/server/main.go &
    ) > /dev/null 2>&1
    sleep 2
    echo -e "${GREEN}✓ started on port 3001${NC}"
fi

# 3. Start Frontend Dev Server
echo -n "3. Frontend Dev Server... "
echo ""
echo ""
echo -e "${CYAN}Starting Astro dev server for ${DOMAIN}...${NC}"

# Create hosts file reminder
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}LOCAL TESTING OPTIONS:${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${GREEN}Option 1: Test with localhost:${NC}"
echo "  Visit: http://localhost:${PORT}"
echo ""
echo -e "${GREEN}Option 2: Test with actual domain (recommended):${NC}"
echo "  1. Add to /etc/hosts:"
echo -e "     ${CYAN}127.0.0.1 ${DOMAIN}${NC}"
echo "  2. Visit: http://${DOMAIN}:${PORT}"
echo ""
echo -e "${GREEN}Option 3: Test with subdomain:${NC}"
echo "  1. Add to /etc/hosts:"
echo -e "     ${CYAN}127.0.0.1 local.${DOMAIN}${NC}"
echo "  2. Visit: http://local.${DOMAIN}:${PORT}"
echo ""
echo -e "${YELLOW}========================================${NC}"
echo ""

# Start the frontend with environment variables
cd "$FRONTEND_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Set environment variables for the site
export PUBLIC_API_URL="http://localhost:3001"
export PUBLIC_SITE_NAME="${SITE_ID}"
export PUBLIC_SITE_DOMAIN="${DOMAIN}"
export HOST="0.0.0.0"
export PORT="${PORT}"

echo -e "${GREEN}Starting dev server on port ${PORT}...${NC}"
echo ""

# Run the dev server
npm run dev -- --port "${PORT}" --host
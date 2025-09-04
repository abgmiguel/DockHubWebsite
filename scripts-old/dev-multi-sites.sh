#!/bin/bash

# Run multiple sites locally for testing multi-tenant setup
# This simulates production environment locally

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Multi-Site Local Development${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Start MongoDB if not running
echo -n "Starting MongoDB... "
if docker ps | grep -q mongodb-dev; then
    echo -e "${GREEN}already running${NC}"
else
    docker run -d --name mongodb-dev -p 27017:27017 mongo:7.0 --noauth > /dev/null 2>&1 || true
    echo -e "${GREEN}✓${NC}"
fi

# Start backend API
echo -n "Starting Backend API... "
pkill -f "go run cmd/server/main.go" 2>/dev/null || true
(
    cd backend
    CORS_ORIGIN="http://localhost:4321,http://localhost:4322,http://localhost:4323" \
    ALLOWED_DOMAINS="localhost,codersinflow.com,darkflows.com" \
    MONGODB_URI="mongodb://localhost:27017" \
    PORT=3001 \
    go run cmd/server/main.go &
) > backend.log 2>&1
sleep 2
echo -e "${GREEN}✓ (port 3001)${NC}"

# Start multi-tenant proxy server
echo -n "Starting Multi-tenant Proxy... "
(
    cd /Users/prestongarrison/Source/codersinflow.com
    CONTAINER_PORT=3001 node docker/server.js &
) > proxy.log 2>&1
sleep 1
echo -e "${GREEN}✓ (port 8000)${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Services Running:${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  MongoDB:        localhost:27017"
echo "  Backend API:    localhost:3001"
echo "  Proxy Server:   localhost:8000"
echo ""
echo -e "${YELLOW}Testing Instructions:${NC}"
echo ""
echo "1. Add to /etc/hosts:"
echo "   127.0.0.1 codersinflow.local"
echo "   127.0.0.1 darkflows.local"
echo "   127.0.0.1 example.local"
echo ""
echo "2. Test sites:"
echo "   http://codersinflow.local:8000"
echo "   http://darkflows.local:8000"
echo "   http://example.local:8000"
echo ""
echo "3. The proxy will route based on Host header"
echo ""
echo -e "${CYAN}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep running and show logs
tail -f backend.log proxy.log
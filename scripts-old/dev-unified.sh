#!/bin/bash

# Unified SSR Development Script
# Starts the complete multi-tenant system with SSR

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Unified Multi-Tenant SSR Development${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 1. Check/Start MongoDB
echo -e "${YELLOW}1. Starting MongoDB...${NC}"
if docker ps | grep -q mongodb-dev; then
    echo -e "${GREEN}   ✓ MongoDB already running${NC}"
else
    docker run -d \
        --name mongodb-dev \
        -p 27017:27017 \
        mongo:7.0
    sleep 3
    echo -e "${GREEN}   ✓ MongoDB started${NC}"
fi

# 2. Start Backend
echo -e "${YELLOW}2. Starting Backend API...${NC}"
cd backend
MONGODB_URI="mongodb://127.0.0.1:27017/codersblog" go run cmd/server/main.go &
BACKEND_PID=$!
sleep 3
echo -e "${GREEN}   ✓ Backend running on port 3001${NC}"

# 3. Start Frontend SSR
echo -e "${YELLOW}3. Starting Frontend SSR...${NC}"
cd ../astro-multi-tenant
PUBLIC_API_URL=http://127.0.0.1:3001 npm run dev &
FRONTEND_PID=$!
sleep 3
echo -e "${GREEN}   ✓ Frontend running on port 4321${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}System Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Access sites at:"
echo "  • CodersInFlow: http://127.0.0.1:4321"
echo "  • Blog: http://127.0.0.1:4321/blog"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker stop mongodb-dev 2>/dev/null" EXIT
wait
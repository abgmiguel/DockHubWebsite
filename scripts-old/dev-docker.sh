#!/bin/bash

# Development Docker script - builds and runs multi-tenant container with watch mode
# This provides a complete local environment that mirrors production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="multi-tenant-dev"
IMAGE_NAME="multi-tenant:dev"
MONGODB_CONTAINER="mongodb-dev"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Multi-Tenant Docker Development${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Set trap for cleanup on exit
trap cleanup EXIT

# 1. Check if MongoDB is running
echo -e "${YELLOW}1. Checking MongoDB...${NC}"
if docker ps | grep -q ${MONGODB_CONTAINER}; then
    echo -e "${GREEN}   ✓ MongoDB already running${NC}"
else
    echo "   Starting MongoDB..."
    docker run -d \
        --name ${MONGODB_CONTAINER} \
        -p 27017:27017 \
        -v mongodb_data:/data/db \
        mongo:7.0 --noauth
    echo -e "${GREEN}   ✓ MongoDB started${NC}"
fi

# 2. Build all frontends
echo -e "${YELLOW}2. Building frontends...${NC}"
for dir in frontends/*/; do
    if [ -d "$dir" ]; then
        site=$(basename "$dir")
        echo -n "   Building ${site}... "
        
        # Check if package.json exists
        if [ -f "${dir}/package.json" ]; then
            (
                cd "$dir"
                # Install dependencies if needed
                if [ ! -d "node_modules" ]; then
                    npm ci --silent > /dev/null 2>&1
                fi
                # Build the site
                npm run build --silent > /dev/null 2>&1
            )
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${YELLOW}skipped (no package.json)${NC}"
        fi
    fi
done

# 3. Build Docker image
echo -e "${YELLOW}3. Building Docker image...${NC}"
docker build -f Dockerfile.multi-tenant -t ${IMAGE_NAME} . > /dev/null 2>&1
echo -e "${GREEN}   ✓ Image built${NC}"

# 4. Stop existing container if running
if docker ps | grep -q ${CONTAINER_NAME}; then
    echo -e "${YELLOW}4. Stopping existing container...${NC}"
    docker stop ${CONTAINER_NAME} > /dev/null 2>&1
    docker rm ${CONTAINER_NAME} > /dev/null 2>&1
    echo -e "${GREEN}   ✓ Stopped${NC}"
fi

# 5. Create docker-compose for development
echo -e "${YELLOW}5. Creating development docker-compose...${NC}"
cat > docker-compose.dev.yml << EOF
version: '3.8'

services:
  multi-tenant:
    image: ${IMAGE_NAME}
    container_name: ${CONTAINER_NAME}
    ports:
      - "8000:8000"  # Main web server
      - "3001:3001"  # Backend API
    environment:
      - ENV=development
      - MONGODB_URI=mongodb://host.docker.internal:27017
      - CORS_ORIGIN=http://localhost:8000,http://127.0.0.1:8000
      - ALLOWED_DOMAINS=localhost,127.0.0.1,codersinflow.local,darkflows.local
      - PORT=8000
      - API_PORT=3001
    volumes:
      # External data directories (persisted between runs)
      - ./data/mongodb:/data/db
      - ./data/uploads:/app/uploads
      - ./logs:/app/logs
      
      # Mount source for development (read-only to prevent container changes)
      - ./frontends:/app/frontends:ro
      - ./backend:/app/backend:ro
      - ./sites-config.json:/app/sites-config.json:ro
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    command: >
      sh -c "
        echo 'Starting development mode...' &&
        echo 'Data directories:' &&
        echo '  MongoDB: ./data/mongodb' &&
        echo '  Uploads: ./data/uploads' &&
        echo '  Logs:    ./logs' &&
        supervisord -c /etc/supervisor/conf.d/supervisord.conf
      "

networks:
  default:
    name: multi-tenant-dev
EOF

echo -e "${GREEN}   ✓ docker-compose.dev.yml created${NC}"

# 6. Start container with docker-compose
echo -e "${YELLOW}6. Starting container...${NC}"
docker-compose -f docker-compose.dev.yml up -d
echo -e "${GREEN}   ✓ Container started${NC}"

# 7. Wait for services to be ready
echo -e "${YELLOW}7. Waiting for services...${NC}"
echo -n "   "
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Services ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# 8. Setup hosts file reminder
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Development Environment Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Services running:${NC}"
echo "  • MongoDB:        localhost:27017"
echo "  • Backend API:    localhost:3001"
echo "  • Web Server:     localhost:8000"
echo ""
echo -e "${CYAN}Testing options:${NC}"
echo ""
echo "1. Direct access:"
echo "   http://localhost:8000"
echo ""
echo "2. Domain-based testing (recommended):"
echo "   Add to /etc/hosts:"
echo -e "   ${YELLOW}127.0.0.1 codersinflow.local darkflows.local${NC}"
echo ""
echo "   Then visit:"
echo "   • http://codersinflow.local:8000"
echo "   • http://darkflows.local:8000"
echo ""
echo -e "${CYAN}Available commands:${NC}"
echo "  • View logs:      docker logs -f ${CONTAINER_NAME}"
echo "  • Enter container: docker exec -it ${CONTAINER_NAME} bash"
echo "  • Stop:           docker-compose -f docker-compose.dev.yml down"
echo "  • Restart:        docker-compose -f docker-compose.dev.yml restart"
echo ""
echo -e "${YELLOW}Note: Frontend changes require rebuild. Run this script again.${NC}"
echo -e "${YELLOW}      Backend changes will auto-reload.${NC}"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop and cleanup${NC}"
echo ""

# 9. Follow logs
docker logs -f ${CONTAINER_NAME}
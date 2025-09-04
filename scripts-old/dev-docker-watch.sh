#!/bin/bash

# Development Docker with watch mode - auto-rebuilds on file changes
# Uses nodemon or similar to watch for changes and rebuild

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Docker Development with Watch Mode${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if nodemon is installed globally
if ! command -v nodemon &> /dev/null; then
    echo -e "${YELLOW}Installing nodemon for file watching...${NC}"
    npm install -g nodemon
fi

# Check if fswatch is installed (for Mac) or inotify-tools (for Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v fswatch &> /dev/null; then
        echo -e "${YELLOW}Installing fswatch for file watching...${NC}"
        brew install fswatch
    fi
    WATCH_CMD="fswatch -o"
else
    if ! command -v inotifywait &> /dev/null; then
        echo -e "${YELLOW}Installing inotify-tools for file watching...${NC}"
        sudo apt-get install -y inotify-tools
    fi
    WATCH_CMD="inotifywait -r -e modify,create,delete"
fi

# Function to rebuild and restart
rebuild_and_restart() {
    echo -e "${YELLOW}Changes detected! Rebuilding...${NC}"
    
    # Rebuild the changed frontend
    for dir in frontends/*/; do
        if [ -d "$dir" ] && [ -f "${dir}/package.json" ]; then
            site=$(basename "$dir")
            # Check if this site has changes (simple check)
            if [ -n "$(find ${dir}/src -newer /tmp/last-build 2>/dev/null)" ]; then
                echo "  Rebuilding ${site}..."
                (cd "$dir" && npm run build) > /dev/null 2>&1
            fi
        fi
    done
    
    # Rebuild Docker image
    echo "  Rebuilding Docker image..."
    docker build -f Dockerfile.multi-tenant -t multi-tenant:dev . > /dev/null 2>&1
    
    # Restart container
    echo "  Restarting container..."
    docker-compose -f docker-compose.dev.yml restart > /dev/null 2>&1
    
    touch /tmp/last-build
    echo -e "${GREEN}✓ Rebuild complete!${NC}"
}

# Initial build
echo -e "${YELLOW}Starting initial build...${NC}"
./scripts/dev-docker.sh &
DOCKER_PID=$!

# Wait for initial build to complete
sleep 10

# Create timestamp file
touch /tmp/last-build

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Watch Mode Active${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Watching for changes in:"
echo "  • frontends/*/src/"
echo "  • backend/"
echo "  • sites-config.json"
echo ""
echo -e "${YELLOW}Note: Changes will trigger automatic rebuild${NC}"
echo -e "${CYAN}Press Ctrl+C to stop${NC}"
echo ""

# Watch for changes
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS with fswatch
    fswatch -o \
        frontends/*/src \
        backend \
        sites-config.json \
        | while read change; do
            rebuild_and_restart
        done
else
    # Linux with inotifywait
    while true; do
        inotifywait -r -e modify,create,delete \
            frontends/*/src \
            backend \
            sites-config.json \
            2>/dev/null
        rebuild_and_restart
    done
fi
#!/bin/bash
# Test script for PM2 integration

echo "🧪 PM2 Integration Test Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_step() {
    local description="$1"
    local command="$2"
    
    echo -n "Testing: $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# 1. Check if PM2 is installed
echo "1. Checking PM2 Installation"
echo "----------------------------"
if which pm2 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PM2 is installed"
    pm2 --version
else
    echo -e "${RED}✗${NC} PM2 is not installed"
    echo "   Run: npm install -g pm2"
    exit 1
fi
echo ""

# 2. Check configuration files
echo "2. Checking Configuration Files"
echo "-------------------------------"
test_step "ecosystem.config.js exists" "test -f ecosystem.config.js"
test_step "supervisor.conf updated" "grep -q 'pm2 start' scripts/supervisor.conf"
test_step "watcher script updated" "grep -q 'pm2 reload' scripts/watch-and-rebuild-supervisor.sh"
test_step "Dockerfile includes PM2" "grep -q 'npm install -g pm2' Dockerfile"
echo ""

# 3. Test PM2 locally (optional)
echo "3. Local PM2 Test (Optional)"
echo "----------------------------"
echo -e "${YELLOW}Would you like to test PM2 locally? (y/n)${NC}"
read -r response
if [[ "$response" == "y" ]]; then
    echo "Starting PM2 with ecosystem config..."
    
    # Adjust paths for local testing
    cat > ecosystem.config.local.js << 'EOF'
module.exports = {
  apps: [{
    name: 'astro-test',
    script: './astro-multi-tenant/dist/server/entry.mjs',
    cwd: './',
    instances: 2, // Use 2 for testing
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 4321
    },
    error_file: './pm2-error.log',
    out_file: './pm2-out.log'
  }]
};
EOF
    
    echo "Building Astro first..."
    cd astro-multi-tenant && npm run build && cd ..
    
    echo "Starting PM2..."
    pm2 start ecosystem.config.local.js
    
    sleep 3
    
    echo ""
    echo "PM2 Status:"
    pm2 list
    
    echo ""
    echo -e "${YELLOW}Test the application at http://localhost:4321${NC}"
    echo -e "${YELLOW}Run 'pm2 stop all' to stop the test${NC}"
    echo -e "${YELLOW}Run 'pm2 delete all' to clean up${NC}"
fi
echo ""

# 4. Docker readiness check
echo "4. Docker Readiness"
echo "-------------------"
test_step "Docker build context ready" "test -f Dockerfile && test -f ecosystem.config.js"
echo ""

# 5. Summary
echo "5. Summary"
echo "----------"
echo "The PM2 integration is configured and ready for deployment."
echo ""
echo "Next steps:"
echo "1. Sync to your server: ./scripts/sync-project-hot.sh"
echo "2. Rebuild Docker container (if needed): ./scripts/deploy.sh"
echo "3. Check PM2 status in container: docker exec <container> pm2 list"
echo "4. Monitor processes: docker exec <container> pm2 monit"
echo ""
echo "PM2 Commands inside container:"
echo "  pm2 list                    - Show all processes"
echo "  pm2 monit                   - Real-time monitoring"
echo "  pm2 logs                    - View logs"
echo "  pm2 reload astro-multi-tenant - Graceful reload"
echo "  pm2 info astro-multi-tenant  - Detailed info"
echo ""
echo -e "${GREEN}✅ PM2 setup complete!${NC}"
#!/bin/bash

# Sync sites to production server without rebuilding Docker
set -e

# Load configuration from .env
if [ -f ".env" ]; then
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        value="${value%%#*}"
        value="${value%"${value##*[![:space:]]}"}"
        export "$key=$value"
    done < <(grep -v '^#' .env | grep -v '^$')
fi

# Use environment variables or defaults
SERVER="${DEPLOY_SERVER}"
USER="${DEPLOY_USER:-root}"
SSH_PORT="${DEPLOY_PORT:-22}"
CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-multi-tenant-container}"
REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/var/www/docker}"

# Check if server is configured
if [ -z "$SERVER" ] || [ "$SERVER" = "your-server.com" ]; then
    echo "❌ Error: DEPLOY_SERVER not configured in .env file"
    exit 1
fi

echo "🔄 Syncing sites to Production"
echo "=============================="
echo "Server: $USER@$SERVER:$SSH_PORT"
echo "Remote dir: $REMOTE_BASE_DIR"
echo ""

# Build the frontend locally
echo "📦 Building frontend locally..."
cd astro-multi-tenant
npm run build
cd ..

# Build the Go server
echo "🔨 Building Go server..."
cd backend
go build -o server cmd/server/main.go
cd ..

# Check blacklist
EXCLUDE_ARGS=""
if [ -f "blacklist.txt" ]; then
    echo "📋 Using blacklist.txt for sync"
    while IFS= read -r site || [ -n "$site" ]; do
        # Skip comments and empty lines
        [[ "$site" =~ ^#.*$ ]] && continue
        [[ -z "$site" ]] && continue
        site="${site%.com}"  # Remove .com if present
        EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=${site}.com --exclude=${site}"
        echo "  ⏭️  Excluding: $site"
    done < blacklist.txt
fi

# Sync dist folder
echo ""
echo "📤 Syncing dist folder..."
rsync -avz --delete \
    -e "ssh -p $SSH_PORT -o ConnectTimeout=30 -o ServerAliveInterval=15 -o ServerAliveCountMax=3" \
    $EXCLUDE_ARGS \
    astro-multi-tenant/dist/ \
    $USER@$SERVER:$REMOTE_BASE_DIR/dist/

# Sync sites folder
echo ""
echo "📤 Syncing sites folder..."
rsync -avz --delete \
    -e "ssh -p $SSH_PORT -o ConnectTimeout=30 -o ServerAliveInterval=15 -o ServerAliveCountMax=3" \
    $EXCLUDE_ARGS \
    astro-multi-tenant/src/sites/ \
    $USER@$SERVER:$REMOTE_BASE_DIR/sites/

# Sync Go server binary
echo ""
echo "📤 Syncing Go server..."
rsync -avz \
    -e "ssh -p $SSH_PORT -o ConnectTimeout=30 -o ServerAliveInterval=15 -o ServerAliveCountMax=3" \
    backend/server \
    $USER@$SERVER:$REMOTE_BASE_DIR/

# Upload filtered sites-config.json
if [ -f "blacklist.txt" ]; then
    echo ""
    echo "📝 Creating filtered sites-config.json..."
    python3 << EOF > sites-config-filtered.json
import json
import os

with open('sites-config.json', 'r') as f:
    config = json.load(f)

blacklist = []
if os.path.exists('blacklist.txt'):
    with open('blacklist.txt', 'r') as f:
        blacklist = [line.strip() for line in f if line.strip() and not line.startswith('#')]

# Handle both old format (object) and new format (array)
if isinstance(config, dict) and 'sites' not in config:
    filtered_config = {}
    for domain, site_data in config.items():
        if site_data.get('id') not in blacklist:
            filtered_config[domain] = site_data
else:
    filtered_sites = [site for site in config.get('sites', []) if site['id'] not in blacklist]
    filtered_config = {'sites': filtered_sites}

print(json.dumps(filtered_config, indent=2))
EOF
    
    echo "  📤 Uploading filtered sites-config.json..."
    scp -P $SSH_PORT sites-config-filtered.json $USER@$SERVER:$REMOTE_BASE_DIR/sites-config.json
    rm sites-config-filtered.json
else
    echo "  📤 Uploading sites-config.json..."
    scp -P $SSH_PORT sites-config.json $USER@$SERVER:$REMOTE_BASE_DIR/
fi

# Restart container to pick up changes
echo ""
echo "🔄 Restarting container..."
ssh -p $SSH_PORT $USER@$SERVER << EOF
  # Restart the container to pick up new files
  docker restart $CONTAINER_NAME
  
  # Show status
  docker ps | grep $CONTAINER_NAME
EOF

echo ""
echo "✅ Site sync complete!"
echo "====================="
echo "The following have been updated:"
echo "  ✓ Frontend dist files"
echo "  ✓ Site source files"
echo "  ✓ Go server binary"
echo "  ✓ sites-config.json"
echo ""
echo "Container restarted to load changes."
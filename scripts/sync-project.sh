#!/bin/bash

# Sync entire project to server for auto-rebuild capability
set -e

# Load configuration from .env
if [ -f ".env" ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        # Remove inline comments and trim whitespace
        value="${value%%#*}"
        value="${value%"${value##*[![:space:]]}"}"
        # Export the variable
        export "$key=$value"
    done < <(grep -v '^#' .env | grep -v '^$')
fi

SERVER="${DEPLOY_SERVER:-74.208.63.245}"
USER="${DEPLOY_USER:-root}"
SSH_PORT="${DEPLOY_PORT:-22}"
CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-magic-video-container}"

echo "🔄 Syncing Project to Server"
echo "============================="
echo "Server: $USER@$SERVER:$SSH_PORT"
echo "Target: /var/www/astro"
echo ""

# Create directory on server
echo "📁 Creating directory structure..."
ssh -p $SSH_PORT $USER@$SERVER "mkdir -p /var/www/astro"

# Sync entire project (excluding node_modules and other build artifacts)
echo "📤 Syncing project files..."
rsync -avz --delete \
    -e "ssh -p $SSH_PORT" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.docker-build-output' \
    --exclude '.docker-build-temp' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude 'mongodb-data' \
    --exclude 'uploads' \
    ./ \
    $USER@$SERVER:/var/www/astro/

echo ""
echo "🐳 Restarting Docker container to rebuild..."
ssh -p $SSH_PORT $USER@$SERVER << 'EOF'
    # Make entrypoint executable
    chmod +x /var/www/astro/scripts/docker-entrypoint-rebuild.sh
    # Stop and remove old container
    docker stop magic-video-container 2>/dev/null || true
    docker rm magic-video-container 2>/dev/null || true
    
    # Start new container with full project mount and custom entrypoint
    docker run -d \
        --name magic-video-container \
        -p 4321:4321 \
        -p 3001:3001 \
        -e NODE_ENV=production \
        -e PORT=4321 \
        -e API_PORT=3001 \
        -e MONGODB_URI='mongodb://localhost:27017/magicvideo' \
        -e JWT_SECRET='super-secret-jwt-key' \
        -e PUBLIC_API_URL='https://magicvideodownloader.com' \
        -v /var/www/astro:/app \
        -v /var/www/docker/uploads:/app/uploads \
        -v /var/www/docker/mongodb-data:/data/db \
        --entrypoint /app/scripts/docker-entrypoint-rebuild.sh \
        --restart unless-stopped \
        proggod/magic-video-app:latest
    
    # Show status
    docker ps | grep magic-video-container
EOF

echo ""
echo "✅ Project sync complete!"
echo "========================"
echo "The container will now rebuild with all source files available."
echo ""
echo "To pull updates from git on server:"
echo "  ssh $USER@$SERVER 'cd /var/www/astro && git pull && docker restart magic-video-container'"
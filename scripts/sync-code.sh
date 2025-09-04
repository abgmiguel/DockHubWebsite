#!/bin/bash

# Sync script that builds in Docker locally with mounted volumes, then syncs to server
# This ensures node_modules and dist are always matched
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

# Configuration
SERVER="${DEPLOY_SERVER}"
USER="${DEPLOY_USER:-root}"
SSH_PORT="${DEPLOY_PORT:-22}"
CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-multi-tenant-container}"
REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/var/www/docker}"
LOCAL_IMAGE="${DOCKER_IMAGE_NAME:-multi-tenant-app}:local-build"
LOCAL_EXTRACT_DIR=".docker-build-output"

# Check if server is configured
if [ -z "$SERVER" ] || [ "$SERVER" = "your-server.com" ]; then
    echo "❌ Error: DEPLOY_SERVER not configured in .env file"
    echo "   Please set DEPLOY_SERVER in your .env file"
    exit 1
fi

echo "⚡ Docker-Based Code Sync"
echo "========================="
echo "Server: $USER@$SERVER:$SSH_PORT"
echo "Remote dir: $REMOTE_BASE_DIR"
echo "Container: $CONTAINER_NAME"
echo "Local extract: $LOCAL_EXTRACT_DIR"
echo ""

# Parse command line arguments
REBUILD_DOCKER=true
RESTART_CONTAINER=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-rebuild)
            REBUILD_DOCKER=false
            shift
            ;;
        --no-restart)
            RESTART_CONTAINER=false
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --no-rebuild   Skip Docker rebuild (use existing local image)"
            echo "  --no-restart   Don't restart container after sync"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Create local extract directory
mkdir -p $LOCAL_EXTRACT_DIR

# Build Docker image locally if requested
if [ "$REBUILD_DOCKER" = true ]; then
    echo "🔨 Building Docker image locally..."
    
    # Use blacklist if it exists
    if [ -f "blacklist.txt" ] && [ -f "scripts/build-with-blacklist.sh" ]; then
        DOCKER_IMAGE_NAME="${LOCAL_IMAGE%:*}" DOCKER_TAG="${LOCAL_IMAGE#*:}" ./scripts/build-with-blacklist.sh
    else
        docker buildx build --platform linux/amd64 -f Dockerfile -t $LOCAL_IMAGE --load .
    fi
    echo "  ✅ Docker image built locally"
fi

# Run Docker container with mounted volumes to extract built files
echo "📦 Running Docker to extract built files..."
TEMP_CONTAINER="sync-extract-$$"

# Clean up any existing extract directories
rm -rf $LOCAL_EXTRACT_DIR/*
mkdir -p $LOCAL_EXTRACT_DIR/dist
mkdir -p $LOCAL_EXTRACT_DIR/sites
mkdir -p $LOCAL_EXTRACT_DIR

# Run container with volumes mounted to extract built files
# The entrypoint will copy internal files to mounted volumes
# Don't mount /app/server since it's a file, not a directory
docker run -d \
    --name $TEMP_CONTAINER \
    -v $(pwd)/$LOCAL_EXTRACT_DIR/dist:/app/dist \
    -v $(pwd)/$LOCAL_EXTRACT_DIR/sites:/app/src/sites \
    -v $(pwd)/$LOCAL_EXTRACT_DIR:/app/extract \
    $LOCAL_IMAGE

# Wait for entrypoint to copy files
echo "  ⏳ Waiting for Docker to populate files..."
sleep 5

# Copy additional files we need
docker cp $TEMP_CONTAINER:/app/sites-config.json $LOCAL_EXTRACT_DIR/sites-config.json 2>/dev/null || true
docker cp $TEMP_CONTAINER:/app/server $LOCAL_EXTRACT_DIR/server-binary 2>/dev/null || true

# Stop and remove container
docker stop $TEMP_CONTAINER > /dev/null
docker rm $TEMP_CONTAINER > /dev/null

echo "  ✅ Files extracted to $LOCAL_EXTRACT_DIR"

# Verify we have the files
if [ ! -d "$LOCAL_EXTRACT_DIR/dist" ] || [ -z "$(ls -A $LOCAL_EXTRACT_DIR/dist)" ]; then
    echo "❌ Error: Failed to extract dist files from Docker"
    exit 1
fi

echo ""
echo "📤 Syncing files to server..."
echo "============================="

# Sync dist (built in Docker, so node_modules match)
echo "📤 Syncing frontend dist..."
rsync -avz --delete \
    -e "ssh -p $SSH_PORT -o ConnectTimeout=30 -o ServerAliveInterval=15" \
    $LOCAL_EXTRACT_DIR/dist/ \
    $USER@$SERVER:$REMOTE_BASE_DIR/dist/
echo "  ✅ Frontend dist synced"

# Sync server binary (built in Docker for Linux)
if [ -f "$LOCAL_EXTRACT_DIR/server-binary" ]; then
    echo "📤 Syncing Go server..."
    scp -P $SSH_PORT $LOCAL_EXTRACT_DIR/server-binary $USER@$SERVER:$REMOTE_BASE_DIR/server
    ssh -p $SSH_PORT $USER@$SERVER "chmod +x $REMOTE_BASE_DIR/server"
    echo "  ✅ Go server synced"
elif [ -f "$LOCAL_EXTRACT_DIR/server/server" ]; then
    echo "📤 Syncing Go server..."
    scp -P $SSH_PORT $LOCAL_EXTRACT_DIR/server/server $USER@$SERVER:$REMOTE_BASE_DIR/server
    ssh -p $SSH_PORT $USER@$SERVER "chmod +x $REMOTE_BASE_DIR/server"
    echo "  ✅ Go server synced"
fi

# Sync sites source
echo "📤 Syncing sites source..."
rsync -avz --delete \
    -e "ssh -p $SSH_PORT -o ConnectTimeout=30 -o ServerAliveInterval=15" \
    $LOCAL_EXTRACT_DIR/sites/ \
    $USER@$SERVER:$REMOTE_BASE_DIR/sites/
echo "  ✅ Sites source synced"

# Sync sites-config.json
if [ -f "$LOCAL_EXTRACT_DIR/sites-config.json" ]; then
    echo "📤 Syncing sites-config.json..."
    scp -P $SSH_PORT $LOCAL_EXTRACT_DIR/sites-config.json $USER@$SERVER:$REMOTE_BASE_DIR/sites-config.json
    echo "  ✅ sites-config.json synced"
fi

# Restart container if requested
if [ "$RESTART_CONTAINER" = true ]; then
    echo ""
    echo "🔄 Restarting container..."
    ssh -p $SSH_PORT $USER@$SERVER "docker restart $CONTAINER_NAME"
    
    # Wait for container to restart
    sleep 3
    
    # Check container status
    echo ""
    echo "📊 Container status:"
    ssh -p $SSH_PORT $USER@$SERVER "docker ps | grep $CONTAINER_NAME"
else
    echo ""
    echo "⚠️  Container not restarted (use --no-restart to skip)"
    echo "   Container must be restarted for changes to take effect"
fi

echo ""
echo "✅ Docker-Based Sync Complete!"
echo "=============================="
echo "All files were built in Docker and synced to server."
echo "Files are available locally in: $LOCAL_EXTRACT_DIR"
echo ""
echo "Note: The $LOCAL_EXTRACT_DIR directory contains the production build."
echo "You can inspect these files before syncing if needed."
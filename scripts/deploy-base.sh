#!/bin/bash

# Deploy minimal base Docker image (one-time setup)
# After this, use sync-sites.sh for updates
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
REGISTRY="${DOCKER_REGISTRY:-local}"
TAG="${DOCKER_TAG:-base}"
IMAGE_NAME="${DOCKER_IMAGE_NAME:-multi-tenant-app}"
CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-multi-tenant-container}"
SERVER="${DEPLOY_SERVER}"
USER="${DEPLOY_USER:-root}"
SSH_PORT="${DEPLOY_PORT:-22}"
REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/var/www/docker}"

# Check if server is configured
if [ -z "$SERVER" ] || [ "$SERVER" = "your-server.com" ]; then
    echo "❌ Error: DEPLOY_SERVER not configured in .env file"
    exit 1
fi

echo "🚀 Deploying Base Image to Production"
echo "====================================="
echo "Server: $USER@$SERVER:$SSH_PORT"
echo "Image: $IMAGE_NAME:$TAG"
echo "Container: $CONTAINER_NAME"
echo ""

# Build minimal base image
echo "📦 Building minimal base Docker image..."
docker buildx build --platform linux/amd64 -f Dockerfile.base -t $IMAGE_NAME:$TAG --load .

# Check Docker Hub login if using registry
if [ "$REGISTRY" != "local" ]; then
    echo "🔑 Checking Docker registry login..."
    if ! docker pull hello-world:latest > /dev/null 2>&1; then
        if [ ! -z "$DOCKER_USERNAME" ] && [ ! -z "$DOCKER_PASSWORD" ]; then
            echo "🔑 Logging into Docker Hub..."
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
        else
            echo "⚠️  Unable to access Docker registry. Attempting to continue..."
        fi
    else
        echo "✅ Docker registry access verified"
    fi
fi

# Push or save image
if [ "$REGISTRY" != "local" ]; then
    if [ "$REGISTRY" = "docker.io" ]; then
        FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"
    else
        FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"
    fi
    
    echo "⬆️  Pushing base image to registry..."
    docker push $FULL_IMAGE_NAME
    
    echo "📥 Pulling image on server..."
    ssh -p $SSH_PORT $USER@$SERVER "docker pull $FULL_IMAGE_NAME"
    REMOTE_IMAGE="$FULL_IMAGE_NAME"
else
    echo "📦 Saving Docker image locally..."
    docker save $IMAGE_NAME:$TAG | gzip > $IMAGE_NAME-$TAG.tar.gz
    
    echo "⬆️  Uploading image to server..."
    scp -P $SSH_PORT $IMAGE_NAME-$TAG.tar.gz $USER@$SERVER:$REMOTE_BASE_DIR/
    
    echo "🔄 Loading image on server..."
    ssh -p $SSH_PORT $USER@$SERVER "cd $REMOTE_BASE_DIR && gunzip -c $IMAGE_NAME-$TAG.tar.gz | docker load && rm $IMAGE_NAME-$TAG.tar.gz"
    
    rm $IMAGE_NAME-$TAG.tar.gz
    REMOTE_IMAGE="$IMAGE_NAME:$TAG"
fi

# Setup directories on server
echo "📁 Setting up directories on server..."
ssh -p $SSH_PORT $USER@$SERVER << 'EOF'
  mkdir -p /var/www/docker/dist
  mkdir -p /var/www/docker/sites
  mkdir -p /var/www/docker/uploads
  mkdir -p /var/www/docker/public
  mkdir -p /var/www/docker/logs
  mkdir -p /var/www/docker/mongodb-data
  chown -R www-data:www-data /var/www/docker/uploads 2>/dev/null || true
  chmod -R 755 /var/www/docker
EOF

# Initial sync of sites/dist/server
echo ""
echo "📤 Performing initial sync of sites and dist..."
if ! ./scripts/sync-sites.sh; then
    echo "⚠️  Warning: Initial sync had some issues, but continuing..."
fi

# Deploy nginx configurations
echo "🔧 Deploying nginx configurations..."
echo "  🧹 Cleaning up old nginx configs on server..."

ssh -p $SSH_PORT $USER@$SERVER << 'ENDSSH'
mkdir -p /etc/nginx/backup-configs
mv /etc/nginx/sites-enabled/*.conf /etc/nginx/backup-configs/ 2>/dev/null || true
mkdir -p /etc/nginx/sites-enabled
mkdir -p /etc/nginx/includes
ENDSSH

if [ -f "nginx/sites-enabled/00-default-catch-all.conf" ]; then
    echo "  📤 Uploading catch-all config"
    scp -P $SSH_PORT nginx/sites-enabled/00-default-catch-all.conf $USER@$SERVER:/etc/nginx/sites-enabled/
fi

if [ -f "nginx/includes/common-locations.conf" ]; then
    echo "  📤 Uploading common-locations.conf"
    scp -P $SSH_PORT nginx/includes/common-locations.conf $USER@$SERVER:/etc/nginx/includes/
fi

# Start container with volumes
echo ""
echo "🌐 Starting container on $SERVER..."
ssh -p $SSH_PORT $USER@$SERVER << EOF
  cd $REMOTE_BASE_DIR
  
  # Stop and remove any existing container
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
  
  # Start new container with all volumes
  docker run -d \
    --name $CONTAINER_NAME \
    -p 4321:4321 \
    -p 3001:3001 \
    -e NODE_ENV=production \
    -e PORT="${PORT}" \
    -e API_PORT="3001" \
    -e MONGODB_URI="${MONGODB_URI}" \
    -e JWT_SECRET="${JWT_SECRET}" \
    -e PUBLIC_API_URL="${PUBLIC_API_URL}" \
    -e PUBLIC_DEV_FRONTEND_PORT="${PUBLIC_DEV_FRONTEND_PORT}" \
    -e PUBLIC_DEV_API_PORT="${PUBLIC_DEV_API_PORT}" \
    -e CORS_ORIGIN="${CORS_ORIGIN}" \
    -v $REMOTE_BASE_DIR/uploads:/app/uploads \
    -v $REMOTE_BASE_DIR/public:/app/public \
    -v $REMOTE_BASE_DIR/mongodb-data:/data/db \
    -v $REMOTE_BASE_DIR/sites-config.json:/app/sites-config.json:ro \
    -v $REMOTE_BASE_DIR/dist:/app/dist \
    -v $REMOTE_BASE_DIR/sites:/app/src/sites \
    -v $REMOTE_BASE_DIR/server:/app/server \
    -v $REMOTE_BASE_DIR/logs:/app/logs \
    --restart unless-stopped \
    $REMOTE_IMAGE
  
  # Test and reload nginx
  echo "🔄 Testing and reloading nginx..."
  nginx -t && nginx -s reload
  
  # Show status
  docker ps | grep $CONTAINER_NAME
EOF

echo ""
echo "✅ Base Deployment Complete!"
echo "============================"
echo ""
echo "From now on, use ./scripts/sync-sites.sh for updates"
echo "This will sync sites without rebuilding Docker"
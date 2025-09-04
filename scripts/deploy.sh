#!/bin/bash

# Deploy to production server with blacklist support
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

# Use environment variables or defaults
REGISTRY="${DOCKER_REGISTRY:-local}"
TAG="${DOCKER_TAG:-latest}"
IMAGE_NAME="${DOCKER_IMAGE_NAME:-multi-tenant-app}"
CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-multi-tenant-container}"
SERVER="${DEPLOY_SERVER}"
USER="${DEPLOY_USER:-root}"
SSH_PORT="${DEPLOY_PORT:-22}"

# Check if server is configured
if [ -z "$SERVER" ] || [ "$SERVER" = "your-server.com" ]; then
    echo "❌ Error: DEPLOY_SERVER not configured in .env file"
    echo "   Please set DEPLOY_SERVER in your .env file"
    exit 1
fi
REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/var/www/docker}"
NGINX_CONFIG_DIR="${NGINX_CONFIG_DIR:-/etc/nginx}"

echo "🚀 Deploying to Production"
echo "========================="
echo "Server: $USER@$SERVER:$SSH_PORT"
echo "Image: $IMAGE_NAME:$TAG"
echo "Container: $CONTAINER_NAME"
echo "Registry: $REGISTRY"
echo "Remote dir: $REMOTE_BASE_DIR"
echo ""

# Check blacklist
if [ -f "blacklist.txt" ]; then
    echo "📋 Using blacklist.txt for deployment"
    BLACKLISTED_SITES=$(cat blacklist.txt | grep -v '^#' | grep -v '^$' | tr '\n' ' ')
    echo "🚫 Excluding: $BLACKLISTED_SITES"
    echo ""
fi

# Check Docker Hub login if using registry
if [ "$REGISTRY" != "local" ]; then
    echo "🔑 Checking Docker registry login..."
    # Try to pull a small test image to check if we're logged in
    # This works better on macOS where docker info doesn't show Username
    if ! docker pull hello-world:latest > /dev/null 2>&1; then
        if [ ! -z "$DOCKER_USERNAME" ] && [ ! -z "$DOCKER_PASSWORD" ]; then
            echo "🔑 Logging into Docker Hub..."
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
        else
            echo "⚠️  Unable to access Docker registry. Attempting to continue..."
            echo "    If push fails, run: docker login"
        fi
    else
        echo "✅ Docker registry access verified"
    fi
fi

# Build image with blacklist support
if [ -f "scripts/build-with-blacklist.sh" ] && [ -f "blacklist.txt" ]; then
    echo "📦 Building Docker image with blacklist..."
    # Need to pass the image name to the build script
    DOCKER_IMAGE_NAME=$IMAGE_NAME DOCKER_TAG=$TAG ./scripts/build-with-blacklist.sh
else
    echo "📦 Building Docker image for linux/amd64..."
    docker buildx build --platform linux/amd64 -f Dockerfile -t $IMAGE_NAME:$TAG --load .
fi

# Handle Docker image deployment
if [ "$REGISTRY" != "local" ]; then
    # For Docker Hub, the image name already includes the username
    if [ "$REGISTRY" = "docker.io" ]; then
        FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"
    else
        FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"
    fi
    
    echo "⬆️  Pushing image to registry..."
    docker push $FULL_IMAGE_NAME
    
    echo "📥 Pulling image from registry on server..."
    echo "   Image: $FULL_IMAGE_NAME"
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

# Deploy nginx configurations
echo "🔧 Deploying nginx configurations..."
echo "  🧹 Cleaning up old nginx configs on server..."

# Remove old site-specific configs (we're using catch-all now)
ssh -p $SSH_PORT $USER@$SERVER << 'ENDSSH'
# Backup old configs
mkdir -p /etc/nginx/backup-configs
mv /etc/nginx/sites-enabled/*.conf /etc/nginx/backup-configs/ 2>/dev/null || true

# Create necessary directories
mkdir -p /etc/nginx/sites-enabled
mkdir -p /etc/nginx/includes
mkdir -p /etc/nginx/includes/api-overrides
mkdir -p /etc/nginx/includes/upload-overrides
mkdir -p /etc/nginx/includes/static-overrides
mkdir -p /etc/nginx/includes/route-overrides
mkdir -p /etc/nginx/includes/custom-locations
mkdir -p /etc/nginx/includes/public-overrides
ENDSSH

echo "  📤 Uploading new catch-all nginx configuration..."

# Upload the catch-all config
if [ -f "nginx/sites-enabled/00-default-catch-all.conf" ]; then
    echo "    📤 Uploading catch-all config"
    scp -P $SSH_PORT nginx/sites-enabled/00-default-catch-all.conf $USER@$SERVER:$NGINX_CONFIG_DIR/sites-enabled/
fi

# Upload common includes
if [ -f "nginx/includes/common-locations.conf" ]; then
    echo "    📤 Uploading common-locations.conf"
    scp -P $SSH_PORT nginx/includes/common-locations.conf $USER@$SERVER:$NGINX_CONFIG_DIR/includes/
fi

# Upload include files if they exist (only for non-blacklisted sites)
if [ -d "nginx/includes" ]; then
    for include in nginx/includes/*; do
        if [ -f "$include" ]; then
            filename=$(basename "$include")
            site_id="${filename%-locations.conf}"
            
            # Skip if blacklisted
            if [ -f "blacklist.txt" ] && grep -q "^$site_id$" blacklist.txt; then
                echo "  ⏭️  Skipping include for $site_id (blacklisted)"
            else
                echo "  📤 Uploading include: $filename"
                scp -P $SSH_PORT "$include" $USER@$SERVER:$NGINX_CONFIG_DIR/includes/
            fi
        fi
    done
fi

# Sync entire project to /var/www/astro for rebuild capability
echo "📤 Syncing project to /var/www/astro..."
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

# Upload filtered sites-config.json
if [ -f "blacklist.txt" ]; then
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
    # Old format: domains as keys
    filtered_config = {}
    for domain, site_data in config.items():
        if site_data.get('id') not in blacklist:
            filtered_config[domain] = site_data
else:
    # New format: array of sites
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

# Upload docker-compose.yml
echo "  📤 Uploading docker-compose.yml..."
scp -P $SSH_PORT docker-compose.yml $USER@$SERVER:$REMOTE_BASE_DIR/

# Deploy on server
echo "🌐 Deploying on $SERVER..."
ssh -p $SSH_PORT $USER@$SERVER << EOF
  cd $REMOTE_BASE_DIR
  
  # Stop existing container with same name
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
  
  # Start new container with full project mount for auto-rebuild
  docker run -d \
    --name $CONTAINER_NAME \
    -p 4321:4321 \
    -p 3001:3001 \
    -e NODE_ENV=production \
    -e PORT="${PORT:-4321}" \
    -e API_PORT="${API_PORT:-3001}" \
    -e MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/magicvideo}" \
    -e JWT_SECRET="${JWT_SECRET:-super-secret-jwt-key}" \
    -e PUBLIC_API_URL="${PUBLIC_API_URL:-https://magicvideodownloader.com}" \
    -e CORS_ORIGIN="${CORS_ORIGIN:-*}" \
    -v /var/www/astro:/app \
    -v $REMOTE_BASE_DIR/uploads:/app/uploads \
    -v $REMOTE_BASE_DIR/mongodb-data:/data/db \
    --restart unless-stopped \
    $REMOTE_IMAGE
  
  # Setup directory structure
  echo "📁 Setting up directory structure..."
  mkdir -p /var/www/docker/public
  mkdir -p /var/www/docker/uploads
  mkdir -p /var/www/docker/logs
  
  # Create site-specific directories based on sites-config.json
  if [ -f /var/www/docker/sites-config.json ]; then
    for site_id in $(cat /var/www/docker/sites-config.json | jq -r '.[] | .id' | sort -u); do
      mkdir -p /var/www/docker/public/$site_id
      mkdir -p /var/www/docker/uploads/blog/$site_id
      chown -R www-data:www-data /var/www/docker/uploads/blog/$site_id 2>/dev/null || true
    done
  fi
  
  # Set permissions
  chown -R www-data:www-data /var/www/docker/uploads 2>/dev/null || true
  chmod -R 755 /var/www/docker
  
  # Fix SSL certificate permissions for dynamic loading
  echo "🔐 Fixing SSL certificate permissions..."
  for cert_dir in /etc/letsencrypt/archive/*; do
    if [ -d "\$cert_dir" ]; then
      chmod 644 \$cert_dir/*.pem 2>/dev/null || true
      echo "  ✓ Fixed permissions for \$(basename \$cert_dir)"
    fi
  done
  
  # Test and reload nginx
  echo "🔄 Testing and reloading nginx..."
  nginx -t && nginx -s reload
  
  # Show status
  docker ps | grep $CONTAINER_NAME
EOF

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo "Deployed sites:"
python3 << EOF
import json

with open('sites-config.json', 'r') as f:
    config = json.load(f)

blacklist = []
try:
    with open('blacklist.txt', 'r') as f:
        blacklist = [line.strip() for line in f if line.strip() and not line.startswith('#')]
except:
    pass

# Handle both old format (object) and new format (array)
if isinstance(config, dict) and 'sites' not in config:
    # Old format: domains as keys
    for domain, site_data in config.items():
        if site_data.get('id') not in blacklist:
            print(f"  ✓ https://{domain}")
else:
    # New format: array of sites
    for site in config.get('sites', []):
        if site['id'] not in blacklist:
            print(f"  ✓ https://{site['domain']}")
EOF
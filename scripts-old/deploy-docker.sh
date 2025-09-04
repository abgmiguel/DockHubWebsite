#!/bin/bash

# Docker deployment script - builds, tags, and pushes multi-tenant image
# Usage: ./deploy-docker.sh [registry] [tag]
#   registry: Docker registry URL (default: docker.io/yourusername)
#   tag: Image tag (default: latest)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
REGISTRY="${1:-docker.io/yourusername}"  # Change to your registry
TAG="${2:-latest}"
IMAGE_NAME="multi-tenant-blog"
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Docker Multi-Tenant Deployment${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "Registry: ${REGISTRY}"
echo "Image: ${IMAGE_NAME}:${TAG}"
echo ""

# 1. Build all frontends
echo -e "${YELLOW}1. Building all frontends...${NC}"
for dir in frontends/*/; do
    if [ -d "$dir" ] && [ -f "${dir}/package.json" ]; then
        site=$(basename "$dir")
        echo -n "   Building ${site}... "
        (
            cd "$dir"
            if [ ! -d "node_modules" ]; then
                npm ci --silent > /dev/null 2>&1
            fi
            npm run build --silent > /dev/null 2>&1
        )
        echo -e "${GREEN}✓${NC}"
    fi
done

# 2. Build Docker image
echo -e "${YELLOW}2. Building Docker image...${NC}"
docker build -f Dockerfile.multi-tenant -t ${IMAGE_NAME}:${TAG} .
echo -e "${GREEN}   ✓ Image built${NC}"

# 3. Tag image for registry
echo -e "${YELLOW}3. Tagging image for registry...${NC}"
docker tag ${IMAGE_NAME}:${TAG} ${FULL_IMAGE}
echo -e "${GREEN}   ✓ Tagged as ${FULL_IMAGE}${NC}"

# 4. Push to registry
echo -e "${YELLOW}4. Pushing to registry...${NC}"
echo "   This may take a few minutes..."
docker push ${FULL_IMAGE}
echo -e "${GREEN}   ✓ Pushed successfully${NC}"

# 5. Generate deployment script
echo -e "${YELLOW}5. Generating deployment script...${NC}"
cat > deploy-on-host.sh << EOF
#!/bin/bash
# Run this on your production host to deploy the latest image

set -e

# Configuration
REGISTRY="${REGISTRY}"
IMAGE_NAME="${IMAGE_NAME}"
TAG="${TAG}"
CONTAINER_NAME="multi-tenant-prod"

echo "Deploying Multi-Tenant Blog Platform..."

# 1. Pull latest image
echo "Pulling latest image..."
docker pull \${REGISTRY}/\${IMAGE_NAME}:\${TAG}

# 2. Stop existing container
if docker ps | grep -q \${CONTAINER_NAME}; then
    echo "Stopping existing container..."
    docker stop \${CONTAINER_NAME}
    docker rm \${CONTAINER_NAME}
fi

# 3. Create external volumes if they don't exist
docker volume create --name multi-tenant-data 2>/dev/null || true
docker volume create --name multi-tenant-uploads 2>/dev/null || true
docker volume create --name multi-tenant-logs 2>/dev/null || true

# 4. Run new container with external volumes
echo "Starting new container..."
docker run -d \\
    --name \${CONTAINER_NAME} \\
    --restart unless-stopped \\
    -p 8000:8000 \\
    -v multi-tenant-data:/data/db \\
    -v multi-tenant-uploads:/app/uploads \\
    -v multi-tenant-logs:/app/logs \\
    -v /path/to/sites-config.json:/app/sites-config.json:ro \\
    -e NODE_ENV=production \\
    -e MONGODB_URI=mongodb://127.0.0.1:27017 \\
    -e JWT_SECRET=\${JWT_SECRET} \\
    -e CORS_ORIGIN=* \\
    \${REGISTRY}/\${IMAGE_NAME}:\${TAG}

echo "✓ Deployment complete!"
echo ""
echo "Container: \${CONTAINER_NAME}"
echo "Logs: docker logs -f \${CONTAINER_NAME}"
echo "Data volumes:"
echo "  - multi-tenant-data (MongoDB)"
echo "  - multi-tenant-uploads (User uploads)"
echo "  - multi-tenant-logs (Application logs)"
EOF

chmod +x deploy-on-host.sh
echo -e "${GREEN}   ✓ Created deploy-on-host.sh${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Package Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Image published to:${NC}"
echo "  ${FULL_IMAGE}"
echo ""
echo -e "${CYAN}To deploy on production host:${NC}"
echo "  1. Copy deploy-on-host.sh to your server"
echo "  2. Copy sites-config.json to your server"
echo "  3. Set JWT_SECRET environment variable"
echo "  4. Run: ./deploy-on-host.sh"
echo ""
echo -e "${CYAN}To pull manually:${NC}"
echo "  docker pull ${FULL_IMAGE}"
echo ""
echo -e "${CYAN}External data locations on host:${NC}"
echo "  • MongoDB: /var/lib/docker/volumes/multi-tenant-data"
echo "  • Uploads: /var/lib/docker/volumes/multi-tenant-uploads"
echo "  • Logs:    /var/lib/docker/volumes/multi-tenant-logs"
echo ""
#!/bin/bash

# Multi-tenant deployment script
# Usage: ./deploy-multi-tenant.sh [production|staging]

set -e

ENVIRONMENT="${1:-production}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/deploy_${TIMESTAMP}"

echo "========================================="
echo "Multi-Tenant Deployment - ${ENVIRONMENT}"
echo "========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Pre-deployment checks
echo -e "${YELLOW}1. Running pre-deployment checks...${NC}"

# Check if all sites build successfully
for dir in frontends/*/; do
    if [ -d "$dir" ]; then
        site=$(basename "$dir")
        echo "Checking ${site}..."
        if [ ! -f "${dir}/package.json" ]; then
            echo -e "${RED}Error: ${site} missing package.json${NC}"
            exit 1
        fi
    fi
done

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"

# 2. Backup current deployment
echo -e "${YELLOW}2. Creating backup...${NC}"
mkdir -p "${BACKUP_DIR}"

# Backup databases
docker exec mongodb mongodump --out "/backup/${TIMESTAMP}" 2>/dev/null || true
cp -r docker/volumes/mongodb "${BACKUP_DIR}/mongodb_data" 2>/dev/null || true

# Backup configurations
cp sites-config.json "${BACKUP_DIR}/" 2>/dev/null || true
cp backend/.env.production "${BACKUP_DIR}/" 2>/dev/null || true

echo -e "${GREEN}✓ Backup created in ${BACKUP_DIR}${NC}"

# 3. Build all frontends
echo -e "${YELLOW}3. Building all frontend sites...${NC}"

for dir in frontends/*/; do
    if [ -d "$dir" ]; then
        site=$(basename "$dir")
        echo "Building ${site}..."
        (
            cd "$dir"
            npm ci --production
            npm run build
        )
        echo -e "${GREEN}✓ ${site} built successfully${NC}"
    fi
done

# 4. Build backend
echo -e "${YELLOW}4. Building backend...${NC}"
(
    cd backend
    go mod download
    go build -o server cmd/server/main.go
)
echo -e "${GREEN}✓ Backend built successfully${NC}"

# 5. Build Docker image
echo -e "${YELLOW}5. Building Docker image...${NC}"
docker build -f Dockerfile.multi-tenant -t multi-tenant:${TIMESTAMP} .
docker tag multi-tenant:${TIMESTAMP} multi-tenant:latest
echo -e "${GREEN}✓ Docker image built${NC}"

# 6. Run health checks
echo -e "${YELLOW}6. Running health checks...${NC}"

# Start new container in test mode
docker run -d --name test-container \
    -p 8080:80 \
    --env-file backend/.env.${ENVIRONMENT} \
    multi-tenant:${TIMESTAMP}

sleep 5

# Check if container is healthy
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    docker stop test-container && docker rm test-container
else
    echo -e "${RED}Health check failed${NC}"
    docker logs test-container
    docker stop test-container && docker rm test-container
    exit 1
fi

# 7. Deploy
echo -e "${YELLOW}7. Deploying...${NC}"

if [ "$ENVIRONMENT" == "production" ]; then
    # Stop old container
    docker stop multi-tenant-app 2>/dev/null || true
    docker rm multi-tenant-app 2>/dev/null || true
    
    # Start new container
    docker run -d --name multi-tenant-app \
        --restart=always \
        -p 8000:8000 \
        -p 3001:3001 \
        -v /etc/letsencrypt:/etc/letsencrypt:ro \
        -v $(pwd)/uploads:/app/uploads \
        -v $(pwd)/logs:/app/logs \
        --env-file backend/.env.production \
        multi-tenant:latest
    
    echo -e "${GREEN}✓ Production deployment complete${NC}"
    
    # Setup SSL for all domains
    echo -e "${YELLOW}8. Checking SSL certificates...${NC}"
    for domain in $(jq -r 'keys[]' sites-config.json); do
        if [ ! -d "/etc/letsencrypt/live/${domain}" ]; then
            echo "Setting up SSL for ${domain}..."
            ./scripts/setup-ssl.sh "${domain}"
        fi
    done
    
elif [ "$ENVIRONMENT" == "staging" ]; then
    # Deploy to staging
    docker stop multi-tenant-staging 2>/dev/null || true
    docker rm multi-tenant-staging 2>/dev/null || true
    
    docker run -d --name multi-tenant-staging \
        --restart=always \
        -p 8080:80 \
        -v $(pwd)/uploads:/app/uploads \
        --env-file backend/.env.staging \
        multi-tenant:latest
    
    echo -e "${GREEN}✓ Staging deployment complete${NC}"
fi

# 8. Post-deployment checks
echo -e "${YELLOW}9. Running post-deployment checks...${NC}"

# Check all sites are accessible
for domain in $(jq -r 'keys[]' sites-config.json); do
    echo -n "Checking ${domain}... "
    if [ "$ENVIRONMENT" == "production" ]; then
        url="https://${domain}"
    else
        url="http://localhost:8080"
    fi
    
    if curl -f -H "Host: ${domain}" "${url}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
done

# 9. Cleanup old images
echo -e "${YELLOW}10. Cleaning up...${NC}"
docker image prune -f
echo -e "${GREEN}✓ Cleanup complete${NC}"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Environment: ${ENVIRONMENT}"
echo "Image: multi-tenant:${TIMESTAMP}"
echo "Backup: ${BACKUP_DIR}"
echo ""

# Show running containers
docker ps | grep multi-tenant

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Monitor logs: docker logs -f multi-tenant-app"
echo "2. Check metrics: docker stats multi-tenant-app"
echo "3. Rollback if needed: docker run multi-tenant:<previous-timestamp>"
#!/bin/bash

# Script to add a new site to the multi-tenant system
# Usage: ./add-site.sh <domain> <site-name> [database-name]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <domain> <site-name> [database-name]${NC}"
    echo "Example: $0 example.com example example_db"
    exit 1
fi

DOMAIN="$1"
SITE_NAME="$2"
DATABASE_NAME="${3:-${SITE_NAME}_db}"
SITE_DIR="frontends/${DOMAIN}"

echo -e "${GREEN}Adding new site: ${DOMAIN}${NC}"
echo "Site Name: ${SITE_NAME}"
echo "Database: ${DATABASE_NAME}"
echo "Directory: ${SITE_DIR}"
echo ""

# 1. Update sites-config.json
echo -e "${YELLOW}1. Updating sites-config.json...${NC}"
if [ ! -f sites-config.json ]; then
    echo "{}" > sites-config.json
fi

# Add new site to config using jq (or fallback to manual editing)
if command -v jq &> /dev/null; then
    jq --arg domain "$DOMAIN" \
       --arg id "$SITE_NAME" \
       --arg dir "${DOMAIN}" \
       --arg db "$DATABASE_NAME" \
       '.[$domain] = {
           "id": $id,
           "directory": $dir,
           "database": $db,
           "theme": "dark",
           "features": ["blog", "docs"]
       }' sites-config.json > sites-config.tmp && mv sites-config.tmp sites-config.json
    echo -e "${GREEN}✓ sites-config.json updated${NC}"
else
    echo -e "${YELLOW}Please manually add this to sites-config.json:${NC}"
    cat << EOF
  "${DOMAIN}": {
    "id": "${SITE_NAME}",
    "directory": "${DOMAIN}",
    "database": "${DATABASE_NAME}",
    "theme": "dark",
    "features": ["blog", "docs"]
  }
EOF
fi

# 2. Update backend/.env.production ALLOWED_DOMAINS
echo -e "${YELLOW}2. Updating ALLOWED_DOMAINS in backend/.env.production...${NC}"
ENV_FILE="backend/.env.production"

if [ -f "$ENV_FILE" ]; then
    # Check if domain already exists
    if grep -q "ALLOWED_DOMAINS=.*${DOMAIN}" "$ENV_FILE"; then
        echo -e "${YELLOW}Domain ${DOMAIN} already in ALLOWED_DOMAINS${NC}"
    else
        # Append domain to ALLOWED_DOMAINS
        sed -i.bak "/^ALLOWED_DOMAINS=/ s/$/,${DOMAIN}/" "$ENV_FILE"
        echo -e "${GREEN}✓ Added ${DOMAIN} to ALLOWED_DOMAINS${NC}"
    fi
else
    echo -e "${YELLOW}Creating backend/.env.production with domain...${NC}"
    cat > "$ENV_FILE" << EOF
# Multi-tenant Production Configuration
ENV=production
MONGODB_URI=mongodb://admin:password@mongodb:27017/?authSource=admin
PORT=3001
ALLOWED_DOMAINS=${DOMAIN}
SITES_CONFIG_PATH=/app/sites-config.json
JWT_SECRET=your-production-secret-key-here
UPLOAD_DIR=/uploads
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✓ Created backend/.env.production${NC}"
fi

# 3. Create frontend directory structure
echo -e "${YELLOW}3. Creating frontend directory structure...${NC}"
mkdir -p "${SITE_DIR}"

# Copy from template or existing site
TEMPLATE_DIR="frontends/codersinflow.com"
if [ -d "$TEMPLATE_DIR" ]; then
    echo "Copying from template site..."
    cp -r "${TEMPLATE_DIR}"/* "${SITE_DIR}/"
    
    # Update site-specific configuration
    if [ -f "${SITE_DIR}/site.config.json" ]; then
        # Update site config with new domain info
        if command -v jq &> /dev/null; then
            jq --arg name "$SITE_NAME" \
               --arg domain "$DOMAIN" \
               --arg db "$DATABASE_NAME" \
               '.site.name = $name | 
                .site.domain = $domain | 
                .database.name = $db' \
               "${SITE_DIR}/site.config.json" > "${SITE_DIR}/site.config.tmp" && \
               mv "${SITE_DIR}/site.config.tmp" "${SITE_DIR}/site.config.json"
        fi
    fi
    
    echo -e "${GREEN}✓ Frontend directory created from template${NC}"
else
    echo -e "${YELLOW}No template found. Creating basic structure...${NC}"
    mkdir -p "${SITE_DIR}/src/pages"
    mkdir -p "${SITE_DIR}/public"
    
    # Create basic package.json
    cat > "${SITE_DIR}/package.json" << EOF
{
  "name": "${SITE_NAME}",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
EOF
    
    # Create basic astro.config.mjs
    cat > "${SITE_DIR}/astro.config.mjs" << EOF
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://${DOMAIN}'
});
EOF
    
    echo -e "${GREEN}✓ Basic frontend structure created${NC}"
fi

# 4. Create admin user configuration
echo -e "${YELLOW}4. Setting up admin user for ${SITE_NAME}...${NC}"
ADMIN_EMAIL="admin@${DOMAIN}"
ADMIN_PASSWORD=$(openssl rand -base64 12)

cat > "${SITE_DIR}/admin-credentials.txt" << EOF
Admin Credentials for ${DOMAIN}
================================
Email: ${ADMIN_EMAIL}
Password: ${ADMIN_PASSWORD}

To create admin user, run:
ADMIN_EMAIL="${ADMIN_EMAIL}" ADMIN_PASSWORD="${ADMIN_PASSWORD}" ADMIN_NAME="Admin" go run backend/cmd/init-admin/main.go
EOF

echo -e "${GREEN}✓ Admin credentials saved to ${SITE_DIR}/admin-credentials.txt${NC}"

# 5. Update Docker build script
echo -e "${YELLOW}5. Checking Docker build configuration...${NC}"
if grep -q "${DOMAIN}" scripts/build-multi-tenant.sh 2>/dev/null; then
    echo -e "${YELLOW}Site already in build script${NC}"
else
    echo -e "${YELLOW}Note: Run 'npm run build' in ${SITE_DIR} before building Docker image${NC}"
fi

# 6. Generate nginx configuration
echo -e "${YELLOW}6. Regenerating nginx configurations...${NC}"
./scripts/generate-nginx-configs.sh
echo -e "${GREEN}✓ Nginx configurations regenerated${NC}"

# 7. Summary
echo ""
echo -e "${GREEN}=== Site Successfully Added ===${NC}"
echo "Domain: ${DOMAIN}"
echo "Site Name: ${SITE_NAME}"
echo "Database: ${DATABASE_NAME}"
echo "Frontend: ${SITE_DIR}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Customize the frontend in ${SITE_DIR}"
echo "2. Build the frontend: cd ${SITE_DIR} && npm install && npm run build"
echo "3. Create admin user with credentials in ${SITE_DIR}/admin-credentials.txt"
echo "4. Build Docker image: ./scripts/build-multi-tenant.sh"
echo "5. Deploy with updated configuration"
echo "6. Point ${DOMAIN} DNS to your server"
echo "7. Setup SSL certificate: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo -e "${GREEN}Site configuration complete!${NC}"
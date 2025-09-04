#!/bin/bash

# Script to remove a site from the multi-tenant system
# Usage: ./remove-site.sh <domain>

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <domain>${NC}"
    echo "Example: $0 example.com"
    exit 1
fi

DOMAIN="$1"
SITE_DIR="frontends/${DOMAIN}"

echo -e "${YELLOW}Removing site: ${DOMAIN}${NC}"
echo -e "${RED}WARNING: This will delete all site data!${NC}"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 1
fi

# 1. Remove from sites-config.json
echo -e "${YELLOW}1. Removing from sites-config.json...${NC}"
if [ -f sites-config.json ]; then
    if command -v jq &> /dev/null; then
        jq --arg domain "$DOMAIN" 'del(.[$domain])' sites-config.json > sites-config.tmp && \
        mv sites-config.tmp sites-config.json
        echo -e "${GREEN}✓ Removed from sites-config.json${NC}"
    else
        echo -e "${YELLOW}Please manually remove ${DOMAIN} from sites-config.json${NC}"
    fi
fi

# 2. Remove from ALLOWED_DOMAINS
echo -e "${YELLOW}2. Removing from ALLOWED_DOMAINS...${NC}"
ENV_FILE="backend/.env.production"
if [ -f "$ENV_FILE" ]; then
    # Remove domain from ALLOWED_DOMAINS
    sed -i.bak "s/,${DOMAIN}//g; s/${DOMAIN},//g; s/${DOMAIN}//g" "$ENV_FILE"
    # Clean up any double commas
    sed -i "s/,,/,/g; s/,$//" "$ENV_FILE"
    echo -e "${GREEN}✓ Removed from ALLOWED_DOMAINS${NC}"
fi

# 3. Backup and remove frontend directory
echo -e "${YELLOW}3. Backing up and removing frontend directory...${NC}"
if [ -d "$SITE_DIR" ]; then
    BACKUP_DIR="backups/sites/${DOMAIN}_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$(dirname "$BACKUP_DIR")"
    mv "$SITE_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}✓ Site backed up to ${BACKUP_DIR}${NC}"
    echo -e "${GREEN}✓ Frontend directory removed${NC}"
else
    echo -e "${YELLOW}Frontend directory not found${NC}"
fi

# 4. Remove nginx configuration
echo -e "${YELLOW}4. Removing nginx configuration...${NC}"
NGINX_CONF="docker/nginx-sites/${DOMAIN}.conf"
if [ -f "$NGINX_CONF" ]; then
    BACKUP_NGINX="backups/nginx/${DOMAIN}_$(date +%Y%m%d_%H%M%S).conf"
    mkdir -p "$(dirname "$BACKUP_NGINX")"
    mv "$NGINX_CONF" "$BACKUP_NGINX"
    echo -e "${GREEN}✓ Nginx config backed up to ${BACKUP_NGINX}${NC}"
fi

# 5. Summary
echo ""
echo -e "${GREEN}=== Site Removed ===${NC}"
echo "Domain: ${DOMAIN}"
echo ""
echo -e "${YELLOW}Note:${NC}"
echo "- Site files backed up to backups/sites/"
echo "- Database '${DATABASE_NAME}' was NOT removed (manual cleanup required)"
echo "- SSL certificates were NOT removed (if applicable)"
echo "- DNS records need to be updated manually"
echo ""
echo -e "${YELLOW}To restore this site:${NC}"
echo "1. Move backup from backups/sites/ to frontends/"
echo "2. Re-run ./scripts/add-site.sh ${DOMAIN} <site-name>"
echo ""
echo -e "${GREEN}Site removal complete!${NC}"
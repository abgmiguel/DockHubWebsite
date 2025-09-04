#!/bin/bash

# Script to set up nginx on the host server for multiple Docker containers

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up host nginx for Docker containers${NC}"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing nginx...${NC}"
    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx
fi

# Get domain from user
read -p "Enter domain name (e.g., codersinflow.com): " DOMAIN

# Copy nginx config
echo -e "${YELLOW}Installing nginx configuration...${NC}"
sudo cp nginx/${DOMAIN}.conf /etc/nginx/sites-available/${DOMAIN}
sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/

# Create directories
echo -e "${YELLOW}Creating directories...${NC}"
sudo mkdir -p /var/www/${DOMAIN}/dist
sudo mkdir -p /var/www/${DOMAIN}/uploads
sudo mkdir -p /var/www/certbot

# Test nginx config
echo -e "${YELLOW}Testing nginx configuration...${NC}"
sudo nginx -t

# Get SSL certificate
echo -e "${YELLOW}Getting SSL certificate...${NC}"
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d ${DOMAIN} \
    -d www.${DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email admin@${DOMAIN}

# Reload nginx
echo -e "${YELLOW}Reloading nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}✅ Host nginx setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy your Docker container: ./deploy-docker.sh"
echo "2. The container will run on port 4001 (backend) and 4000 (frontend)"
echo "3. Nginx will proxy requests to the container"
echo ""
echo "To add more sites, run this script again with different domains"
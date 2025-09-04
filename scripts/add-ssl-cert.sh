#!/bin/bash

# Add SSL certificate for a domain using certbot
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <domain> [email]${NC}"
    echo "Example: $0 magicvideodownloader.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Certificate Generator${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}Error: certbot is not installed${NC}"
    echo "Install with: apt-get install certbot python3-certbot-nginx"
    exit 1
fi

echo -e "${YELLOW}Generating SSL certificate...${NC}"

# Generate certificate with nginx plugin
certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domains "$DOMAIN" \
    --domains "www.$DOMAIN"

echo -e "${GREEN}✅ SSL certificate generated!${NC}"
echo ""
echo "Certificate location: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo -e "${YELLOW}Reloading nginx...${NC}"
nginx -s reload

echo -e "${GREEN}✅ Done! Your domain is now secured with SSL.${NC}"
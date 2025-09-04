#!/bin/bash

# Generate self-signed certificate for fallback/development domains
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Self-Signed Certificate Generator${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running on server or locally
if [ "$1" == "server" ]; then
    CERT_DIR="/etc/nginx/ssl"
    echo -e "${YELLOW}Generating certificate on server...${NC}"
else
    CERT_DIR="nginx/ssl"
    echo -e "${YELLOW}Generating certificate locally...${NC}"
fi

# Create directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/self-signed.key" \
    -out "$CERT_DIR/self-signed.crt" \
    -subj "/C=US/ST=State/L=City/O=Development/CN=*.localhost"

echo -e "${GREEN}✅ Self-signed certificate generated!${NC}"
echo "  Certificate: $CERT_DIR/self-signed.crt"
echo "  Private Key: $CERT_DIR/self-signed.key"
echo ""
echo -e "${YELLOW}Note: This certificate is for development/fallback use only.${NC}"
echo -e "${YELLOW}Production domains should use Let's Encrypt certificates.${NC}"
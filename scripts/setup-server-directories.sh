#!/bin/bash

# Setup directory structure on production server
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Server Directory Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Base directory
BASE_DIR="/var/www/docker"

# Create base directories
echo -e "${YELLOW}Creating base directories...${NC}"
mkdir -p "$BASE_DIR"
mkdir -p "$BASE_DIR/uploads"
mkdir -p "$BASE_DIR/public"
mkdir -p "$BASE_DIR/logs"

# Get sites from sites-config.json (if it exists)
if [ -f "sites-config.json" ]; then
    echo -e "${YELLOW}Creating site-specific directories...${NC}"
    
    # Extract site IDs
    sites=$(jq -r '.[] | .id' sites-config.json | sort -u)
    
    for site in $sites; do
        echo "  📁 Setting up directories for: $site"
        
        # Public directories
        mkdir -p "$BASE_DIR/public/$site"
        mkdir -p "$BASE_DIR/public/$site/images"
        mkdir -p "$BASE_DIR/public/$site/assets"
        mkdir -p "$BASE_DIR/public/$site/downloads"
        mkdir -p "$BASE_DIR/public/$site/fonts"
        
        # Upload directories
        mkdir -p "$BASE_DIR/uploads/$site"
        mkdir -p "$BASE_DIR/uploads/blog/$site"
        mkdir -p "$BASE_DIR/uploads/blog/$site/posts"
        mkdir -p "$BASE_DIR/uploads/blog/$site/media"
        
        echo "    ✅ Created directories for $site"
    done
else
    echo -e "${YELLOW}No sites-config.json found, creating default structure...${NC}"
    
    # Create some default site directories
    for site in default codersinflow darkflows magicvideodownloader prestongarrison welcome; do
        echo "  📁 Setting up directories for: $site"
        
        # Public directories
        mkdir -p "$BASE_DIR/public/$site"
        mkdir -p "$BASE_DIR/public/$site/images"
        mkdir -p "$BASE_DIR/public/$site/assets"
        
        # Upload directories
        mkdir -p "$BASE_DIR/uploads/$site"
        mkdir -p "$BASE_DIR/uploads/blog/$site"
        
        echo "    ✅ Created directories for $site"
    done
fi

# Create shared directories
echo -e "${YELLOW}Creating shared directories...${NC}"
mkdir -p "$BASE_DIR/public/shared"
mkdir -p "$BASE_DIR/public/shared/images"
mkdir -p "$BASE_DIR/public/shared/assets"
mkdir -p "$BASE_DIR/public/shared/fonts"

# Set permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R www-data:www-data "$BASE_DIR/uploads" 2>/dev/null || true
chown -R www-data:www-data "$BASE_DIR/public" 2>/dev/null || true
chmod -R 755 "$BASE_DIR"

# Create nginx include directories
echo -e "${YELLOW}Creating nginx override directories...${NC}"
mkdir -p /etc/nginx/includes/api-overrides
mkdir -p /etc/nginx/includes/upload-overrides
mkdir -p /etc/nginx/includes/static-overrides
mkdir -p /etc/nginx/includes/route-overrides
mkdir -p /etc/nginx/includes/custom-locations
mkdir -p /etc/nginx/includes/public-overrides

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Directory Structure Created!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Base directory: $BASE_DIR"
echo ""
echo "Structure:"
echo "  📁 $BASE_DIR/"
echo "     ├── 📁 public/          # Static assets"
echo "     │   ├── 📁 {site_id}/   # Per-site public files"
echo "     │   └── 📁 shared/      # Shared public files"
echo "     ├── 📁 uploads/         # User uploads"
echo "     │   └── 📁 blog/        # Blog media"
echo "     │       └── 📁 {site_id}/"
echo "     └── 📁 logs/            # Application logs"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
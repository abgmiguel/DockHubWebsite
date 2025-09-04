#!/bin/bash

# Build production Docker image with blacklist support
set -e

# Get image name and tag from environment or use defaults
IMAGE_NAME="${DOCKER_IMAGE_NAME:-multi-tenant-app}"
TAG="${DOCKER_TAG:-latest}"

echo "🏗️  Building Production Docker Image (with blacklist)"
echo "===================================================="
echo "Image: $IMAGE_NAME:$TAG"

# Check if blacklist.txt exists
if [ ! -f "blacklist.txt" ]; then
    echo "⚠️  No blacklist.txt found, building with all sites"
    docker buildx build --platform linux/amd64 -f Dockerfile -t $IMAGE_NAME:$TAG --load .
    exit 0
fi

echo "📋 Reading blacklist..."
BLACKLISTED_SITES=$(cat blacklist.txt | grep -v '^#' | grep -v '^$' | tr '\n' ' ')
echo "🚫 Blacklisted sites: $BLACKLISTED_SITES"

# Create a temporary directory for filtered build
BUILD_DIR=".docker-build-temp"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

echo "📂 Preparing filtered build context..."

# Copy everything except blacklisted sites
echo "  Copying astro-multi-tenant..."
cp -r astro-multi-tenant $BUILD_DIR/
# Ensure scripts are executable
chmod +x $BUILD_DIR/astro-multi-tenant/scripts/*.sh 2>/dev/null || true
# Remove blacklisted sites from the copy
for site in $BLACKLISTED_SITES; do
    if [ -d "$BUILD_DIR/astro-multi-tenant/src/sites/${site}.com" ]; then
        echo "  ❌ Excluding site: ${site}.com"
        rm -rf "$BUILD_DIR/astro-multi-tenant/src/sites/${site}.com"
    fi
    if [ -d "$BUILD_DIR/astro-multi-tenant/src/sites/${site}" ]; then
        echo "  ❌ Excluding site: ${site}"
        rm -rf "$BUILD_DIR/astro-multi-tenant/src/sites/${site}"
    fi
done

# Copy backend (excluding symlinks)
echo "  Copying backend..."
rsync -a --no-links backend/ $BUILD_DIR/backend/

# Copy configuration files
echo "  Copying configuration files..."
cp sites-config.json $BUILD_DIR/
cp Dockerfile $BUILD_DIR/
cp ecosystem.config.cjs $BUILD_DIR/ 2>/dev/null || true
cp -r scripts $BUILD_DIR/

# Filter sites-config.json to exclude blacklisted sites
echo "📝 Filtering sites-config.json..."
python3 << EOF
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
    count = len(filtered_config)
else:
    # New format: array of sites
    filtered_sites = [site for site in config.get('sites', []) if site['id'] not in blacklist]
    filtered_config = {'sites': filtered_sites}
    count = len(filtered_sites)

with open('$BUILD_DIR/sites-config.json', 'w') as f:
    json.dump(filtered_config, f, indent=2)

print(f"  ✅ Filtered config: {count} sites included")
EOF

# Build the Docker image from the filtered context
echo ""
echo "📦 Building Docker image for linux/amd64..."
cd $BUILD_DIR
docker buildx build --platform linux/amd64 -f Dockerfile -t $IMAGE_NAME:$TAG --load .
cd ..

# Clean up
echo "🧹 Cleaning up temporary build directory..."
rm -rf $BUILD_DIR

echo ""
echo "✅ Build Complete!"
echo "=================="
echo "Image: $IMAGE_NAME:$TAG"
echo ""
echo "Included sites:"
for site in $(ls astro-multi-tenant/src/sites/); do
    site_id="${site%.com}"
    if ! echo "$BLACKLISTED_SITES" | grep -q "$site_id"; then
        echo "  ✓ $site"
    fi
done
echo ""
echo "To run: ./scripts/run-docker.sh"
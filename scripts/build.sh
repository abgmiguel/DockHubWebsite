#!/bin/bash

# Build production Docker image
set -e

echo "🏗️  Building Production Docker Image"
echo "===================================="

# Build the unified Docker image
echo "📦 Building multi-tenant-app:latest..."
docker build -f Dockerfile.unified-ssr -t multi-tenant-app:latest .

echo ""
echo "✅ Build Complete!"
echo "=================="
echo "Image: multi-tenant-app:latest"
echo ""
echo "To run: ./scripts/run-docker.sh"
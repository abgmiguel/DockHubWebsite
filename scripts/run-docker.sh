#!/bin/bash

# Run production Docker containers
set -e

echo "🐳 Starting Production Docker Environment"
echo "========================================"

# Start with docker-compose
docker-compose -f docker-compose.unified.yml up -d

echo ""
echo "✅ Production Environment Running!"
echo "=================================="
echo "📍 Frontend: http://localhost (port 80)"
echo "🔧 API: http://localhost:3001"
echo "💾 MongoDB: localhost:27017"
echo ""
echo "To stop: docker-compose -f docker-compose.unified.yml down"
echo "To view logs: docker-compose -f docker-compose.unified.yml logs -f"
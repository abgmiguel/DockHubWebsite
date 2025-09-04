#!/bin/sh
# Development startup script
# Generated from site.config.json via templates
set -e

echo "Starting development environment initialization..."

# Build and run init-admin to create admin user from site.config.json
echo "Checking for admin user setup..."
cd /app/backend

# Always rebuild init-admin to ensure correct architecture
echo "Building init-admin..."
go build -o init-admin cmd/init-admin/main.go

# Run init-admin to create/update admin user
echo "Initializing admin user from site.config.json..."
./init-admin || echo "Admin initialization completed or skipped"

# Return to app root
cd /app

# Start both frontend and backend in parallel (using ports from site.config.json)
echo "Starting frontend and backend development servers..."
echo "Frontend on port 4321, Backend on port 8752 (from site.config.json)"
npx astro dev --host 0.0.0.0 --port 4321 &
cd backend && air
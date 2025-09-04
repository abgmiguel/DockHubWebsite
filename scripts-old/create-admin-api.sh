#!/bin/bash

# Create admin user via API
# This script creates the admin user using the backend API

# Load configuration from site.config.json
CONFIG_FILE="site.config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: $CONFIG_FILE not found"
    exit 1
fi

# Parse JSON config using node
ADMIN_EMAIL=$(node -p "require('./$CONFIG_FILE').admin.email")
ADMIN_PASSWORD=$(node -p "require('./$CONFIG_FILE').admin.password")
ADMIN_NAME=$(node -p "require('./$CONFIG_FILE').admin.name")
DOMAIN=$(node -p "require('./$CONFIG_FILE').site.domain")

echo "Creating admin user: $ADMIN_EMAIL"

# First, try to register the admin user
curl -X POST "https://${DOMAIN}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\",\"name\":\"${ADMIN_NAME}\"}" \
  -s -o /dev/null -w "%{http_code}" || echo "Registration attempted"

echo "Admin user setup completed"
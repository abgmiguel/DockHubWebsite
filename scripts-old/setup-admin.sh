#!/bin/bash

# Setup admin user script
# This script creates the admin user for the blog system

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
DB_NAME=$(node -p "require('./$CONFIG_FILE').database.name")

# Generate password hash if bcryptjs is available
if [ -f "scripts/generate-password-hash.mjs" ]; then
    PASSWORD_HASH=$(node scripts/generate-password-hash.mjs "${ADMIN_PASSWORD}")
else
    # Fallback to hardcoded hash for F0r3st40!
    PASSWORD_HASH='$2b$10$62w9VDXA6OGXB.m7iUJ0/ewOb7AWTLXRyvXaxHq029UBvNK6QWZwi'
fi

# Create MongoDB script for admin user
cat > runtime/setup-admin.mongo << EOF
use ${DB_NAME};

// Delete existing admin user if exists
db.users.deleteOne({ email: "${ADMIN_EMAIL}" });

// Create admin user
db.users.insertOne({
  email: "${ADMIN_EMAIL}",
  password: "${PASSWORD_HASH}",
  name: "${ADMIN_NAME}",
  role: "admin",
  approved: true,
  created_at: new Date(),
  updated_at: new Date()
});

print("Admin user created successfully");
EOF

echo "Admin setup script created at runtime/setup-admin.mongo"
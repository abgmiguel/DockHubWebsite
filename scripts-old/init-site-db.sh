#!/bin/bash

# Initialize database for a new site
# Usage: ./init-site-db.sh <domain> <database-name> <admin-email> <admin-password>

set -e

DOMAIN="$1"
DB_NAME="$2"
ADMIN_EMAIL="$3"
ADMIN_PASSWORD="$4"

echo "Initializing database for ${DOMAIN}..."

# Create MongoDB indexes and collections
mongo "${DB_NAME}" --eval "
db.createCollection('users');
db.createCollection('posts');
db.createCollection('categories');
db.createCollection('media');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ published: 1, createdAt: -1 });
"

# Create default categories
mongo "${DB_NAME}" --eval "
db.categories.insertMany([
  { name: 'General', slug: 'general', type: 'blog', createdAt: new Date() },
  { name: 'News', slug: 'news', type: 'blog', createdAt: new Date() },
  { name: 'Tutorials', slug: 'tutorials', type: 'blog', createdAt: new Date() },
  { name: 'Getting Started', slug: 'getting-started', type: 'docs', createdAt: new Date() }
]);
"

# Initialize admin user
MONGODB_URI="mongodb://localhost:27017/${DB_NAME}" \
ADMIN_EMAIL="${ADMIN_EMAIL}" \
ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
ADMIN_NAME="Admin" \
go run backend/cmd/init-admin/main.go

echo "Database initialized for ${DOMAIN}"
#!/bin/bash

# Process templates by replacing variables from site.config.json
# This script reads templates and generates final configuration files

set -e

# Check for jq
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed"
    exit 1
fi

# Check for site.config.json
if [ ! -f "site.config.json" ]; then
    echo "Error: site.config.json not found"
    exit 1
fi

# Read configuration from site.config.json
export SITE_NAME=$(jq -r '.site.name' site.config.json)
export DISPLAY_NAME=$(jq -r '.site.displayName' site.config.json)
export DOMAIN=$(jq -r '.site.domain' site.config.json)
export FRONTEND_PORT=$(jq -r '.ports.frontend' site.config.json)
export BACKEND_PORT=$(jq -r '.ports.backend' site.config.json)
export MONGODB_PORT=$(jq -r '.ports.mongodb' site.config.json)
export DB_NAME=$(jq -r '.database.name' site.config.json)
export FRONTEND_URL="https://${DOMAIN}"
export BACKEND_URL="https://${DOMAIN}"
export SERVER_USER=$(jq -r '.deployment.server.user // "root"' site.config.json)
export SERVER_HOST=$(jq -r '.deployment.server.host // "your-server.com"' site.config.json)
export SERVER_PORT=$(jq -r '.deployment.server.port // 22' site.config.json)
export SERVER_PATH=$(jq -r '.deployment.server.path // "/var/www/\(.site.domain)"' site.config.json)

# Generate secure passwords if not already set
if [ -z "${MONGO_PASSWORD}" ]; then
    export MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
fi

if [ -z "${JWT_SECRET}" ]; then
    export JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
fi

# Function to process a template file
process_template() {
    local template_file=$1
    local output_file=$2
    
    echo "Processing template: $template_file -> $output_file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Copy template to temp file
    cp "$template_file" "$temp_file"
    
    # Replace all variables
    sed -i.bak "s|{{SITE_NAME}}|${SITE_NAME}|g" "$temp_file"
    sed -i.bak "s|{{DISPLAY_NAME}}|${DISPLAY_NAME}|g" "$temp_file"
    sed -i.bak "s|{{DOMAIN}}|${DOMAIN}|g" "$temp_file"
    sed -i.bak "s|{{FRONTEND_PORT}}|${FRONTEND_PORT}|g" "$temp_file"
    sed -i.bak "s|{{BACKEND_PORT}}|${BACKEND_PORT}|g" "$temp_file"
    sed -i.bak "s|{{MONGODB_PORT}}|${MONGODB_PORT}|g" "$temp_file"
    sed -i.bak "s|{{DB_NAME}}|${DB_NAME}|g" "$temp_file"
    sed -i.bak "s|{{FRONTEND_URL}}|${FRONTEND_URL}|g" "$temp_file"
    sed -i.bak "s|{{BACKEND_URL}}|${BACKEND_URL}|g" "$temp_file"
    sed -i.bak "s|{{SERVER_PATH}}|${SERVER_PATH}|g" "$temp_file"
    sed -i.bak "s|{{MONGO_PASSWORD}}|${MONGO_PASSWORD}|g" "$temp_file"
    sed -i.bak "s|{{JWT_SECRET}}|${JWT_SECRET}|g" "$temp_file"
    
    # Move to output file
    mv "$temp_file" "$output_file"
    
    # Clean up backup files
    rm -f "$temp_file.bak"
}

# Create output directory
mkdir -p generated-configs

# Process all templates
if [ -d "templates" ]; then
    # Process docker-compose
    if [ -f "templates/docker-compose.prod.yml.template" ]; then
        process_template "templates/docker-compose.prod.yml.template" "docker-compose.prod.yml"
    fi
    
    # Process nginx config
    if [ -f "templates/nginx-site.conf.template" ]; then
        process_template "templates/nginx-site.conf.template" "generated-configs/nginx-site.conf"
    fi
    
    # Process .env file
    if [ -f "templates/.env.template" ]; then
        process_template "templates/.env.template" ".env"
    fi
    
    # Process systemd services
    if [ -f "templates/backend.service.template" ]; then
        process_template "templates/backend.service.template" "generated-configs/${SITE_NAME}-backend.service"
    fi
    if [ -f "templates/frontend.service.template" ]; then
        process_template "templates/frontend.service.template" "generated-configs/${SITE_NAME}-frontend.service"
    fi
else
    echo "Warning: templates directory not found"
fi

echo "✅ All templates processed successfully"

# Export the passwords for use by other scripts
echo "export MONGO_PASSWORD='${MONGO_PASSWORD}'" > generated-configs/passwords.sh
echo "export JWT_SECRET='${JWT_SECRET}'" >> generated-configs/passwords.sh
chmod 600 generated-configs/passwords.sh

echo "🔐 Passwords saved to generated-configs/passwords.sh"
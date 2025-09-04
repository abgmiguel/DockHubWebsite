#!/bin/bash

# Process Docker templates by replacing variables from site.config.json
# This script reads templates and generates Docker configuration files

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

# Development ports
export DEV_FRONTEND_PORT=$(jq -r '.development.frontend.port' site.config.json)
export DEV_BACKEND_PORT=$(jq -r '.development.backend.port' site.config.json)
export DEV_MONGODB_PORT=$(jq -r '.development.mongodb.port' site.config.json)

# Server configuration
export SERVER_USER=$(jq -r '.deployment.server.user // "root"' site.config.json)
export SERVER_HOST=$(jq -r '.deployment.server.host // "your-server.com"' site.config.json)
export SERVER_PORT=$(jq -r '.deployment.server.port // 22' site.config.json)
export SERVER_PATH=$(jq -r '.deployment.server.path // "/var/www/\(.site.domain)"' site.config.json)

# Docker Hub username (can be overridden by environment)
export DOCKER_USERNAME=${DOCKER_USERNAME:-$(jq -r '.deployment.docker.username // "yourusername"' site.config.json)}

# Generate secure passwords if not already set
if [ -z "${MONGO_PASSWORD}" ]; then
    export MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/\n" | cut -c1-25)
fi

if [ -z "${JWT_SECRET}" ]; then
    export JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/\n" | cut -c1-50)
fi

# Function to process a template file
process_template() {
    local template_file=$1
    local output_file=$2
    
    echo "Processing template: $template_file -> $output_file"
    
    # Create output directory if needed
    output_dir=$(dirname "$output_file")
    [ ! -d "$output_dir" ] && mkdir -p "$output_dir"
    
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
    sed -i.bak "s|{{DEV_FRONTEND_PORT}}|${DEV_FRONTEND_PORT}|g" "$temp_file"
    sed -i.bak "s|{{DEV_BACKEND_PORT}}|${DEV_BACKEND_PORT}|g" "$temp_file"
    sed -i.bak "s|{{DEV_MONGODB_PORT}}|${DEV_MONGODB_PORT}|g" "$temp_file"
    sed -i.bak "s|{{DB_NAME}}|${DB_NAME}|g" "$temp_file"
    sed -i.bak "s|{{SERVER_PATH}}|${SERVER_PATH}|g" "$temp_file"
    sed -i.bak "s|{{MONGO_PASSWORD}}|${MONGO_PASSWORD}|g" "$temp_file"
    sed -i.bak "s|{{JWT_SECRET}}|${JWT_SECRET}|g" "$temp_file"
    sed -i.bak "s|{{DOCKER_USERNAME}}|${DOCKER_USERNAME}|g" "$temp_file"
    
    # Move to output file
    mv "$temp_file" "$output_file"
    
    # Clean up backup files
    rm -f "$temp_file.bak"
}

echo "🚀 Processing Docker templates from site.config.json..."
echo "📦 Site: ${DISPLAY_NAME} (${DOMAIN})"

# Process Docker templates
if [ -d "templates/docker" ]; then
    # Docker Compose files
    if [ -f "templates/docker/docker-compose.dev.yml.template" ]; then
        process_template "templates/docker/docker-compose.dev.yml.template" "docker-compose.dev.yml"
    fi
    
    if [ -f "templates/docker/docker-compose.production.yml.template" ]; then
        process_template "templates/docker/docker-compose.production.yml.template" "docker-compose.production.yml"
    fi
    
    # Environment files
    if [ -f "templates/docker/.env.development.template" ]; then
        process_template "templates/docker/.env.development.template" ".env.development"
    fi
    
    if [ -f "templates/docker/.env.production.template" ]; then
        process_template "templates/docker/.env.production.template" ".env.production"
    fi
    
    # Startup script
    if [ -f "templates/docker/dev-startup.sh.template" ]; then
        process_template "templates/docker/dev-startup.sh.template" "docker/dev-startup.sh"
        chmod +x docker/dev-startup.sh
    fi
else
    echo "Warning: templates/docker directory not found"
fi

# Process backend templates
if [ -d "templates/backend" ]; then
    if [ -f "templates/backend/.air.toml.template" ]; then
        process_template "templates/backend/.air.toml.template" "backend/.air.toml"
    fi
else
    echo "Warning: templates/backend directory not found"
fi

# Process nginx templates
if [ -d "templates/nginx" ]; then
    # Look for template with site name placeholder
    template_file="templates/nginx/{{SITE_NAME}}.conf.template"
    if [ -f "$template_file" ]; then
        # Output with actual site name
        output_file="nginx/${DOMAIN}.conf"
        process_template "$template_file" "$output_file"
    fi
else
    echo "Warning: templates/nginx directory not found"
fi

echo "✅ All Docker templates processed successfully"

# Save passwords for later use
mkdir -p generated-configs
echo "export MONGO_PASSWORD='${MONGO_PASSWORD}'" > generated-configs/docker-passwords.sh
echo "export JWT_SECRET='${JWT_SECRET}'" >> generated-configs/docker-passwords.sh
echo "export DOCKER_USERNAME='${DOCKER_USERNAME}'" >> generated-configs/docker-passwords.sh
chmod 600 generated-configs/docker-passwords.sh

echo "🔐 Passwords saved to generated-configs/docker-passwords.sh"

# Display summary
echo ""
echo "📋 Configuration Summary:"
echo "  Site Name: ${DISPLAY_NAME}"
echo "  Domain: ${DOMAIN}"
echo ""
echo "🔌 Development Ports:"
echo "  Frontend: ${DEV_FRONTEND_PORT}"
echo "  Backend: ${DEV_BACKEND_PORT}"
echo "  MongoDB: ${DEV_MONGODB_PORT}"
echo ""
echo "🔌 Production Ports:"
echo "  Frontend: ${FRONTEND_PORT}"
echo "  Backend: ${BACKEND_PORT}"
echo "  MongoDB: ${MONGODB_PORT}"
echo ""
echo "🚀 Next Steps:"
echo "  Development: docker-compose -f docker-compose.dev.yml up"
echo "  Production: ./deploy-docker.sh"
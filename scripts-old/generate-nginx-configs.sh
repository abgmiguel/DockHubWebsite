#!/bin/bash

# Generate nginx configurations for all sites in multi-tenant setup
# This reads sites-config.json and creates nginx configs from template

set -e

# Configuration
TEMPLATE_FILE="templates/nginx-multi-tenant.conf.template"
OUTPUT_DIR="nginx/sites-available"
ENABLED_DIR="nginx/sites-enabled"
CONTAINER_PORT="${CONTAINER_PORT:-8000}"  # Multi-tenant container port (not 80!)
MAX_UPLOAD_SIZE="${MAX_UPLOAD_SIZE:-100M}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Nginx Configuration Generator${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if sites-config.json exists
if [ ! -f "sites-config.json" ]; then
    echo -e "${RED}Error: sites-config.json not found${NC}"
    exit 1
fi

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}Error: Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Create output directories
mkdir -p "$OUTPUT_DIR" "$ENABLED_DIR" "nginx/includes"

# Parse sites-config.json and generate configs
echo -e "${YELLOW}Generating nginx configurations...${NC}"

# Use jq to parse JSON
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed${NC}"
    echo "Install with: apt-get install jq (Ubuntu) or brew install jq (Mac)"
    exit 1
fi

# Get all domains from sites-config.json
domains=$(jq -r 'keys[]' sites-config.json)

for domain in $domains; do
    echo -n "Processing $domain... "
    
    # Get site info
    site_info=$(jq -r ".\"$domain\"" sites-config.json)
    site_name=$(echo "$site_info" | jq -r '.id')
    
    # Generate config from template
    config_file="$OUTPUT_DIR/${domain}.conf"
    
    # Replace template variables
    sed -e "s/{{DOMAIN}}/${domain}/g" \
        -e "s/{{SITE_NAME}}/${site_name}/g" \
        -e "s/{{CONTAINER_PORT}}/${CONTAINER_PORT}/g" \
        -e "s/{{MAX_UPLOAD_SIZE}}/${MAX_UPLOAD_SIZE}/g" \
        "$TEMPLATE_FILE" > "$config_file"
    
    # Check if custom include exists
    if [ -f "nginx/includes/${domain}.conf" ]; then
        echo -e "${GREEN}✓ (with custom include)${NC}"
    else
        echo -e "${GREEN}✓${NC}"
        # Create empty include file with helpful comments
        cat > "nginx/includes/${domain}.conf" << EOF
# Custom nginx configuration for ${domain}
# Add any domain-specific locations, upstreams, or configurations here
# Examples:
#   - WebSocket endpoints
#   - API proxies to other services
#   - Special caching rules
#   - Admin interfaces
#   - Static file serving from different locations

# Example WebSocket configuration:
# location /ws {
#     proxy_pass http://websocket_server;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade \$http_upgrade;
#     proxy_set_header Connection "upgrade";
# }
EOF
    fi
done

echo ""
echo -e "${GREEN}Generated configs for $(echo "$domains" | wc -w) domains${NC}"

# Create master nginx config that includes all sites
echo -e "${YELLOW}Creating master nginx configuration...${NC}"

cat > "nginx/nginx.conf" << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml 
               text/javascript application/vnd.ms-fontobject 
               application/x-font-ttf font/opentype;

    # Include all site configurations
    include /etc/nginx/sites-enabled/*.conf;
}
EOF

echo -e "${GREEN}✓ Master nginx.conf created${NC}"

# Create symlinks to enable sites
echo -e "${YELLOW}Enabling sites...${NC}"
for config in "$OUTPUT_DIR"/*.conf; do
    if [ -f "$config" ]; then
        basename=$(basename "$config")
        ln -sf "$(pwd)/$config" "$ENABLED_DIR/$basename" 2>/dev/null || true
        echo -e "  Enabled: $basename"
    fi
done

# Create installation script
echo -e "${YELLOW}Creating installation script...${NC}"

cat > "nginx/install-nginx-configs.sh" << 'EOF'
#!/bin/bash

# Install nginx configurations on the host system

echo "Installing nginx configurations..."

# Backup existing configs
if [ -d "/etc/nginx/sites-available" ]; then
    sudo cp -r /etc/nginx/sites-available /etc/nginx/sites-available.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy configurations
sudo cp -r nginx/sites-available/* /etc/nginx/sites-available/
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Copy custom includes
sudo mkdir -p /etc/nginx/includes
sudo cp -r nginx/includes/* /etc/nginx/includes/

# Enable sites
for conf in /etc/nginx/sites-available/*.conf; do
    if [ -f "$conf" ]; then
        basename=$(basename "$conf")
        sudo ln -sf "$conf" "/etc/nginx/sites-enabled/$basename"
    fi
done

# Test configuration
if sudo nginx -t; then
    echo "Configuration valid. Reloading nginx..."
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully!"
else
    echo "Configuration error! Please check the configs."
    exit 1
fi
EOF

chmod +x nginx/install-nginx-configs.sh

echo -e "${GREEN}✓ Installation script created${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration Generation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Generated files:"
echo "  - nginx/nginx.conf (master config)"
echo "  - nginx/sites-available/*.conf (site configs)"
echo "  - nginx/sites-enabled/* (symlinks)"
echo "  - nginx/includes/*.conf (custom domain includes)"
echo "  - nginx/install-nginx-configs.sh (installation script)"
echo ""
echo -e "${YELLOW}To install on your server:${NC}"
echo "  1. Copy nginx/ directory to your server"
echo "  2. Run: sudo ./nginx/install-nginx-configs.sh"
echo ""
echo -e "${YELLOW}To add a new domain:${NC}"
echo "  1. Add domain to sites-config.json"
echo "  2. Run: ./scripts/generate-nginx-configs.sh"
echo "  3. Deploy updated configs to server"
echo ""
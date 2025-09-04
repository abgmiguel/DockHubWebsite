#!/bin/bash

# Setup Docker directories in /var/www/docker/
# Run this on the production server before deploying

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setting up Docker directories${NC}"
echo -e "${GREEN}========================================${NC}"

# Base directory
BASE_DIR="/var/www/docker"

echo -e "${YELLOW}Creating directories in ${BASE_DIR}...${NC}"

# Create base directory
sudo mkdir -p ${BASE_DIR}

# Create subdirectories with proper permissions
sudo mkdir -p ${BASE_DIR}/mongodb-data
sudo mkdir -p ${BASE_DIR}/uploads
sudo mkdir -p ${BASE_DIR}/logs

# Set ownership for MongoDB (usually runs as UID 999)
echo -e "${YELLOW}Setting MongoDB permissions...${NC}"
sudo chown -R 999:999 ${BASE_DIR}/mongodb-data

# Set ownership for uploads and logs (www-data or your app user)
echo -e "${YELLOW}Setting app permissions...${NC}"
sudo chown -R 1000:1000 ${BASE_DIR}/uploads
sudo chown -R 1000:1000 ${BASE_DIR}/logs

# Copy sites-config.json to the docker directory
echo -e "${YELLOW}Copying configuration...${NC}"
if [ -f "sites-config.json" ]; then
    sudo cp sites-config.json ${BASE_DIR}/sites-config.json
    sudo chmod 644 ${BASE_DIR}/sites-config.json
    echo -e "${GREEN}✓ Copied sites-config.json${NC}"
else
    echo -e "${RED}Warning: sites-config.json not found in current directory${NC}"
    echo -e "${YELLOW}You'll need to copy it manually:${NC}"
    echo "  sudo cp /path/to/sites-config.json ${BASE_DIR}/sites-config.json"
fi

# Create a backup directory structure
echo -e "${YELLOW}Creating backup directory...${NC}"
sudo mkdir -p ${BASE_DIR}/backups/mongodb
sudo mkdir -p ${BASE_DIR}/backups/uploads

# Set permissions for backups
sudo chmod 755 ${BASE_DIR}/backups

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Directory setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Created directories:"
echo "  📁 ${BASE_DIR}/mongodb-data  - MongoDB data files"
echo "  📁 ${BASE_DIR}/uploads       - User uploaded files"
echo "  📁 ${BASE_DIR}/logs          - Application logs"
echo "  📁 ${BASE_DIR}/backups       - Backup directory"
echo "  📄 ${BASE_DIR}/sites-config.json - Site configuration"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy your docker-compose.yml to the server"
echo "2. Run: docker-compose up -d"
echo ""
echo -e "${YELLOW}To backup MongoDB:${NC}"
echo "  docker exec mongodb-prod mongodump --out /data/db/backup"
echo "  sudo cp -r ${BASE_DIR}/mongodb-data/backup ${BASE_DIR}/backups/mongodb/\$(date +%Y%m%d)"
echo ""
echo -e "${YELLOW}To backup uploads:${NC}"
echo "  sudo tar -czf ${BASE_DIR}/backups/uploads/uploads-\$(date +%Y%m%d).tar.gz -C ${BASE_DIR} uploads"
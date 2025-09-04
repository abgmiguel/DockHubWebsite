#!/bin/bash

# Remove a site from the multi-tenant platform

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo "Usage: $0 <domain>"
    echo ""
    echo "Remove a site from the multi-tenant platform"
    echo ""
    echo "Example:"
    echo "  $0 example.com"
}

# Parse arguments
DOMAIN="$1"

if [ -z "$DOMAIN" ] || [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_usage
    exit 0
fi

echo -e "${YELLOW}⚠️  Removing site: $DOMAIN${NC}"
echo "=================================="
echo ""

# Confirm removal
read -p "Are you sure you want to remove this site? This cannot be undone. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Detect if we're in the wrong directory and adjust paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if we're being run from the astro-multi-tenant subdirectory
if [ -d "../scripts" ] && [ -f "../package.json" ] && [ -d "src/sites" ]; then
    echo -e "${YELLOW}Warning: Script is being run from astro-multi-tenant subdirectory${NC}"
    echo -e "${YELLOW}Adjusting to run from project root...${NC}"
    cd ..
    PROJECT_ROOT="$(pwd)"
fi

# Now check if we're in the right place
if [ ! -d "astro-multi-tenant" ] || [ ! -d "scripts" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    echo "Current directory: $(pwd)"
    echo "Please cd to the project root and try again."
    exit 1
fi

# Remove site directory
SITE_DIR="astro-multi-tenant/src/sites/$DOMAIN"
if [ -d "$SITE_DIR" ]; then
    echo -e "${RED}🗑️  Removing site directory...${NC}"
    rm -rf "$SITE_DIR"
    echo -e "${GREEN}✅ Site directory removed${NC}"
else
    echo -e "${YELLOW}⚠️  Site directory not found: $SITE_DIR${NC}"
fi

# Remove from sites-config.json
SITES_CONFIG="sites-config.json"
if [ -f "$SITES_CONFIG" ]; then
    echo -e "${RED}📝 Removing from configuration...${NC}"
    
    # Create timestamped backup
    BACKUP_FILE="${SITES_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$SITES_CONFIG" "$BACKUP_FILE"
    echo -e "${BLUE}📋 Created backup: $BACKUP_FILE${NC}"
    
    # Count entries before removal for validation
    BEFORE_COUNT=$(node -e "const c = require('./$SITES_CONFIG'); console.log(Object.keys(c).length)")
    
    # Use Node.js to remove entries with error handling
    node -e "
        const fs = require('fs');
        try {
            const config = JSON.parse(fs.readFileSync('$SITES_CONFIG', 'utf8'));
            
            // Save original count
            const originalCount = Object.keys(config).length;
            
            // Extract site ID from domain (remove .com, .org, etc.)
            const siteId = '$DOMAIN'.split('.')[0];
            
            // Check if site exists
            if (!config['$DOMAIN'] && !config['www.$DOMAIN'] && !config[siteId + '.localhost']) {
                console.log('⚠️  Site $DOMAIN not found in configuration');
                process.exit(0);
            }
            
            // Remove all variants: domain, www.domain, and localhost
            let removedCount = 0;
            if (config['$DOMAIN']) { delete config['$DOMAIN']; removedCount++; }
            if (config['www.$DOMAIN']) { delete config['www.$DOMAIN']; removedCount++; }
            if (config[siteId + '.localhost']) { delete config[siteId + '.localhost']; removedCount++; }
            
            // Validate we're only removing what we expect (max 3 entries per site)
            if (removedCount > 3) {
                console.error('❌ Error: Attempting to remove too many entries (' + removedCount + ')');
                process.exit(1);
            }
            
            // Validate final count
            const finalCount = Object.keys(config).length;
            if (finalCount < originalCount - 3 || finalCount < 1) {
                console.error('❌ Error: Removal would result in unexpected data loss');
                console.error('   Original: ' + originalCount + ', Expected: ' + (originalCount - removedCount) + ', Got: ' + finalCount);
                process.exit(1);
            }
            
            fs.writeFileSync('$SITES_CONFIG', JSON.stringify(config, null, 2));
            console.log('✅ Successfully removed ' + removedCount + ' entries for $DOMAIN');
        } catch (e) {
            console.error('❌ Error updating configuration:', e.message);
            // Restore backup on error
            fs.copyFileSync('$BACKUP_FILE', '$SITES_CONFIG');
            console.log('🔄 Restored from backup due to error');
            process.exit(1);
        }
    " || {
        echo -e "${RED}❌ Failed to update configuration${NC}"
        echo -e "${YELLOW}Restoring from backup...${NC}"
        cp "$BACKUP_FILE" "$SITES_CONFIG"
        exit 1
    }
    
    # Verify the file is valid JSON after modification
    node -e "JSON.parse(require('fs').readFileSync('$SITES_CONFIG', 'utf8'))" || {
        echo -e "${RED}❌ Configuration file corrupted, restoring backup${NC}"
        cp "$BACKUP_FILE" "$SITES_CONFIG"
        exit 1
    }
else
    echo -e "${YELLOW}⚠️  Configuration file not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Site removed successfully!${NC}"
echo ""
echo "The site has been removed from:"
echo "  • Site directory: $SITE_DIR"
echo "  • Configuration: $SITES_CONFIG"
echo ""
echo "Note: If you had any custom nginx configs or database data,"
echo "those may need to be cleaned up separately."
#!/bin/bash

# Site Management Script for Multi-Tenant System
# Provides interactive management of all sites

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to display header
show_header() {
    clear
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}     Multi-Tenant Site Manager${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Function to list all sites
list_sites() {
    show_header
    echo -e "${YELLOW}Current Sites:${NC}"
    echo ""
    
    if [ ! -f sites-config.json ] || [ "$(cat sites-config.json)" == "{}" ]; then
        echo -e "${RED}No sites configured${NC}"
    else
        # Use jq to parse and display sites
        if command -v jq &> /dev/null; then
            sites=$(jq -r 'to_entries[] | "\(.key)|\(.value.id)|\(.value.database)"' sites-config.json)
            
            if [ -z "$sites" ]; then
                echo -e "${RED}No sites configured${NC}"
            else
                printf "%-30s %-20s %-20s\n" "Domain" "Site ID" "Database"
                printf "%-30s %-20s %-20s\n" "------------------------------" "--------------------" "--------------------"
                
                while IFS='|' read -r domain id database; do
                    printf "%-30s %-20s %-20s\n" "$domain" "$id" "$database"
                    
                    # Check if frontend directory exists
                    if [ -d "frontends/${domain}" ]; then
                        echo -e "  ${GREEN}✓ Frontend directory exists${NC}"
                    else
                        echo -e "  ${RED}✗ Frontend directory missing${NC}"
                    fi
                    
                    # Check if nginx config exists
                    if [ -f "nginx/sites-available/${domain}.conf" ]; then
                        echo -e "  ${GREEN}✓ Nginx config exists${NC}"
                    else
                        echo -e "  ${YELLOW}⚠ Nginx config missing${NC}"
                    fi
                    
                    # Check if custom include exists
                    if [ -f "nginx/includes/${domain}.conf" ] && [ -s "nginx/includes/${domain}.conf" ]; then
                        # Check if it has actual content (not just comments)
                        if grep -v '^#' "nginx/includes/${domain}.conf" | grep -q '[^[:space:]]'; then
                            echo -e "  ${BLUE}◆ Has custom nginx routes${NC}"
                        fi
                    fi
                    echo ""
                done <<< "$sites"
                
                # Show total count
                count=$(echo "$sites" | wc -l)
                echo -e "${CYAN}Total sites: ${count}${NC}"
            fi
        else
            echo -e "${RED}jq is required. Install with: apt-get install jq${NC}"
            cat sites-config.json
        fi
    fi
    echo ""
}

# Function to add a site
add_site() {
    show_header
    echo -e "${GREEN}Add New Site${NC}"
    echo ""
    
    read -p "Enter domain (e.g., example.com): " domain
    read -p "Enter site name (e.g., example): " site_name
    read -p "Enter database name (default: ${site_name}_db): " db_name
    db_name=${db_name:-${site_name}_db}
    
    echo ""
    echo "Adding site with:"
    echo "  Domain: $domain"
    echo "  Site Name: $site_name"
    echo "  Database: $db_name"
    echo ""
    
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/add-site.sh "$domain" "$site_name" "$db_name"
        echo ""
        echo -e "${GREEN}Site added successfully!${NC}"
    else
        echo "Cancelled"
    fi
}

# Function to remove a site
remove_site() {
    show_header
    echo -e "${RED}Remove Site${NC}"
    echo ""
    
    # List sites first
    if [ ! -f sites-config.json ] || [ "$(cat sites-config.json)" == "{}" ]; then
        echo -e "${RED}No sites to remove${NC}"
        return
    fi
    
    # Show available sites
    domains=$(jq -r 'keys[]' sites-config.json 2>/dev/null || echo "")
    if [ -z "$domains" ]; then
        echo -e "${RED}No sites configured${NC}"
        return
    fi
    
    echo "Available sites:"
    echo "$domains" | nl -w2 -s'. '
    echo ""
    
    read -p "Enter domain to remove (or number): " choice
    
    # Check if user entered a number
    if [[ "$choice" =~ ^[0-9]+$ ]]; then
        domain=$(echo "$domains" | sed -n "${choice}p")
    else
        domain="$choice"
    fi
    
    if [ -z "$domain" ]; then
        echo -e "${RED}Invalid selection${NC}"
        return
    fi
    
    echo ""
    echo -e "${RED}WARNING: This will remove site: ${domain}${NC}"
    read -p "Are you sure? (yes/no) " -r
    if [[ $REPLY == "yes" ]]; then
        ./scripts/remove-site.sh "$domain"
        echo ""
        echo -e "${GREEN}Site removed successfully!${NC}"
    else
        echo "Cancelled"
    fi
}

# Function to reset all sites
reset_all() {
    show_header
    echo -e "${RED}⚠️  DANGER ZONE ⚠️${NC}"
    echo ""
    echo -e "${RED}This will remove ALL configured sites!${NC}"
    echo ""
    
    # List current sites
    if [ -f sites-config.json ] && [ "$(cat sites-config.json)" != "{}" ]; then
        domains=$(jq -r 'keys[]' sites-config.json 2>/dev/null || echo "")
        if [ -n "$domains" ]; then
            echo "Sites to be removed:"
            echo "$domains" | while read -r domain; do
                echo "  - $domain"
            done
            echo ""
        fi
    else
        echo "No sites currently configured."
        return
    fi
    
    echo -e "${RED}This action cannot be undone!${NC}"
    echo "Type 'RESET ALL SITES' to confirm:"
    read -r confirmation
    
    if [ "$confirmation" == "RESET ALL SITES" ]; then
        echo ""
        echo "Creating backup..."
        
        # Create backup
        backup_dir="backups/reset_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        # Backup sites-config.json
        if [ -f sites-config.json ]; then
            cp sites-config.json "$backup_dir/"
        fi
        
        # Backup all frontend directories
        if [ -d frontends ]; then
            cp -r frontends "$backup_dir/"
        fi
        
        # Backup nginx configs
        if [ -d nginx ]; then
            cp -r nginx "$backup_dir/"
        fi
        
        echo -e "${GREEN}Backup created in ${backup_dir}${NC}"
        echo ""
        
        # Remove each site
        if [ -n "$domains" ]; then
            echo "$domains" | while read -r domain; do
                echo "Removing $domain..."
                ./scripts/remove-site.sh "$domain" 2>/dev/null || true
            done
        fi
        
        # Reset sites-config.json
        echo "{}" > sites-config.json
        
        # Clean up directories
        rm -rf frontends/*
        rm -f nginx/sites-available/*.conf
        rm -f nginx/sites-enabled/*.conf
        rm -f nginx/includes/*.conf
        
        # Reset ALLOWED_DOMAINS in .env.production
        if [ -f backend/.env.production ]; then
            sed -i.bak 's/^ALLOWED_DOMAINS=.*/ALLOWED_DOMAINS=/' backend/.env.production
        fi
        
        echo ""
        echo -e "${GREEN}All sites have been reset!${NC}"
        echo -e "${YELLOW}Backup saved to: ${backup_dir}${NC}"
    else
        echo "Cancelled - confirmation did not match"
    fi
}

# Function to generate nginx configs
generate_nginx() {
    show_header
    echo -e "${BLUE}Generating Nginx Configurations${NC}"
    echo ""
    
    ./scripts/generate-nginx-configs.sh
    
    echo ""
    echo -e "${GREEN}Nginx configurations generated!${NC}"
}

# Function to show site details
show_site_details() {
    show_header
    echo -e "${BLUE}Site Details${NC}"
    echo ""
    
    if [ ! -f sites-config.json ] || [ "$(cat sites-config.json)" == "{}" ]; then
        echo -e "${RED}No sites configured${NC}"
        return
    fi
    
    domains=$(jq -r 'keys[]' sites-config.json 2>/dev/null || echo "")
    if [ -z "$domains" ]; then
        echo -e "${RED}No sites configured${NC}"
        return
    fi
    
    echo "Select a site to view details:"
    echo "$domains" | nl -w2 -s'. '
    echo ""
    
    read -p "Enter number or domain: " choice
    
    # Check if user entered a number
    if [[ "$choice" =~ ^[0-9]+$ ]]; then
        domain=$(echo "$domains" | sed -n "${choice}p")
    else
        domain="$choice"
    fi
    
    if [ -z "$domain" ]; then
        echo -e "${RED}Invalid selection${NC}"
        return
    fi
    
    echo ""
    echo -e "${CYAN}Details for ${domain}:${NC}"
    echo ""
    
    # Show configuration
    jq ".\"${domain}\"" sites-config.json
    
    # Check various aspects
    echo ""
    echo -e "${YELLOW}Status Checks:${NC}"
    
    # Frontend directory
    if [ -d "frontends/${domain}" ]; then
        echo -e "  ${GREEN}✓${NC} Frontend directory exists"
        file_count=$(find "frontends/${domain}" -type f | wc -l)
        echo "    Files: $file_count"
    else
        echo -e "  ${RED}✗${NC} Frontend directory missing"
    fi
    
    # Nginx config
    if [ -f "nginx/sites-available/${domain}.conf" ]; then
        echo -e "  ${GREEN}✓${NC} Nginx config exists"
    else
        echo -e "  ${RED}✗${NC} Nginx config missing"
    fi
    
    # Custom includes
    if [ -f "nginx/includes/${domain}.conf" ]; then
        echo -e "  ${GREEN}✓${NC} Custom include file exists"
        custom_routes=$(grep -c "location" "nginx/includes/${domain}.conf" 2>/dev/null || echo "0")
        if [ "$custom_routes" -gt 0 ]; then
            echo "    Custom routes: $custom_routes"
        fi
    fi
    
    # Admin credentials
    if [ -f "frontends/${domain}/admin-credentials.txt" ]; then
        echo -e "  ${GREEN}✓${NC} Admin credentials file exists"
    fi
    
    echo ""
}

# Main menu
main_menu() {
    while true; do
        show_header
        echo "Select an option:"
        echo ""
        echo "  1) List all sites"
        echo "  2) Add a new site"
        echo "  3) Remove a site"
        echo "  4) Show site details"
        echo "  5) Generate nginx configs"
        echo "  6) Reset ALL sites (danger!)"
        echo "  0) Exit"
        echo ""
        
        read -p "Enter choice [0-6]: " choice
        
        case $choice in
            1) list_sites; read -p "Press Enter to continue..." ;;
            2) add_site; read -p "Press Enter to continue..." ;;
            3) remove_site; read -p "Press Enter to continue..." ;;
            4) show_site_details; read -p "Press Enter to continue..." ;;
            5) generate_nginx; read -p "Press Enter to continue..." ;;
            6) reset_all; read -p "Press Enter to continue..." ;;
            0) echo "Goodbye!"; exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}"; sleep 1 ;;
        esac
    done
}

# Check for command line arguments
if [ $# -gt 0 ]; then
    case "$1" in
        list)
            list_sites
            ;;
        add)
            if [ $# -eq 4 ]; then
                ./scripts/add-site.sh "$2" "$3" "$4"
            else
                echo "Usage: $0 add <domain> <site-name> <database>"
            fi
            ;;
        remove)
            if [ $# -eq 2 ]; then
                ./scripts/remove-site.sh "$2"
            else
                echo "Usage: $0 remove <domain>"
            fi
            ;;
        reset)
            reset_all
            ;;
        *)
            echo "Usage: $0 [list|add|remove|reset]"
            echo "  Or run without arguments for interactive mode"
            ;;
    esac
else
    # Interactive mode
    main_menu
fi
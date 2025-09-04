#!/bin/bash

# Automated SSL certificate setup for new sites
# Usage: ./setup-ssl.sh <domain>

set -e

DOMAIN="$1"
EMAIL="${2:-admin@$DOMAIN}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain> [email]"
    exit 1
fi

echo "Setting up SSL certificate for ${DOMAIN}..."

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Request certificate
certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    --domains "${DOMAIN},www.${DOMAIN}" \
    --expand

# Setup auto-renewal
echo "0 0,12 * * * root python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew --quiet" | tee -a /etc/crontab > /dev/null

echo "SSL certificate configured for ${DOMAIN}"
echo "Certificate will auto-renew via cron"
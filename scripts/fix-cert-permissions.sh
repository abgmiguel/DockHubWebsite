#!/bin/bash

# Fix SSL certificate permissions for dynamic loading
# Nginx worker needs to read certs when using variables

CERT_DIR="/etc/letsencrypt"

echo "🔐 Fixing SSL certificate permissions for dynamic loading..."

# Make archive and live directories readable by nginx
chmod 755 $CERT_DIR/archive 2>/dev/null || true
chmod 755 $CERT_DIR/live 2>/dev/null || true

# For each domain certificate
for domain in $(ls $CERT_DIR/live/); do
    if [ -d "$CERT_DIR/live/$domain" ]; then
        echo "  📁 Fixing permissions for: $domain"
        
        # Make domain directories accessible
        chmod 755 "$CERT_DIR/live/$domain"
        chmod 755 "$CERT_DIR/archive/$domain" 2>/dev/null || true
        
        # Make certificate files readable (but keep keys secure)
        chmod 644 "$CERT_DIR/live/$domain/fullchain.pem" 2>/dev/null || true
        chmod 644 "$CERT_DIR/live/$domain/cert.pem" 2>/dev/null || true
        chmod 644 "$CERT_DIR/live/$domain/chain.pem" 2>/dev/null || true
        chmod 640 "$CERT_DIR/live/$domain/privkey.pem" 2>/dev/null || true
        
        # Ensure nginx can read the private key
        chgrp www-data "$CERT_DIR/live/$domain/privkey.pem" 2>/dev/null || \
        chgrp nginx "$CERT_DIR/live/$domain/privkey.pem" 2>/dev/null || true
    fi
done

echo "✅ Certificate permissions fixed"
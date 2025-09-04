#!/bin/bash

# Docker entrypoint that syncs internal data to external mounts if they're empty
set -e

echo "🔄 Checking external mounts and syncing if needed..."

# Check and sync dist folder
if [ -z "$(ls -A /app/dist 2>/dev/null)" ]; then
    echo "  📦 External dist mount is empty, copying from image..."
    if [ -d /app/dist-internal ]; then
        cp -r /app/dist-internal/* /app/dist/
        echo "  ✅ Dist files copied to external mount"
    fi
else
    echo "  ✓ External dist mount has content, using existing files"
fi

# Check and sync sites folder
REBUILD_NEEDED=false
if [ -z "$(ls -A /app/src/sites 2>/dev/null)" ]; then
    echo "  📦 External sites mount is empty, copying from image..."
    if [ -d /app/src/sites-internal ]; then
        cp -r /app/src/sites-internal/* /app/src/sites/
        echo "  ✅ Sites copied to external mount"
    fi
else
    echo "  ✓ External sites mount has content, checking for new sites..."
    
    # Check if we have new sites by looking for sites without built pages
    for site_dir in /app/src/sites/*/; do
        site_name=$(basename "$site_dir")
        if [ ! -d "/app/dist/client/_astro" ] || [ ! -f "/app/dist/server/manifest_*.mjs" ]; then
            echo "  🆕 Detected changes, rebuild needed"
            REBUILD_NEEDED=true
            break
        fi
    done
fi

# Check and sync server binary
if [ ! -f /app/server ]; then
    echo "  📦 External server binary missing, copying from image..."
    if [ -f /app/server-internal ]; then
        cp /app/server-internal /app/server
        chmod +x /app/server
        echo "  ✅ Server binary copied to external mount"
    fi
else
    echo "  ✓ External server binary exists, using existing file"
    chmod +x /app/server
fi

# Check and sync sites-config.json
if [ ! -f /app/sites-config.json ]; then
    echo "  📦 Sites config missing, copying from image..."
    if [ -f /app/sites-config-internal.json ]; then
        cp /app/sites-config-internal.json /app/sites-config.json
        echo "  ✅ Sites config copied to external mount"
    fi
else
    echo "  ✓ Sites config exists, using existing file"
fi

# Ensure node_modules are available (they're not mounted externally)
if [ ! -d /app/node_modules ] && [ -d /app/node_modules-internal ]; then
    echo "  📦 Copying node_modules from internal..."
    cp -r /app/node_modules-internal /app/node_modules
fi

# Rebuild if needed
if [ "$REBUILD_NEEDED" = true ]; then
    echo ""
    echo "🔨 Rebuilding Astro app with new sites..."
    cd /app
    
    # Copy source files from internal if needed
    if [ ! -d /app/src/shared ]; then
        echo "  📦 Copying source structure for rebuild..."
        cp -r /app/src-internal/* /app/src/ 2>/dev/null || true
    fi
    
    # Now rebuild
    echo "  📦 Building Astro app with new sites..."
    cd /app
    npx astro build || echo "  ⚠️  Build failed, using existing dist"
    
    echo "  ✅ Rebuild complete!"
fi

echo "✅ Mount sync complete, starting services..."

# Start supervisor
exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
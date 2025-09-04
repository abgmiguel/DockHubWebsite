#!/bin/bash

# Supervisor-integrated auto-rebuild script
# Works with supervisor to rebuild and restart services properly

DEBOUNCE_SECONDS=3
LOG_PREFIX="[WATCHER]"
REBUILD_MARKER="/tmp/rebuild.marker"

echo "$LOG_PREFIX 👁️  Starting supervisor-integrated file watcher..."
echo "$LOG_PREFIX    Watching: /app/astro-multi-tenant/src/sites/"
echo "$LOG_PREFIX    Watching: /app/sites-config.json"
echo "$LOG_PREFIX    Watching: /app/backend/"

while true; do
    # Build list of directories to watch
    WATCH_DIRS="/app/astro-multi-tenant/src/sites/ /app/sites-config.json"
    
    # Add backend directories if they exist
    for dir in /app/backend/cmd/ /app/backend/handlers/ /app/backend/models/ /app/backend/middleware/; do
        [ -d "$dir" ] && WATCH_DIRS="$WATCH_DIRS $dir"
    done
    
    # Wait for file change
    CHANGED_FILE=$(inotifywait -r -e close_write,moved_to \
        $WATCH_DIRS \
        --exclude '.*\.css$|.*dist/.*|.*node_modules/.*|.*\.git/.*|.*uploads/.*' \
        --format '%w%f' \
        --quiet 2>/dev/null)
    
    echo "$LOG_PREFIX 📝 Change detected: $CHANGED_FILE"
    
    # Debounce
    echo "$LOG_PREFIX ⏱️  Waiting ${DEBOUNCE_SECONDS}s for additional changes..."
    sleep $DEBOUNCE_SECONDS
    
    echo "$LOG_PREFIX 🔄 Starting rebuild at $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Determine what to rebuild based on changed file
    if [[ $CHANGED_FILE == *"/backend/"* ]]; then
        echo "$LOG_PREFIX 🔧 Rebuilding Go backend..."
        cd /app/backend
        
        if go build -o server cmd/server/main.go; then
            echo "$LOG_PREFIX ✅ Backend build successful"
            # Use supervisor to restart backend
            supervisorctl restart backend
            echo "$LOG_PREFIX 🔄 Backend restarted via supervisor"
        else
            echo "$LOG_PREFIX ❌ Backend build failed!"
        fi
    else
        echo "$LOG_PREFIX 🎨 Rebuilding frontend..."
        cd /app/astro-multi-tenant
        
        # Skip if CSS file changed
        if [[ $CHANGED_FILE == *".css" ]]; then
            echo "$LOG_PREFIX ⚠️  CSS file changed, skipping to avoid loop"
            continue
        fi
        
        # Generate CSS for changed site
        SITE_DIR=$(echo $CHANGED_FILE | grep -oE 'sites/[^/]+' | cut -d'/' -f2 | head -1)
        
        if [ ! -z "$SITE_DIR" ] && [ -d "src/sites/$SITE_DIR" ]; then
            echo "$LOG_PREFIX 📦 Detected change in site: $SITE_DIR"
            
            if [[ $CHANGED_FILE != *".css" ]] && [ -f "src/sites/$SITE_DIR/tailwind.config.cjs" ]; then
                echo "$LOG_PREFIX 🎨 Generating CSS for $SITE_DIR..."
                npx tailwindcss -c src/sites/$SITE_DIR/tailwind.config.cjs \
                    -i src/sites/$SITE_DIR/styles/tailwind.css \
                    -o src/sites/$SITE_DIR/styles/main.css \
                    --minify 2>/dev/null
                echo "$LOG_PREFIX ✅ CSS generated for $SITE_DIR"
            fi
        fi
        
        echo "$LOG_PREFIX 🏗️  Building Astro frontend..."
        
        # Mark that we're rebuilding to prevent supervisor from restarting during build
        touch $REBUILD_MARKER
        
        if npm run build 2>&1 | tail -5; then
            echo "$LOG_PREFIX ✅ Frontend build successful"
            
            # Remove marker
            rm -f $REBUILD_MARKER
            
            # Use PM2 to gracefully reload frontend (zero-downtime)
            echo "$LOG_PREFIX 🔄 Gracefully reloading frontend via PM2..."
            pm2 reload astro-multi-tenant
            echo "$LOG_PREFIX ✅ Frontend reloaded successfully (zero-downtime)"
        else
            echo "$LOG_PREFIX ❌ Frontend build failed!"
            rm -f $REBUILD_MARKER
        fi
    fi
    
    echo "$LOG_PREFIX ✅ Rebuild complete at $(date '+%Y-%m-%d %H:%M:%S')"
    echo "$LOG_PREFIX 👁️  Watching for changes..."
done
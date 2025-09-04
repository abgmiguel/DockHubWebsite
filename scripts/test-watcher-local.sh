#!/bin/bash

# Test version of watcher for local macOS testing

LOG_PREFIX="[WATCHER]"
DEBOUNCE_SECONDS=3

echo "$LOG_PREFIX Testing file watching logic locally..."
echo "$LOG_PREFIX Watching astro-multi-tenant/src/sites/"

# Use fswatch on macOS instead of inotifywait
if ! command -v fswatch &> /dev/null; then
    echo "$LOG_PREFIX Installing fswatch..."
    brew install fswatch
fi

echo "$LOG_PREFIX Starting watch..."

# Watch for changes
fswatch -r -e ".*\.css$" -e ".*dist/.*" -e ".*node_modules/.*" \
    astro-multi-tenant/src/sites/ |
while read CHANGED_FILE; do
    echo "$LOG_PREFIX 📝 Change detected: $CHANGED_FILE"
    
    # Test the file type detection
    if [[ $CHANGED_FILE == *".css" ]]; then
        echo "$LOG_PREFIX ⚠️  CSS file changed, would skip"
        continue
    fi
    
    # Extract site directory
    SITE_DIR=$(echo $CHANGED_FILE | grep -oE 'sites/[^/]+' | cut -d'/' -f2 | head -1)
    
    if [ ! -z "$SITE_DIR" ]; then
        echo "$LOG_PREFIX 📦 Detected change in site: $SITE_DIR"
        echo "$LOG_PREFIX Would rebuild only $SITE_DIR"
    else
        echo "$LOG_PREFIX Would rebuild all sites"
    fi
    
    echo "$LOG_PREFIX Waiting ${DEBOUNCE_SECONDS}s..."
    sleep $DEBOUNCE_SECONDS
done
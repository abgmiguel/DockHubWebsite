#!/bin/bash

# Script to update all Tailwind configs to use the semantic plugin
set -e

echo "🔧 Updating all Tailwind configs to use semantic plugin..."

# Process each site's tailwind.config.cjs
for CONFIG_FILE in astro-multi-tenant/src/sites/*/tailwind.config.cjs; do
  if [ -f "$CONFIG_FILE" ]; then
    SITE=$(basename $(dirname "$CONFIG_FILE"))
    echo "  → Updating $SITE"
    
    # Check if plugin is already imported
    if ! grep -q "tailwind-semantic-plugin" "$CONFIG_FILE"; then
      # Add the import at the top after the first line
      sed -i '' '1a\
const semanticPlugin = require("../../shared/tailwind-semantic-plugin")\
' "$CONFIG_FILE"
      
      # Add the plugin to the plugins array
      # First check if plugins array exists
      if grep -q "plugins:" "$CONFIG_FILE"; then
        # Add semanticPlugin as the first plugin
        sed -i '' '/plugins: \[/a\
    semanticPlugin,  // Semantic utility classes for blog module' "$CONFIG_FILE"
      else
        # Add plugins array before the closing brace
        sed -i '' '/^}$/i\
  plugins: [\
    semanticPlugin,  // Semantic utility classes for blog module\
  ],' "$CONFIG_FILE"
      fi
      
      echo "    ✓ Added semantic plugin"
    else
      echo "    ✓ Already has semantic plugin"
    fi
    
    # Clean up safelist if it has the redundant entries
    if grep -q "text-text-primary" "$CONFIG_FILE"; then
      echo "    → Cleaning up redundant safelist entries..."
      # Remove the semantic classes that are now provided by the plugin
      sed -i '' "/text-text-primary/d" "$CONFIG_FILE"
      sed -i '' "/text-text-secondary/d" "$CONFIG_FILE"
      sed -i '' "/text-text-muted/d" "$CONFIG_FILE"
      sed -i '' "/bg-surface'/d" "$CONFIG_FILE"
      sed -i '' "/bg-surface-hover/d" "$CONFIG_FILE"
      sed -i '' "/border-border/d" "$CONFIG_FILE"
      sed -i '' "/text-link'/d" "$CONFIG_FILE"
      sed -i '' "/text-link-hover/d" "$CONFIG_FILE"
      sed -i '' "/hover:bg-surface'/d" "$CONFIG_FILE"
      sed -i '' "/hover:bg-surface-hover/d" "$CONFIG_FILE"
      sed -i '' "/hover:text-link-hover/d" "$CONFIG_FILE"
      echo "    ✓ Cleaned safelist"
    fi
  fi
done

echo "✅ All Tailwind configs updated!"
echo ""
echo "Now you can:"
echo "  1. Run 'npm run dev' to test in development"
echo "  2. Run 'npm run build' to test production build"
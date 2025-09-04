#!/bin/bash

# Remove Layout wrapper tags from all page files
for file in src/sites/*/pages/*.astro src/sites/*/pages/**/*.astro; do
  if [ -f "$file" ]; then
    # Remove the opening <Layout> tag and its attributes
    sed -i '' '/<Layout[^>]*>/d' "$file"
    # Remove the closing </Layout> tag
    sed -i '' '/<\/Layout>/d' "$file"
    echo "Processed: $file"
  fi
done

echo "Layout wrappers removed from all page files"
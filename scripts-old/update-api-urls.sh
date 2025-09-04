#!/bin/bash

# Script to update API URLs for multi-tenant production
# This updates hardcoded API URLs to use the api-config helper

echo "Updating API URLs for multi-tenant production..."

# Find all files that use PUBLIC_API_URL
files=$(grep -r "PUBLIC_API_URL" src/pages --include="*.astro" --include="*.tsx" --include="*.ts" -l)

echo "Found files to update:"
echo "$files"

# For each file, add import and update usage
for file in $files; do
  echo "Processing $file..."
  
  # Check if it's an Astro file
  if [[ $file == *.astro ]]; then
    # For Astro files, update the frontmatter
    sed -i.bak '
      /^---$/,/^---$/ {
        s|const API_URL = import.meta.env.PUBLIC_API_URL || .*|import { getApiUrl } from "../../../lib/api-config";\nconst API_URL = getApiUrl();|
      }
    ' "$file"
  fi
done

echo "API URL updates complete!"
echo "Note: Review the changes and test thoroughly before deploying"
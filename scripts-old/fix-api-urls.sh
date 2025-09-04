#!/bin/bash

# Fix all hardcoded localhost URLs in editor pages

FILES=(
  "src/pages/blog/editor/categories/index.astro"
  "src/pages/blog/editor/users/new.astro"
  "src/pages/blog/editor/users/edit/[id].astro"
  "src/pages/blog/editor/users/index.astro"
  "src/pages/blog/editor/change-password.astro"
  "src/pages/blog/editor/posts/new.astro"
  "src/pages/blog/editor/posts/edit/[id].astro"
  "src/pages/blog/editor/register.astro"
)

for file in "${FILES[@]}"; do
  echo "Updating $file..."
  
  # Check if file has the correct import depth
  depth=$(echo "$file" | tr '/' '\n' | grep -c .)
  if [ $depth -eq 7 ]; then
    # Files in edit/[id] subdirectories
    import_path="../../../../../lib/config"
  elif [ $depth -eq 6 ]; then
    # Files in direct subdirectories
    import_path="../../../../lib/config"
  else
    # Files in editor root
    import_path="../../../lib/config"
  fi
  
  # Add import if not present
  if ! grep -q "import { getServerApiUrl }" "$file"; then
    # Find the line with Layout import and add after it
    sed -i "" "/import Layout from/a\\
import { getServerApiUrl } from '$import_path';
" "$file"
  fi
  
  # Replace hardcoded URL
  sed -i "" "s|const API_URL = 'http://localhost:8752';|const API_URL = getServerApiUrl();|g" "$file"
  
  # Fix client-side fetch calls
  sed -i "" "s|import.meta.env.PUBLIC_API_URL || 'http://localhost:8752'|import.meta.env.PUBLIC_API_URL || ''|g" "$file"
done

echo "✅ All files updated!"
#!/bin/bash

# Remove all Layout tags from page files - handles multi-line tags
for file in src/sites/*/pages/*.astro src/sites/*/pages/**/*.astro; do
  if [ -f "$file" ]; then
    # Use perl to remove multi-line Layout tags
    perl -i -0pe 's/<Layout[^>]*>//gs' "$file"
    perl -i -pe 's/<\/Layout>//g' "$file"
    echo "Cleaned: $file"
  fi
done

echo "All Layout tags removed"
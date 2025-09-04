#!/bin/bash

# Script to update all API URLs to use centralized config

echo "🔧 Updating API URLs to use centralized config..."

# Function to update Astro files
update_astro_file() {
    local file=$1
    local import_path=$2
    
    echo "  → Updating $file"
    
    # Check if file already has the import
    if grep -q "import { API_URL }" "$file"; then
        echo "    ✓ Already updated"
        return
    fi
    
    # Add import at the beginning of the frontmatter
    # Replace hardcoded API URLs
    sed -i '' \
        -e "s|const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8752';|import { API_URL } from '$import_path';|" \
        -e "s|const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:3001';|import { API_URL } from '$import_path';|" \
        -e "s|const API_URL = 'http://127.0.0.1:3001';|import { API_URL } from '$import_path';|" \
        -e "s|const API_URL = 'http://127.0.0.1:8752';|import { API_URL } from '$import_path';|" \
        "$file"
    
    # Replace inline hardcoded URLs
    sed -i '' \
        -e "s|'http://127.0.0.1:3001/api/|API_URL + '/api/|g" \
        -e "s|'http://127.0.0.1:8752/api/|API_URL + '/api/|g" \
        -e 's|`http://127.0.0.1:3001/api/|`${API_URL}/api/|g' \
        -e 's|`http://127.0.0.1:8752/api/|`${API_URL}/api/|g' \
        "$file"
    
    echo "    ✓ Updated"
}

# Update blog module files
echo "📦 Updating blog module files..."

# Blog root files
update_astro_file "src/modules/blog/index.astro" "../../../shared/lib/api-config"
update_astro_file "src/modules/blog/[slug].astro" "../../../shared/lib/api-config"
update_astro_file "src/modules/blog/index-enhanced.astro" "../../../shared/lib/api-config"

# Blog docs
update_astro_file "src/modules/blog/docs/index.astro" "../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/docs/[slug].astro" "../../../../shared/lib/api-config"

# Blog components
update_astro_file "src/modules/blog/components/BlogPost.astro" "../../../shared/lib/api-config"
update_astro_file "src/modules/blog/components/editor/PostsList.astro" "../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/components/editor/PostsEdit.astro" "../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/components/editor/PostsNew.astro" "../../../../shared/lib/api-config"

# Blog editor
update_astro_file "src/modules/blog/editor/index.astro" "../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/editor/login.astro" "../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/editor/register.astro" "../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/editor/change-password.astro" "../../../../shared/lib/api-config"

# Blog editor posts
update_astro_file "src/modules/blog/editor/posts/index.astro" "../../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/editor/posts/new.astro" "../../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/editor/posts/edit/[id].astro" "../../../../../../shared/lib/api-config"

# Blog editor categories
update_astro_file "src/modules/blog/editor/categories/index.astro" "../../../../../shared/lib/api-config"

# Blog editor users
update_astro_file "src/modules/blog/editor/users/index.astro" "../../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/editor/users/new.astro" "../../../../../shared/lib/api-config"
update_astro_file "src/modules/blog/editor/users/edit/[id].astro" "../../../../../../shared/lib/api-config"

# Site-specific files
update_astro_file "src/sites/darkflows.com/components/FeaturedPost.astro" "../../../shared/lib/api-config"

# Update TypeScript/TSX files
echo "📦 Updating TypeScript/TSX files..."

# Update SocialPublishModal.tsx
echo "  → Updating src/modules/blog/components/editor/SocialPublishModal.tsx"
sed -i '' \
    -e "s|import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8752'|API_URL|g" \
    -e "1i\\
import { API_URL } from '../../../../shared/lib/api-config';\\
" \
    "src/modules/blog/components/editor/SocialPublishModal.tsx"

# Update middleware.ts
echo "  → Updating src/middleware.ts"
sed -i '' \
    -e "s|'http://127.0.0.1:3001/api/|API_URL + '/api/|g" \
    -e "1i\\
import { API_URL } from './shared/lib/api-config';\\
" \
    "src/middleware.ts"

# Update API route files
echo "📦 Updating API route files..."
for file in src/pages/api/auth/*.ts src/pages/api/posts/*.ts; do
    if [ -f "$file" ]; then
        echo "  → Updating $file"
        sed -i '' \
            -e "s|'http://127.0.0.1:3001/api/|API_URL + '/api/|g" \
            -e "1i\\
import { API_URL } from '../../../shared/lib/api-config';\\
" \
            "$file"
    fi
done

echo "✅ All API URLs updated to use centralized config!"
echo ""
echo "⚠️  Note: Some files may need manual review for:"
echo "   - Complex import.meta.env.PUBLIC_API_URL usage"
echo "   - Script tags that need API_URL passed via define:vars"
echo "   - Database header additions"
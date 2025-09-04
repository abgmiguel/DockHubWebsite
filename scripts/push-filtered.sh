#!/bin/bash

# Alternative push script using git filter-branch for GitHub
set -e

echo "🚀 Filtered Push Script"
echo "======================="

# Configuration
BRANCH="${1:-main}"
FORCE="${2}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Branch: $BRANCH${NC}"
echo ""

# Function to push with all files (GitLab)
push_full() {
    local remote=$1
    echo -e "${GREEN}📤 Pushing to $remote (full repository)...${NC}"
    if [[ "$FORCE" == "--force" ]]; then
        git push --force $remote $BRANCH
    else
        git push $remote $BRANCH
    fi
    echo -e "${GREEN}✅ Done${NC}"
}

# Function to push without large files (GitHub)
push_filtered() {
    local remote=$1
    echo -e "${YELLOW}📤 Pushing to $remote (filtered)...${NC}"
    
    # Create a temporary directory for the filtered repo
    TEMP_DIR=$(mktemp -d)
    echo "Working in $TEMP_DIR"
    
    # Clone the current repository to temp directory
    git clone --no-hardlinks --branch $BRANCH . $TEMP_DIR
    
    cd $TEMP_DIR
    
    # Remove large files using git filter-repo
    echo "Removing files larger than 10MB..."
    
    # If git-filter-repo is available, use it
    if command -v git-filter-repo &> /dev/null; then
        git filter-repo --strip-blobs-bigger-than 10M --force
    else
        # Fallback: Find and remove large files manually
        find . -type f -size +10M | while read file; do
            git rm --cached "$file" 2>/dev/null || true
        done
        git commit -m "Remove large files for GitHub" || true
    fi
    
    # Add GitHub remote
    GITHUB_URL=$(cd - > /dev/null 2>&1 && git remote get-url github 2>/dev/null || git remote get-url origin 2>/dev/null | grep github || echo "git@github.com:CodersInFlow/AstroTemplate.git")
    git remote add github "$GITHUB_URL"
    
    # Push to GitHub
    if [[ "$FORCE" == "--force" ]]; then
        git push --force github $BRANCH
    else
        git push github $BRANCH
    fi
    
    # Clean up
    cd -
    rm -rf $TEMP_DIR
    
    echo -e "${GREEN}✅ Filtered push complete${NC}"
}

# Main execution
echo "🔍 Analyzing repository..."

# Check for large files
LARGE_FILES=$(find . -path ./.git -prune -o -type f -size +10M -print 2>/dev/null | grep -v "^./.git" | head -20)

if [ ! -z "$LARGE_FILES" ]; then
    echo -e "${YELLOW}Found large files (>10MB):${NC}"
    echo "$LARGE_FILES" | while read file; do
        SIZE=$(ls -lh "$file" 2>/dev/null | awk '{print $5}')
        echo "  - $file ($SIZE)"
    done
    echo ""
fi

# Push to remotes
echo "📡 Pushing to remotes..."
echo ""

# Check and push to GitLab
if git remote | grep -q "^gitlab$"; then
    push_full gitlab
    echo ""
fi

# Check and push to GitHub
if git remote | grep -q "^github$"; then
    if [ ! -z "$LARGE_FILES" ]; then
        echo -e "${YELLOW}⚠️  Large files will be excluded from GitHub${NC}"
        read -p "Continue with filtered push to GitHub? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            push_filtered github
        else
            echo "Skipping GitHub push"
        fi
    else
        push_full github
    fi
elif git remote | grep -q "^origin$"; then
    ORIGIN_URL=$(git remote get-url origin)
    if [[ "$ORIGIN_URL" == *"github.com"* ]]; then
        if [ ! -z "$LARGE_FILES" ]; then
            echo -e "${YELLOW}⚠️  Large files will be excluded from GitHub (origin)${NC}"
            read -p "Continue with filtered push to GitHub? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                push_filtered origin
            else
                echo "Skipping GitHub push"
            fi
        else
            push_full origin
        fi
    else
        push_full origin
    fi
fi

echo ""
echo -e "${GREEN}🎉 Push operations complete!${NC}"
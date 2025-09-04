#!/bin/bash

# Increment version number
if [ -f version.txt ]; then
    VERSION=$(cat version.txt)
    # Split version into major.minor.patch
    IFS='.' read -ra PARTS <<< "$VERSION"
    MAJOR=${PARTS[0]}
    MINOR=${PARTS[1]}
    PATCH=${PARTS[2]}
    
    # Increment patch version
    PATCH=$((PATCH + 1))
    
    # Write new version
    echo "$MAJOR.$MINOR.$PATCH" > version.txt
    echo "Version updated to $MAJOR.$MINOR.$PATCH"
else
    echo "1.0.0" > version.txt
    echo "Version set to 1.0.0"
fi

# Build the binary
go build -o server cmd/server/main.go
echo "Build complete"
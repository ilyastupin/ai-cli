#!/bin/bash

set -e # Stop if any command fails

PACKAGE_FILE="package.json"

if [ ! -f "$PACKAGE_FILE" ]; then
    echo "❌ package.json not found in current directory."
    exit 1
fi

# Extract current version
current_version=$(jq -r '.version' "$PACKAGE_FILE")
IFS='.' read -r major minor patch <<<"$current_version"

# Increment patch version
new_patch=$((patch + 1))
new_version="$major.$minor.$new_patch"

# Update package.json with new version
jq --arg new_version "$new_version" '.version = $new_version' "$PACKAGE_FILE" >tmp.$$.json && mv tmp.$$.json "$PACKAGE_FILE"

# Git commit and push
git add package.json
git commit -m "🔖 version bump to $new_version"
git push

echo "✅ Version bumped to $new_version and pushed to remote."

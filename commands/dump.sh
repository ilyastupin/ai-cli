#!/bin/bash

# Defaults
INCLUDE=("*.js" "*.jsx" "*.json" "*.ts" "*.tsx")
EXCLUDE=()
CONFIG_FILE="dump.config.json"
OUTPUT_FILE="__archive__.md"

# Load config if it exists
if [ -f "$CONFIG_FILE" ]; then
    echo "🔧 Loading config from $CONFIG_FILE"
    INCLUDE=($(jq -r '.include[]?' "$CONFIG_FILE"))
    EXCLUDE=($(jq -r '.exclude[]?' "$CONFIG_FILE"))
fi

# Clear output file
>"$OUTPUT_FILE"

# Build the git ls-files command with include patterns
MATCH_CMD="git ls-files"
for pattern in "${INCLUDE[@]}"; do
    MATCH_CMD+=" -- '$pattern'"
done

# Debug output
echo "📂 Include patterns: ${INCLUDE[*]}"
echo "🚫 Exclude patterns: ${EXCLUDE[*]}"
echo "🔍 Running: $MATCH_CMD"

# Evaluate match command
MATCHED_FILES=$(eval "$MATCH_CMD")

# Apply exclusions
for pattern in "${EXCLUDE[@]}"; do
    MATCHED_FILES=$(echo "$MATCHED_FILES" | grep -v -E "$pattern")
done

# Dump matched files to archive
echo "📦 Archiving files to $OUTPUT_FILE..."

COUNT=0
while IFS= read -r file; do
    if [ -f "$file" ]; then
        echo -e "\n\n---\n### $file\n---\n" >>"$OUTPUT_FILE"
        cat "$file" >>"$OUTPUT_FILE"
        ((COUNT++))
    fi
done <<<"$MATCHED_FILES"

echo "✅ Done: $OUTPUT_FILE created with $COUNT files."

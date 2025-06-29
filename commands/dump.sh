#!/bin/bash

CONFIG_FILE="dump.config.json"
OUTPUT_FILE="__archive__.md"

# Step 1: Ensure config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "⚙️ Creating default $CONFIG_FILE..."
    cat <<EOF >"$CONFIG_FILE"
{
  "include": ["*.js", "*.jsx", "*.json", "*.ts", "*.tsx"],
  "exclude": ["^\\\\.vscode/", "package-lock\\\\.json"]
}
EOF
fi

# Step 2: Build INCLUDE and EXCLUDE regex
INCLUDE_REGEX=$(jq -r '.include[]?' "$CONFIG_FILE" | sed 's/\./\\./g; s/\*/.*/g' | paste -sd '|' -)
EXCLUDE_REGEX=$(jq -r '.exclude[]?' "$CONFIG_FILE" | paste -sd '|' -)

echo "🔍 Include regex: $INCLUDE_REGEX"
echo "🚫 Exclude regex: $EXCLUDE_REGEX"

# Step 3: Clear previous archive file
>"$OUTPUT_FILE"

# Step 4: Process each file in git index
echo "📦 Scanning files from git index..."
FILE_COUNT=0
MATCHED_COUNT=0

while read -r file; do
    echo -n "📄 $file ... "

    if echo "$file" | grep -Eq "$INCLUDE_REGEX"; then
        if echo "$file" | grep -Eq "$EXCLUDE_REGEX"; then
            echo "🚫 excluded"
        else
            echo "✅ included"
            echo -e "\n\n---\n### $file\n---\n" >>"$OUTPUT_FILE"
            cat "$file" >>"$OUTPUT_FILE"
            MATCHED_COUNT=$((MATCHED_COUNT + 1))
        fi
    else
        echo "❌ skipped"
    fi

    FILE_COUNT=$((FILE_COUNT + 1))
done < <(git ls-files)

echo "✅ Done: $OUTPUT_FILE created with $MATCHED_COUNT of $FILE_COUNT files."

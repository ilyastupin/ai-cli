#!/bin/sh

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "❌ Chat file path must be provided as the first argument."
    exit 1
fi

CHAT_FILE="$1"

CONFIG_FILE="assistant.config.json"

# Ensure config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Error: Config file $CONFIG_FILE not found!"
    exit 1
fi

# Determine the output file name
OUTPUT_BASE_NAME=$(jq -r '.name // "archive"' "$CONFIG_FILE")
OUTPUT_FILE="__${OUTPUT_BASE_NAME}__.md"

echo "🗃️ Running dump script..."
assistant --chat "$CHAT_FILE" --run dump

echo "📤 Uploading $OUTPUT_FILE..."
UPLOAD_JSON=$(assistant --upload "$OUTPUT_FILE" --json)

FILE_ID=$(echo "$UPLOAD_JSON" | jq -r '.id')

if [ -n "$FILE_ID" ] && [ "$FILE_ID" != "null" ]; then
    echo "✅ Uploaded file ID: $FILE_ID"
else
    echo "❌ Failed to extract file ID from upload"
    exit 1
fi

echo '
I have just uploaded a file __archive__.md that contains the most important files of my project.
You have to read it and analyze and we continue working with this project
As a result of this please show me brief summary of your understanding of the project
' >>$CHAT_FILE

assistant --chat "$CHAT_FILE" --use "$FILE_ID"

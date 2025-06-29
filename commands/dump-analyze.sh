#!/bin/sh

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "❌ Chat file path must be provided as the first argument."
    exit 1
fi

CHAT_FILE="$1"

echo "🗃️ Running dump script..."
assistant --chat "$CHAT_FILE" --run dump

echo "📤 Uploading __archive__.md..."
UPLOAD_JSON=$(node assistant.js --upload __archive__.md --json)

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

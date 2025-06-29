#!/bin/sh

set -e

if [ -z "$1" ]; then
    echo "❌ Chat file path must be provided as the first argument."
    exit 1
fi

CHAT_FILE="$1"
USE_IDS="${2:-}"

USE_ARGS=""
if [ -n "$USE_IDS" ]; then
    USE_ARGS="--use $USE_IDS"
    echo "📎 Using attached file IDs: $USE_IDS"
fi

mkdir -p tmp

echo 'making a file list...'
echo '

I want to save this changes locally.

show me a list of files that I supposed to create or update in my file system manually
(that I just asked you about to change). 

Show me text file names only (no images or ico files).

It must be real files that I can find on the disk. Dont include any files with template in names.

Dont include ANY additional formatting like markdown or bullets. I need ONLY file content.

I need a bare list with full paths - no other words

' >>"$CHAT_FILE"

eval assistant --chat "\"$CHAT_FILE\"" $USE_ARGS

assistant --chat "$CHAT_FILE" --last --remove-md >tmp/list.txt

echo 'the file list is:'
cat tmp/list.txt

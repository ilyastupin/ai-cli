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

# Check for new questions
if ! assistant --chat "$CHAT_FILE" --check; then
    exit 1
fi

echo '
make me a good message for this changes to commit them into repository
I want you to show only single line of future commit message
Dont include ANY additional formatting like markdown or bullets.
' >>"$CHAT_FILE"

eval assistant --chat "\"$CHAT_FILE\"" $USE_ARGS

assistant --chat "$CHAT_FILE" --last --remove-md >tmp/commit.txt

echo 'commit message:'
cat tmp/commit.txt

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

cat tmp/list.txt | grep -v '```' | while read -r line; do
    echo "
Now I tell you file name and you show me its full content.

I expect file content only

Give me $line

The current file is:
$(cat "$line" 2>/dev/null || true)
" >>"$CHAT_FILE"

    eval assistant --chat "\"$CHAT_FILE\"" $USE_ARGS
    assistant --chat "$CHAT_FILE" --last --remove-md >tmp/file.txt
    mkdir -p "$(dirname "$line")"
    cp tmp/file.txt "$line"
done

git add .
git commit -m "$(cat tmp/commit.txt)"

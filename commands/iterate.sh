#!/bin/sh

set -e

if [ -z "$1" ]; then
    echo "❌ Chat file path must be provided as the first argument."
    exit 1
fi

CHAT_FILE="$1"
mkdir -p tmp

echo 'making a file list...'
echo '
show me a list of files that I supposed to create or update. Show me text files only (no images or ico files).

I am already inside a future application folder so do not add root folder name like my-remix-app/...
I need a bare list with full paths - no other words
' >>"$CHAT_FILE"

assistant --chat "$CHAT_FILE"

# Extract assistant's last answer excluding first and last lines
assistant --chat "$CHAT_FILE" --last | tail -n +2 | head -n $(($(assistant --chat "$CHAT_FILE" --last | wc -l) - 2)) >tmp/list.txt

echo 'the file list is:'
cat tmp/list.txt

cat tmp/list.txt | while read -r line; do
    echo "
Now I tell you file name and you show me its full content.

I expect file content only

Give me $line
" >>"$CHAT_FILE"

    assistant --chat "$CHAT_FILE"
    assistant --chat "$CHAT_FILE" --last | tail -n +2 | head -n $(($(assistant --chat "$CHAT_FILE" --last | wc -l) - 2)) >tmp/file.txt
    mkdir -p "$(dirname "$line")"
    cp tmp/file.txt "$line"
done

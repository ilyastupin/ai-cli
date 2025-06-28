#!/bin/bash
git ls-files '*.[jt]s' '*.json' '*.md' '*.ts' '*.tsx' \
  | while read file; do
    echo -e "\n\n---\n### $file\n---\n" >> archive.md
    cat "$file" >> archive.md
  done

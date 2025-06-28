# ChatGPT CLI Tool

## Overview
The ChatGPT CLI Tool is a command-line interface designed for interacting with OpenAI's ChatGPT model. It enables users to engage with ChatGPT through markdown files, upload files to OpenAI's platform for various uses, and list uploaded files with metadata. Additionally, it can render markdown to HTML on demand.

## Features
- **Chat Functionality**: Interact with ChatGPT via chat files.
- **File Upload**: Upload files to OpenAI's platform for use with assistants.
- **File Listing**: Retrieve and display metadata for uploaded files.
- **Markdown Rendering**: Convert markdown content to HTML and open the resulting view in a browser【4:0†source】.

## Installation
Ensure Node.js is installed on your system. Then, run the following command to install dependencies:

```bash
npm install
```

This project depends on the `openai` library to interface with the OpenAI API【4:5†source】.

## Usage
The main script for interacting with the CLI tool is `chatGPT.js`. It includes several options for different functionalities:

```bash
Usage:
  node chatGPT.js --chat <file.txt> [--open-md]
  node chatGPT.js --upload <file>
  node chatGPT.js --list
  
Options:
  --chat <file.txt>     Path to your markdown chat file
  --open-md             After answering, render markdown to HTML and open it
  --upload <file>       Upload file to OpenAI Files API 
  --list                List all uploaded files with metadata
  --help                Show this help message
```

### Examples
- Chat with GPT using a markdown file: 
  ```bash
  node chatGPT.js --chat session1.txt
  ```
- Upload a file for use by assistants:
  ```bash
  node chatGPT.js --upload data.json
  ```
- List all uploaded files along with their metadata:
  ```bash
  node chatGPT.js --list
  ```【4:0†source】【4:2†source】

## License
This project is licensed under the ISC License【4:5†source】. 

## Contributors
This README does not mention specific contributors. Please refer to the project's `package.json` or accompanying documentation for author or contributors' information.

## Support
If you encounter any issues or have questions, please check the help option within the CLI tool:

```bash
node chatGPT.js --help
```

---

This README highlights the key functionalities of your project and provides instructions on how to set it up and use it. Make sure to amend sections like "Contributors" with specific details about contributors as needed.

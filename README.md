# Assistant CLI Tool with Threads

## Overview
The Assistant CLI Tool with Threads is a command-line interface for interacting with OpenAI's Assistants API. The tool supports threaded conversations, file uploads, integrated Brave search queries, and markdown rendering. It is designed for users looking to efficiently manage chat sessions and related file operations.

## Features
- **Chat Functionality**: Engage with an assistant using a markdown chat file. The tool supports continued conversations using embedded `thread_id`.
- **File Upload**: Upload files to the Assistants API for various tasks.
- **File Listing**: Retrieve and display metadata of uploaded files.
- **Markdown Rendering**: Convert markdown content to HTML and optionally open it in a browser.
- **Brave Search Integration**: Generate search query, perform Brave search, and attach results.
- **Thread Support**: Manage conversations with thread context for seamless interactions.

## Installation
Ensure Node.js is installed on your system. Install the project dependencies with:

```bash
npm install
```

This project utilizes several libraries, including `openai` for API interactions.

## Usage
Execute `assistant.js` with various options to utilize different functionalities:

```bash
Usage:
  node assistant.js --chat <file.txt> [--open-md] [--use <file-id1,file-id2,...>] [--search]
  node assistant.js --upload <file>
  node assistant.js --list

Options:
  --chat <file.txt>     Run assistant with chat file (thread continues via embedded thread_id)
  --open-md             Render markdown to HTML and open following response
  --use <ids>           Attach one or more uploaded file IDs (comma-separated)
  --upload <file>       Upload a file (primarily for assistants)
  --list                Display metadata of uploaded files
  --search              Perform search and attach results to the chat
  --help                Display this usage message
```

## Examples
- **Chat with Assistant**:
  ```bash
  node assistant.js --chat session1.txt
  ```
- **Upload a File**:
  ```bash
  node assistant.js --upload document.pdf
  ```
- **List Files**:
  ```bash
  node assistant.js --list
  ```
- **Perform a Search and Use Results**:
  ```bash
  node assistant.js --chat session1.txt --search
  ```

## License
This project is licensed under the ISC License.

## Contributors
Refer to `package.json` for details on contributors. Adjust this section to include specific contributors as necessary.

## Support
For troubleshooting and further assistance, use the `--help` command:

```bash
node assistant.js --help
```

---

This README update incorporates all outlined functionalities of your CLI tool while maintaining clarity and detail for both developers and users who interact with it. Adjust the Contributors section according to the individuals involved in the project.

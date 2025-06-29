The Assistant CLI Tool with Threads is a command-line interface for interacting with OpenAI's Assistants API. The tool supports threaded conversations, file uploads, integrated Brave search queries, and markdown rendering. It is designed for users looking to efficiently manage chat sessions and related file operations.

## Features
- **Chat Functionality**: Engage with an assistant using a markdown chat file. The tool supports continued conversations using embedded `thread_id`.
- **File Upload**: Upload files to the Assistants API for various tasks.
- **File Listing**: Retrieve and display metadata of uploaded files.
- **Markdown Rendering**: Convert markdown content to HTML and optionally open it in a browser.
- **Brave Search Integration**: Generate search query, perform Brave search, and attach results.
- **Thread Support**: Manage conversations with thread context for seamless interactions.

## Installation
To get started with the Assistant CLI Tool, follow these steps:

1. **Clone the Repository**:
   Create a new folder and clone the public repository:
   ```bash
   git clone https://github.com/ilyastupin/ai-cli
   cd ai-cli
   ```

2. **Install Node.js v22**:
   Ensure Node.js version 22 is installed. You can find the installation guide [here](https://nodejs.org/).

3. **Install Dependencies**:
   Run npm to install project dependencies:
   ```bash
   npm install
   ```

4. **Link the Tool**:
   For global access, link the package:
   ```bash
   npm link
   ```

   **Note**: This tool has been tested for Mac users only.

## Usage
Execute `assistant` with various options to utilize different functionalities:

```
Usage:
  assistant --chat <file.txt> [--open-md] [--use <file-id1,file-id2,...>] [--search] [--last] [--remove-md]
  assistant --run <script> --chat <file.txt>
  assistant --upload <file>
  assistant --delete <file-id>
  assistant --list
  assistant --init <name>

Options:
  --chat <file.txt>     Run assistant with chat file (thread continues via embedded thread_id)
  --last                Show the last assistant response and exit
  --remove-md           Strip markdown from last response (only used with --last)
  --open-md             Render markdown to HTML and open after answering
  --use <ids>           Attach one or more uploaded file IDs (comma-separated)
  --upload <file>       Upload a file (purpose: assistants)
  --delete <file-id>    Delete a file by ID from OpenAI
  --list                List uploaded files
  --run <name>          Run a script from ./commands (requires --chat)
  --search              Perform a Brave search and attach results to the chat
  --json                Output machine-readable JSON (for --upload, --delete, --list)
  --help                Show this message

Note: If no parameters are specified and a chat file is configured, it will use the current chat.
```

## Examples
- **Chat with Assistant**:
  ```bash
  assistant --chat session1.txt
  ```
- **Upload a File**:
  ```bash
  assistant --upload document.pdf
  ```
- **List Files**:
  ```bash
  assistant --list
  ```
- **Perform a Search and Use Results**:
  ```bash
  assistant --chat session1.txt --search
  ```

## License
This project is licensed under the ISC License.

## Contributors
Refer to `package.json` for details on contributors. Adjust this section to include specific contributors as necessary.

## Support
For troubleshooting and further assistance, use the `--help` command:

```bash
assistant --help

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

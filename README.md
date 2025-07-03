# OpenAI CLI Tool

## Overview

This project provides an application to manage AI assistants and vector stores, leveraging OpenAI's API. It primarily focuses on creating, updating, and handling vector stores and AI assistants to facilitate data-driven decision-making and automation.

## Features

1. **Vector Store Management**:
   - Create and manage vector stores for data upload.
   - Perform actions like listing, deleting, and retrieving files in vector stores.

2. **Assistant Management**:
   - Create, update, and delete AI assistants configured with specific datasets.
   - Manage assistants' ability to answer queries with vector store data.

3. **File Management**:
   - Upload Git-tracked files as a single document to vector stores.
   - Skip certain files (e.g., `package-lock.json`, binary files) during uploads.

4. **Automation Tools**:
   - Cleanup scripts for removing unwanted logs and data.
   - Manage project resources efficiently with built-in scripts.

5. **Development and Operations**:
   - Scripts to manage versioning of the application.
   - Support for various operational environments and configurations.

## Installation

1. Clone the repository.
2. Run `npm install` to install all dependencies.
3. Configure environment variables as needed for OpenAI API access.

## Usage

- **Creating a Vector Store**: Use scripts or functions to define and upload files to a new vector store.
- **Managing Assistants**: Configure assistants to answer questions with relevant data.
- **Query and Cleanup**: Use provided scripts to query using AI models and clean up old data.

## Contributing

Please ensure all pull requests:
- Include clear descriptions of changes made.
- Follow the established code style guidelines.

## License

This project is licensed under the MIT License.
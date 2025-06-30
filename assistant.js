import fsPromises from 'fs/promises'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { generateMarkdownHtml } from './src/markdown.js'
import { askQuestion, uploadFile, listFiles, deleteFile } from './src/ai.js'
import { getQuestion, putAnswer, getLastAnswer } from './src/parser.js'
import { braveSearchToFile } from './src/brave.js'
import { runCommand } from './src/run.js'
import { initConfig, updateChatFileConfig } from './src/init.js'

// Convert exec to an async function using promisify for easier async/await usage
const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load package details to extract version information for display
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))

// Main asynchronous function to handle operations in an IIFE
;(async () => {
  // Function to display usage instructions and then exit
  function showHelpAndExit() {
    console.log(`
    🤖 Assistant CLI Tool with Threads (OpenAI Assistants API)
    📦 Version: ${pkg.version}
    
    Usage:
      assistant --chat <file.txt> [--open-md] [--use <file-id1,file-id2,...>] [--search] [--last] [--remove-md]
      assistant --run <script> --chat <file.txt>
      assistant --upload <file>
      assistant --delete <file-id>
      assistant --list
      assistant --init <name>
      assistant --check
    
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
      --init <name>         Initialize the assistant configuration file with the given name
      --check               Check for new questions in the chat and indicate status
      --json                Output machine-readable JSON (for --upload, --delete, --list)
      --help                Show this message
    `)
    process.exit(0)
  }

  // Extract command-line arguments and check for '--help'
  const args = process.argv.slice(2)
  if (args.includes('--help')) showHelpAndExit()

  // Set of valid command-line options
  const validOptions = new Set([
    '--chat',
    '--upload',
    '--delete',
    '--use',
    '--run',
    '--init',
    '--search',
    '--last',
    '--remove-md',
    '--open-md',
    '--json',
    '--help',
    '--list',
    '--check'
  ])

  // Validate the arguments for invalid options
  const invalidOptions = args.filter((arg) => arg.startsWith('--') && !validOptions.has(arg))
  if (invalidOptions.length > 0) {
    console.error(`❌ Invalid options detected: ${invalidOptions.join(', ')}`)
    showHelpAndExit()
  }

  // Load configuration file or handle errors
  let config = {}
  try {
    const configContent = await fsPromises.readFile('assistant.config.json', 'utf8')
    config = JSON.parse(configContent)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`❌ Failed to load configuration: ${err.message}`)
      process.exit(1)
    }
  }

  // Ensure '--init' and '--chat' options are followed by their respective parameters
  const initIndex = args.indexOf('--init')
  if (initIndex !== -1 && (!args[initIndex + 1] || args[initIndex + 1].startsWith('--'))) {
    console.error('❌ --init must be followed by a name.')
    showHelpAndExit()
  }

  const chatIndex = args.indexOf('--chat')
  if (chatIndex !== -1 && (!args[chatIndex + 1] || args[chatIndex + 1].startsWith('--'))) {
    console.error('❌ --chat must be followed by a file path.')
    showHelpAndExit()
  }

  // Asynchronous initialization without immediate exit
  if (initIndex !== -1 && args[initIndex + 1]) {
    const name = args[initIndex + 1]
    initConfig(name).catch((err) => {
      console.error(`❌ Configuration initialization failed: ${err.message}`)
    })
  }

  // Run the current chat if no parameters are provided but a chat is configured
  if (args.length === 0 && config.chatFile) {
    args.push('--chat', config.chatFile)
  } else if (args.length === 0) {
    showHelpAndExit()
  }

  // Determine indices for important flags in the command-line arguments
  const uploadIndex = args.indexOf('--upload')
  const deleteIndex = args.indexOf('--delete')
  const useIndex = args.indexOf('--use')
  const runIndex = args.indexOf('--run')

  // Boolean flags to check certain command-line options
  const searchEnabled = args.includes('--search')
  const showLastOnly = args.includes('--last')
  const removeMd = args.includes('--remove-md')
  const jsonOutput = args.includes('--json')
  const checkOnly = args.includes('--check')

  // Determine the chat file to use, either from args or config
  let chatFile = chatIndex !== -1 && args[chatIndex + 1] ? args[chatIndex + 1] : config.chatFile
  if (!chatFile) {
    console.error(`❌ Chat file must be specified using --chat or configured in assistant.config.json`)
    showHelpAndExit()
  }

  // Update the chat file path in configuration if a new one is specified
  if (chatIndex !== -1 && args[chatIndex + 1]) {
    updateChatFileConfig(chatFile)
  }

  // Resolve the full path to the chat file
  chatFile = path.resolve(chatFile)

  // Parse file IDs specified with the --use option
  let fileIds = []
  if (useIndex !== -1 && args[useIndex + 1]) {
    fileIds = args[useIndex + 1]
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  }

  // Handle file uploads
  if (uploadIndex !== -1 && args[uploadIndex + 1]) {
    const filePath = path.resolve(args[uploadIndex + 1])
    uploadFile(filePath)
      .then((uploaded) => {
        if (jsonOutput) {
          console.log(JSON.stringify(uploaded, null, 2))
        } else {
          console.log(`✅ Uploaded ${uploaded.name}`)
          console.log(`  ID: ${uploaded.id}`)
          console.log(`  Purpose: ${uploaded.purpose}`)
          console.log(`  Size: ${uploaded.size} bytes`)
          console.log(`  Created: ${uploaded.createdAt}`)
        }
        process.exit(0)
      })
      .catch((err) => {
        console.error(`❌ Upload failed: ${err.message}`)
        process.exit(1)
      })
  }

  // Handle file deletion
  if (deleteIndex !== -1 && args[deleteIndex + 1]) {
    const fileId = args[deleteIndex + 1]
    deleteFile(fileId)
      .then((result) => {
        if (jsonOutput) {
          console.log(JSON.stringify(result, null, 2))
        } else {
          if (result.deleted) {
            console.log(`🗑️ Deleted file: ${fileId}`)
          } else {
            console.warn(`❌ Delete failed: ${result.error}`)
          }
        }
        process.exit(0)
      })
      .catch((err) => {
        console.error(`❌ Delete operation failed: ${err.message}`)
        process.exit(1)
      })
  }

  // List files currently uploaded
  if (args.includes('--list')) {
    listFiles()
      .then((files) => {
        if (jsonOutput) {
          console.log(JSON.stringify(files, null, 2))
        } else {
          for (const file of files) {
            console.log(`📄 ${file.name}`)
            console.log(`  ID: ${file.id}`)
            console.log(`  Purpose: ${file.purpose}`)
            console.log(`  Size: ${file.size} bytes`)
            console.log(`  Created: ${file.createdAt}`)
          }
        }
        process.exit(0)
      })
      .catch((err) => {
        console.error(`❌ Listing files failed: ${err.message}`)
        process.exit(1)
      })
  }

  // Try to read the content of the specified chat file
  let fileContent = ''
  try {
    fileContent = await fsPromises.readFile(chatFile, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠️ Chat file not found. Creating empty file: ${chatFile}`)
      await fsPromises.mkdir(path.dirname(chatFile), { recursive: true })
      await fsPromises.writeFile(chatFile, '')
      fileContent = ''
    } else {
      throw err
    }
  }

  // Execute a named script if specified
  if (runIndex !== -1 && args[runIndex + 1]) {
    const name = args[runIndex + 1]
    await runCommand({ name, chatFile, fileIds: fileIds.length ? fileIds.join(',') : null })
    process.exit(0)
  }

  // Check for new questions in the chat file if requested
  if (checkOnly) {
    const { remainder } = getQuestion(fileContent)
    if (!remainder) {
      console.log('❌ No new question found.')
      process.exit(1)
    } else {
      console.log('✅ New question detected.')
      process.exit(0)
    }
  }

  // Show the last assistant response if requested
  if (showLastOnly) {
    const lastAnswer = getLastAnswer(fileContent, removeMd)
    if (lastAnswer) process.stdout.write(lastAnswer.trim() + '\n')
    process.exit(0)
  }

  // Get next question for the assistant based on the chat file
  const { remainder, lastThreadId, lastAnswerIndex } = getQuestion(fileContent)
  if (!remainder) {
    console.log('✅ No new question found after last answer.')
    if (args.includes('--open-md')) await generateMarkdownHtml(chatFile, fileContent)
    process.exit(0)
  }

  // Perform a Brave search if requested and attach results
  if (searchEnabled) {
    console.log('🔍 Asking assistant how to phrase Brave search...')
    const { answer: searchQuery } = await askQuestion({
      question: `You are a tool that extracts concise and effective search queries. Rewrite the user question below into a short, information-retrieval friendly format for a Brave search engine. Be specific and omit any extra commentary.
  
  "${remainder}"`,
      fileIds: [],
      threadId: null
    })
    console.log(`🔎 Brave search query: ${searchQuery.trim()}`)

    try {
      const braveFile = await braveSearchToFile(searchQuery.trim(), { trace: false, maxLinks: 20 })
      if (braveFile) {
        console.log(`📄 Brave content saved to file: ${braveFile}`)
        const uploaded = await uploadFile(braveFile)
        fileIds.unshift(uploaded.id) // Prepend Brave file
      } else {
        console.warn('⚠️ Brave search returned no usable content. Proceeding without attached file.')
      }
    } catch (err) {
      console.warn(`⚠️ Brave search failed: ${err.message}. Proceeding without attached file.`)
    }
  }

  // Ask the assistant a question and process the response
  console.log('🤖 Asking assistant...')
  const { answer, threadId } = await askQuestion({
    question: remainder,
    fileIds,
    threadId: lastThreadId
  })

  // Clean the answer of any external references
  const cleanAnswer = answer.replace(/【\d+:\d+†.*?】/g, '')
  await putAnswer(chatFile, cleanAnswer, threadId, lastAnswerIndex)

  // Optionally render markdown to HTML and open it in the browser after obtaining the answer
  if (args.includes('--open-md')) {
    const updatedContent = await fsPromises.readFile(chatFile, 'utf8')
    await generateMarkdownHtml(chatFile, updatedContent)
  }
})()

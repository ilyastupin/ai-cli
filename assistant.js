import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { generateMarkdownHtml } from './src/markdown.js'
import { askQuestion, uploadFile, listFiles } from './src/ai.js'
import { getQuestion, putAnswer } from './src/parser.js'
import { braveSearchToFile } from './src/brave.js'

const execAsync = promisify(exec)

function showHelpAndExit() {
  console.log(`
🤖 Assistant CLI Tool with Threads (OpenAI Assistants API)

Usage:
  node assistant.js --chat <file.txt> [--open-md] [--use <file-id1,file-id2,...>] [--search]
  node assistant.js --upload <file>
  node assistant.js --list

Options:
  --chat <file.txt>     Run assistant with chat file (thread continues via embedded thread_id)
  --open-md             Render markdown to HTML and open after answering
  --use <ids>           Attach one or more uploaded file IDs (comma-separated)
  --upload <file>       Upload a file (purpose: assistants)
  --list                List uploaded files
  --search              Perform Brave search and attach results to assistant
  --help                Show this message
`)
  process.exit(0)
}

const args = process.argv.slice(2)
if (args.includes('--help') || args.length === 0) showHelpAndExit()

const chatIndex = args.indexOf('--chat')
const uploadIndex = args.indexOf('--upload')
const useIndex = args.indexOf('--use')
const searchEnabled = args.includes('--search')

// Parse multiple --use file IDs if present
let fileIds = []
if (useIndex !== -1 && args[useIndex + 1]) {
  fileIds = args[useIndex + 1]
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

// --- Upload file
if (uploadIndex !== -1 && args[uploadIndex + 1]) {
  const filePath = path.resolve(args[uploadIndex + 1])
  const uploaded = await uploadFile(filePath)
  console.log(`✅ Uploaded ${uploaded.name}`)
  console.log(`  ID: ${uploaded.id}`)
  console.log(`  Purpose: ${uploaded.purpose}`)
  console.log(`  Size: ${uploaded.size} bytes`)
  console.log(`  Created: ${uploaded.createdAt}`)
  process.exit(0)
}

// --- List files
if (args.includes('--list')) {
  const files = await listFiles()
  for (const file of files) {
    console.log(`📄 ${file.name}`)
    console.log(`  ID: ${file.id}`)
    console.log(`  Purpose: ${file.purpose}`)
    console.log(`  Size: ${file.size} bytes`)
    console.log(`  Created: ${file.createdAt}`)
  }
  process.exit(0)
}

// --- Chat file logic
if (chatIndex === -1 || !args[chatIndex + 1]) showHelpAndExit()
const chatFile = path.resolve(args[chatIndex + 1])
const fileContent = await fsPromises.readFile(chatFile, 'utf8')

const { remainder, lastThreadId, lastAnswerIndex } = getQuestion(fileContent)
if (!remainder) {
  console.log('✅ No new question found after last answer.')
  if (args.includes('--open-md')) await generateMarkdownHtml(chatFile, fileContent)
  process.exit(0)
}

// --- If search is enabled, ask what to search
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

// --- Ask final question
console.log('🤖 Asking assistant...')
const { answer, threadId } = await askQuestion({
  question: remainder,
  fileIds,
  threadId: lastThreadId
})
const cleanAnswer = answer.replace(/【\d+:\d+†.*?】/g, '')
await putAnswer(chatFile, cleanAnswer, threadId, lastAnswerIndex)

if (args.includes('--open-md')) {
  const updatedContent = await fsPromises.readFile(chatFile, 'utf8')
  await generateMarkdownHtml(chatFile, updatedContent)
}

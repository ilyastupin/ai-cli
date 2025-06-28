import fs from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'
import { exec } from 'child_process'
import { promisify } from 'util'
import { generateMarkdownHtml } from './src/markdown.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const execAsync = promisify(exec)

function showHelpAndExit() {
  console.log(`
🤖 Assistant CLI Tool with Threads (OpenAI Assistants API)

Usage:
  node assistant.js --chat <file.txt> [--open-md] [--use <file-id>]
  node assistant.js --upload <file>
  node assistant.js --list

Options:
  --chat <file.txt>     Run assistant with chat file (thread continues via embedded thread_id)
  --open-md             Render markdown to HTML and open after answering
  --use <file-id>       Attach uploaded file (e.g., knowledge base) to assistant
  --upload <file>       Upload a file (purpose: assistants)
  --list                List uploaded files
  --help                Show this message
`)
  process.exit(0)
}

const args = process.argv.slice(2)
if (args.includes('--help') || args.length === 0) showHelpAndExit()

const chatIndex = args.indexOf('--chat')
const uploadIndex = args.indexOf('--upload')
const useIndex = args.indexOf('--use')
const fileIds = useIndex !== -1 && args[useIndex + 1] ? [args[useIndex + 1]] : []

// --- Upload file
if (uploadIndex !== -1 && args[uploadIndex + 1]) {
  const filePath = path.resolve(args[uploadIndex + 1])
  const file = await fs.readFile(filePath)
  const name = path.basename(filePath)

  const uploaded = await openai.files.create({ file, purpose: 'assistants' })
  console.log(`✅ Uploaded ${name}`)
  console.log(`  ID: ${uploaded.id}`)
  console.log(`  Purpose: ${uploaded.purpose}`)
  console.log(`  Size: ${uploaded.bytes} bytes`)
  console.log(`  Created: ${new Date(uploaded.created_at * 1000).toLocaleString()}`)
  process.exit(0)
}

// --- List files
if (args.includes('--list')) {
  const result = await openai.files.list()
  for (const file of result.data) {
    console.log(`📄 ${file.filename}`)
    console.log(`  ID: ${file.id}`)
    console.log(`  Purpose: ${file.purpose}`)
    console.log(`  Size: ${file.bytes} bytes`)
    console.log(`  Created: ${new Date(file.created_at * 1000).toLocaleString()}`)
  }
  process.exit(0)
}

// --- Chat file logic
if (chatIndex === -1 || !args[chatIndex + 1]) showHelpAndExit()
const chatFile = path.resolve(args[chatIndex + 1])
const fileContent = await fs.readFile(chatFile, 'utf8')

const answerBlockRegex = /### answer #(\d+)\n([\s\S]*?)\n\nanswer #\1 end \((thread_[^\)]+)\)\n\n---/g
let lastMatch
for (const match of fileContent.matchAll(answerBlockRegex)) lastMatch = match
const lastAnswerIndex = lastMatch ? Number(lastMatch[1]) : 0
const lastThreadId = lastMatch ? lastMatch[3] : null
const lastAnswerEnd = lastMatch ? lastMatch.index + lastMatch[0].length : 0
const remainder = fileContent.slice(lastAnswerEnd).trim()

if (!remainder) {
  console.log('✅ No new question found after last answer.')
  if (args.includes('--open-md')) await generateMarkdownHtml(chatFile, fileContent)
  process.exit(0)
}

console.log('⏳ Creating assistant and thread...')
const assistant = await openai.beta.assistants.create({
  name: 'CLI Assistant',
  instructions: 'You are a helpful assistant.',
  model: 'gpt-4o',
  tools: fileIds.length > 0 ? [{ type: 'file_search' }] : []
})

const thread = lastThreadId ? { id: lastThreadId } : await openai.beta.threads.create()
console.log(fileIds)
await openai.beta.threads.messages.create(thread.id, {
  role: 'user',
  content: remainder,
  attachments: fileIds.map((file_id) => ({
    file_id,
    tools: [{ type: 'file_search' }]
  }))
})

const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id
})

let status = 'queued'
while (status !== 'completed' && status !== 'failed') {
  await new Promise((r) => setTimeout(r, 1000))
  const check = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id })
  status = check.status
}

if (status === 'failed') {
  console.error('❌ Run failed.')
  process.exit(1)
}

const messages = await openai.beta.threads.messages.list(thread.id)
const answer = messages.data.find((m) => m.role === 'assistant')?.content?.[0]?.text?.value || ''
const currentIndex = lastAnswerIndex + 1
const newBlock = `\n\n### answer #${currentIndex}\n${answer.trim()}\n\nanswer #${currentIndex} end (${thread.id})\n\n---\n`
await fs.appendFile(chatFile, newBlock)
console.log('📁 Answer written to file.')

if (args.includes('--open-md')) await generateMarkdownHtml(chatFile, fileContent + newBlock)

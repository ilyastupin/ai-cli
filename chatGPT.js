import fs from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'
import { exec } from 'child_process'
import { promisify } from 'util'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const execAsync = promisify(exec)

// --- 🆘 Help Message
function showHelpAndExit() {
  console.log(`
🧠 ChatGPT CLI Tool

Usage:
  node chatGPT.js --chat <file.txt> [--open-md]
  node chatGPT.js --upload <file>         Upload file to OpenAI (purpose: assistants)
  node chatGPT.js --list                  List uploaded files and metadata

Options:
  --chat <file.txt>     Path to your markdown chat file
  --open-md             After answering, render markdown to HTML and open it
  --upload <file>       Upload file to OpenAI Files API
  --list                List all uploaded files with metadata
  --help                Show this help message

Examples:
  node chatGPT.js --chat session1.txt
  node chatGPT.js --chat session1.txt --open-md
  node chatGPT.js --upload data.json
  node chatGPT.js --list
`)
  process.exit(0)
}

// --- 🔧 Argument Parsing
const args = process.argv.slice(2)
if (args.includes('--help') || args.length === 0) {
  showHelpAndExit()
}

// --- 📤 Upload file
const uploadIndex = args.indexOf('--upload')
if (uploadIndex !== -1 && args[uploadIndex + 1]) {
  const uploadPath = path.resolve(args[uploadIndex + 1])
  const data = await fs.readFile(uploadPath)
  const name = path.basename(uploadPath)

  const uploaded = await openai.files.create({
    file: await fs.readFile(uploadPath),
    purpose: 'assistants'
  })
  console.log(`✅ Uploaded ${name}`)
  console.log(`  ID: ${uploaded.id}`)
  console.log(`  Purpose: ${uploaded.purpose}`)
  console.log(`  Size: ${uploaded.bytes} bytes`)
  console.log(`  Created: ${new Date(uploaded.created_at * 1000).toLocaleString()}`)
  process.exit(0)
}

// --- 📜 List files
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

const chatIndex = args.indexOf('--chat')
if (chatIndex === -1 || !args[chatIndex + 1]) {
  showHelpAndExit()
}

const chatFile = path.resolve(args[chatIndex + 1])
const fileContent = await fs.readFile(chatFile, 'utf8')

// --- 🧠 Detect last answer number and remainder
const answerBlockRegex = /### answer #(\d+)\n([\s\S]*?)\n\nanswer #\1 end\n\n---/g
let lastMatch
for (const match of fileContent.matchAll(answerBlockRegex)) {
  lastMatch = match
}
const lastAnswerIndex = lastMatch ? Number(lastMatch[1]) : 0
const lastAnswerEndPos = lastMatch ? lastMatch.index + lastMatch[0].length : 0

const remainder = fileContent.slice(lastAnswerEndPos).trim()

// --- 📖 Generate Markdown view
async function generateMarkdownHtml(extra = '') {
  const templatePath = path.resolve('markdown-viewer-template.html')

  const outDir = path.resolve('out')
  await fs.mkdir(outDir, { recursive: true })

  const htmlFilename = path.basename(chatFile).replace(/\.txt$/, '.html')
  const htmlPath = path.join(outDir, htmlFilename)

  const rawContent = fileContent.trimEnd() + (extra ? '\n\n' + extra : '')
  const escaped = rawContent.replace(/`/g, '\\`')

  const template = await fs.readFile(templatePath, 'utf8')
  const html = template.replace('__MARKDOWN_PLACEHOLDER__', escaped)

  await fs.writeFile(htmlPath, html)
  console.log(`🌐 Markdown HTML view written to ${htmlPath}`)

  const openCmd =
    process.platform === 'darwin'
      ? `open "${htmlPath}"`
      : process.platform === 'win32'
      ? `start "" "${htmlPath}"`
      : `xdg-open "${htmlPath}"`

  await execAsync(openCmd)
}

// --- 🛑 No new question
if (!remainder) {
  console.log('✅ No new question found after last answer.')
  if (args.includes('--open-md')) await generateMarkdownHtml()
  process.exit(0)
}

console.log('⏳ Waiting for response... (tokens: 0)')

// --- 💬 Build full message history
const qaRegex = /(?:^|\n)([^\n]+)\n+### answer #\d+\n([\s\S]+?)\n\nanswer #\d+ end\n\n---/g
const messages = [{ role: 'system', content: 'You are a helpful assistant.' }]

for (const match of fileContent.matchAll(qaRegex)) {
  const [, question, answer] = match
  messages.push({ role: 'user', content: question.trim() })
  messages.push({ role: 'assistant', content: answer.trim() })
}
messages.push({ role: 'user', content: remainder })

// --- ⚠️ Ctrl+C handling
let answerText = ''
let tokenCount = 0
let interrupted = false
const currentIndex = lastAnswerIndex + 1

process.on('SIGINT', async () => {
  interrupted = true
  process.stdout.write('\n🛑 Caught Ctrl+C — cleaning up...\n')

  if (answerText.trim()) {
    const partialBlock = `\n\n### answer #${currentIndex}\n${answerText.trim()}\n\nanswer #${currentIndex} end\n\n---\n`
    await fs.appendFile(chatFile, partialBlock)
    console.log('💾 Partial answer saved before exit.')
  }

  process.exit(1)
})

// --- 💬 Stream OpenAI response
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages,
  stream: true
})

process.stdout.write('🔄 ')
for await (const chunk of stream) {
  const token = chunk.choices[0]?.delta?.content || ''
  answerText += token
  tokenCount++

  if (tokenCount % 10 === 0) {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    process.stdout.write(`🔄 Tokens received: ${tokenCount}`)
  }
}
process.stdout.clearLine(0)
process.stdout.cursorTo(0)
console.log(`✅ Completed. Total tokens: ${tokenCount}`)

// --- 🧾 Append full answer block if not interrupted
const newBlock = `\n\n### answer #${currentIndex}\n${answerText.trim()}\n\nanswer #${currentIndex} end\n\n---\n`

if (!interrupted) {
  await fs.appendFile(chatFile, newBlock)
  console.log('📁 Answer written to file.')
}

// --- 🌐 Open HTML view if requested
if (args.includes('--open-md')) {
  await generateMarkdownHtml(newBlock.trim())
}

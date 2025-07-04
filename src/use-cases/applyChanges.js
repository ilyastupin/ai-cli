import { ask } from './ask.js'
import { answer } from '../history/history.js'
import { getFullContent, getFileList } from '../providers/prompts.js'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'

const LOG_FILE = path.resolve('log/ai.json')

/**
 * Checks if the assistant reply indicates clarification is needed (based on first line).
 * If so, logs the message and exits the process.
 *
 * @param {string} reply - Assistant response string
 * @param {string} contextLabel - Label indicating what was being processed
 */
function handleClarification(reply, contextLabel) {
  const firstLine = typeof reply === 'string' ? reply.split(/\r?\n/)[0] : ''
  if (firstLine.toLowerCase().includes('clarification needed')) {
    console.log(reply)
    console.log(`⚠️ Assistant requested clarification for: ${contextLabel}`)
    process.exit(1)
  }
}

/**
 * Applies content analysis to a list of files, triggering assistant review for each.
 * If the assistant replies with "clarification needed" in the first line, logs and exits.
 *
 * @param {string} fileList - Multiline string of filenames to check.
 */
export async function applyChanges(fileList) {
  const files = fileList.split(/\r?\n/).filter(Boolean)
  const batchId = randomUUID()

  for (const f of files) {
    console.log(`\n🔍 Processing file: ${f}`)
    console.log(`🆔 Batch ID: ${batchId}`)

    const content = getFullContent(f)

    await ask(content, {
      action: 'getFullContent',
      fileName: f,
      id: batchId
    })

    const latest = answer(0)
    handleClarification(latest, f)
  }

  console.log('\n✅ All files processed successfully.')
}

/**
 * Overwrites files using the latest batch of assistant-generated content.
 * Looks for askQuestion entries with context.action === 'getFullContent' and shared context.id.
 */
export function overwriteFiles() {
  if (!fs.existsSync(LOG_FILE)) {
    throw new Error(`Log file not found at ${LOG_FILE}`)
  }

  const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))

  const latestEntry = [...logs]
    .reverse()
    .find(
      (entry) =>
        entry.funcName === 'askQuestion' &&
        entry.arguments?.context?.action === 'getFullContent' &&
        typeof entry.arguments.context.id === 'string'
    )

  if (!latestEntry) {
    throw new Error(`No askQuestion entry with context.action === "getFullContent" and a valid id found`)
  }

  const targetId = latestEntry.arguments.context.id

  const matches = logs.filter(
    (entry) =>
      entry.funcName === 'askQuestion' &&
      entry.arguments?.context?.id === targetId &&
      typeof entry.arguments.context.fileName === 'string' &&
      typeof entry.result === 'string'
  )

  if (matches.length === 0) {
    throw new Error(`No askQuestion entries found with context.id = ${targetId}`)
  }

  for (const entry of matches) {
    const filePath = path.resolve(entry.arguments.context.fileName)
    fs.writeFileSync(filePath, entry.result, 'utf-8')
    console.log(`✅ Overwritten: ${entry.arguments.context.fileName}`)
  }
}

/**
 * Triggers assistant to generate a file list based on the current question prompt.
 * If clarification is requested, logs the message and exits the process.
 */
export async function makeFileList(prompt) {
  await ask(getFileList(prompt), { action: 'getFileList' })

  const latest = answer(0)
  console.log(latest)
  handleClarification(latest, 'file list generation')
}

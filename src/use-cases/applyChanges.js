import { ask } from './ask.js'
import { answer } from '../history/history.js'
import { getFullContent } from '../providers/prompts.js'
import { randomUUID } from 'crypto'

/**
 * Applies content analysis to a list of files, triggering assistant review for each.
 * If the assistant replies with "clarification needed" in the first line, logs and skips further processing.
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
    const firstLine = typeof latest === 'string' ? latest.split(/\r?\n/)[0] : ''

    if (firstLine.toLowerCase().includes('clarification needed')) {
      console.log(latest)
      console.log(`⚠️ Assistant requested clarification for file: ${f}`)
      return
    }
  }

  console.log('\n✅ All files processed successfully.')
}
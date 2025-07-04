import { ask } from './ask.js'
import { answer } from '../history/history.js'
import { getFullContent } from '../providers/files.js'

/**
 * Applies content analysis to a list of files, triggering assistant review for each.
 * If the assistant replies with "clarification needed", an error is thrown.
 *
 * @param {string} fileList - Multiline string of filenames to check.
 * @throws {Error} if any response includes "clarification needed".
 */
export async function applyChanges(fileList) {
  const files = fileList.split(/\r?\n/).filter(Boolean)

  for (const f of files) {
    const content = getFullContent(f)
    await ask(content, { action: 'getFullContent', fileName: f })

    const latest = answer(0)
    if (typeof latest === 'string' && latest.toLowerCase().includes('clarification needed')) {
      throw new Error(`⚠️ Assistant requested clarification for file: ${f}`)
    }
  }
}

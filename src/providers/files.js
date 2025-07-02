import { execSync } from 'child_process'
import fs from 'fs'
import { isBinary } from 'istextorbinary'

/**
 * Checks whether a file is binary using its content.
 * @param {string} filePath
 * @returns {boolean}
 */
function isBinaryFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath)
    return isBinary(filePath, buffer)
  } catch (err) {
    console.warn(`⚠️ Skipping unreadable file "${filePath}": ${err.message}`)
    return true // assume binary if unreadable
  }
}

/**
 * Returns latest Git commit hash and list of text-based (non-binary) tracked files.
 * @returns {{ commit: string, files: string[] }}
 */
export function getGitTrackedFiles() {
  try {
    const filesOutput = execSync('git ls-files', { encoding: 'utf-8' })
    const allFiles = filesOutput.split('\n').filter(Boolean)

    const textFiles = allFiles.filter((file) => !isBinaryFile(file))

    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()

    return { commit: commitHash, files: textFiles }
  } catch (err) {
    console.error('❌ Failed to run git commands:', err.message)
    return { commit: null, files: [] }
  }
}

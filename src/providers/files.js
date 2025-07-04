import { execSync } from 'child_process'
import fs from 'fs'
import { isBinary } from 'istextorbinary'

/**
 * Checks whether a file is binary using its content.
 * 
 * @param {string} filePath - The path of the file to check.
 * @returns {boolean} True if the file is binary, false if it's text-based.
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
 * Returns the latest Git commit hash and a list of text-based (non-binary) tracked files.
 * 
 * @returns {{ commit: string, files: string[] }} An object containing the latest commit hash and an array of text-based file paths.
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
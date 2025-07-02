// src/git.js
import { execSync } from 'child_process'

/**
 * Returns an array of files tracked by git in the current repository.
 * @returns {string[]} List of file paths
 */
export function getGitTrackedFiles() {
  try {
    const output = execSync('git ls-files', { encoding: 'utf-8' })
    return output.split('\n').filter(Boolean)
  } catch (err) {
    console.error('❌ Failed to run git ls-files:', err.message)
    return []
  }
}

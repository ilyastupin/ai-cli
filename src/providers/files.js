import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import archiver from 'archiver'

/**
 * Returns the latest Git commit hash and list of all tracked files.
 * @returns {{ commit: string, files: string[] }}
 */
function getGitTrackedFiles() {
  try {
    const filesOutput = execSync('git ls-files', { encoding: 'utf-8' })
    const files = filesOutput.split('\n').filter(Boolean)
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
    return { commit, files }
  } catch (err) {
    console.error('❌ Failed to get git files:', err.message)
    return { commit: 'unknown', files: [] }
  }
}

/**
 * Archives Git-tracked project files into a zip file in `.tmp/` folder.
 * @returns {Promise<string>} Absolute path to the zip archive.
 */
export async function zipCodebase() {
  const { commit, files } = getGitTrackedFiles()

  const tmpDir = path.resolve('.tmp')
  const zipPath = path.join(tmpDir, `codebase-${commit.slice(0, 8)}.zip`)
  fs.mkdirSync(tmpDir, { recursive: true })

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', resolve)
    archive.on('error', reject)

    archive.pipe(output)
    files.forEach((file) => archive.file(file, { name: file }))
    archive.finalize()
  })

  return zipPath
}

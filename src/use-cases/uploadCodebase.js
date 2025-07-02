import fs from 'fs'
import path from 'path'
import { getGitTrackedFiles } from '../providers/files.js'
import { createVectorStore, uploadFilesToVectorStore } from '../providers/ai.js'

/**
 * Uploads all Git-tracked **text-based** project files as a single document to a new vector store.
 * Skips binary files and `package-lock.json`.
 *
 * @returns {Promise<number>} number of files uploaded (always 1)
 */
export async function uploadCodebase() {
  const { commit, files } = getGitTrackedFiles()

  const tmpDir = path.resolve('.tmp')
  const outputFile = path.join(tmpDir, `codebase-${commit.slice(0, 8)}.txt`)
  fs.mkdirSync(tmpDir, { recursive: true })

  const writeStream = fs.createWriteStream(outputFile)

  for (const file of files) {
    if (file === 'package-lock.json') continue

    try {
      const content = fs.readFileSync(file, 'utf-8')
      writeStream.write(`\n\n// ${file}\n`)
      writeStream.write(content)
    } catch {
      console.warn(`⚠️ Skipping binary or unreadable file: ${file}`)
    }
  }

  writeStream.end()

  await new Promise((res) => writeStream.on('finish', res))

  const vectorStoreName = `codebase_${commit.slice(0, 8)}`
  const vectorStoreId = await createVectorStore(vectorStoreName)

  const uploadedCount = await uploadFilesToVectorStore(vectorStoreId, [outputFile], { commit })

  console.log(`📦 Uploaded ${uploadedCount} file(s) to vector store: ${vectorStoreId}`)

  return uploadedCount
}

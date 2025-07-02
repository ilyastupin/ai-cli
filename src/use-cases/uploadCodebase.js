import { getGitTrackedFiles } from '../providers/files.js'
import { uploadFilesToVectorStore, createVectorStore } from '../providers/ai.js'
import { getLatestVectorStoreId } from '../history/history.js'

/**
 * Uploads all Git-tracked, text-based project files to the vector store.
 * If no existing vector store is found, a new one is created.
 * Excludes package-lock.json explicitly.
 *
 * @returns {Promise<number>} number of uploaded files
 */
export async function uploadCodebase() {
  let vectorStoreId = getLatestVectorStoreId()
  let isNew = false

  if (!vectorStoreId) {
    vectorStoreId = await createVectorStore('codebase')
    isNew = true
    console.log(`🆕 Created new vector store: ${vectorStoreId}`)
  } else {
    console.log(`♻️ Reusing existing vector store: ${vectorStoreId}`)
  }

  const { commit, files } = getGitTrackedFiles()

  const uploadedCount = await uploadFilesToVectorStore(vectorStoreId, filteredFiles)

  console.log(`📦 Uploaded ${uploadedCount} file(s) to vector store: ${vectorStoreId}`)

  return uploadedCount
}

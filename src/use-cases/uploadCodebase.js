import { getGitTrackedFiles } from '../providers/git.js'
import { uploadFilesToVectorStore } from '../providers/ai.js'

/**
 * Uploads all Git-tracked, text-based project files to the vector store.
 * Excludes package-lock.json explicitly.
 *
 * @param {string} vectorStoreId
 * @param {object} [metadata={}]
 * @returns {Promise<number>} number of uploaded files
 */
export async function uploadCodebase(vectorStoreId, metadata = {}) {
  const { commit, files } = getGitTrackedFiles()

  const filteredFiles = files.filter((file) => file !== 'package-lock.json')

  const uploadedCount = await uploadFilesToVectorStore(vectorStoreId, filteredFiles, {
    commit,
    ...metadata
  })

  return uploadedCount
}

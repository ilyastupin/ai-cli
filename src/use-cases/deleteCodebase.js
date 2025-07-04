import { getLatestVectorStoreId, findVectorStoreFileIdByName } from '../history/history.js'
import { deleteVectorStoreFile } from '../providers/ai.js'

/**
 * Deletes the uploaded codebase file from the latest vector store.
 * Looks for a file with 'codebase' in its path.
 */
export async function deleteCodebase() {
  const vectorStoreId = getLatestVectorStoreId()
  if (!vectorStoreId) {
    throw new Error('❌ No vector store ID found. Have you uploaded the codebase?')
  }

  const fileId = findVectorStoreFileIdByName('codebase')
  if (!fileId) {
    throw new Error(`❌ No file found in vector store "${vectorStoreId}" with 'codebase' in the name.`)
  }

  console.log(`🗑️ Deleting codebase file from vector store ${vectorStoreId}: ${fileId}`)
  await deleteVectorStoreFile(vectorStoreId, fileId)
  console.log(`✅ Codebase file deleted.`)
}
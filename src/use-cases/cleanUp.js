import { getVectorAndAssistantCreations, deleteHistory } from '../history/history.js'
import { deleteVectorStore, deleteAssistant } from '../providers/ai.js'

/**
 * Deletes all vector stores and assistants created (based on `log/ai.json`)
 */
export async function cleanUp() {
  try {
    const items = await getVectorAndAssistantCreations()
    if (items) {
      const vectorStores = items
        .filter((x) => x.funcName === 'createVectorStore')
        .map((x) => x.result?.id)
        .filter(Boolean)

      const assistants = items
        .filter((x) => x.funcName === 'createAssistant')
        .map((x) => x.result?.id)
        .filter(Boolean)

      console.log(`🧹 Cleaning up ${vectorStores.length} vector stores and ${assistants.length} assistants`)

      for (const id of vectorStores) {
        console.log(`🗑️ Deleting vector store: ${id}`)
        await deleteVectorStore(id)
      }

      for (const id of assistants) {
        console.log(`🗑️ Deleting assistant: ${id}`)
        await deleteAssistant(id)
      }

      await deleteHistory()
    }
    console.log('✅ Clean up complete.')
  } catch (err) {
    console.error('❌ Clean up failed:', err.message)
  }
}

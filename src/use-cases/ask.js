import {
  getLatestVectorStoreId,
  getLatestAssistantId,
  getLatestThreadId,
  getProjectName,
  putHistory
} from '../history/history.js'
import { createAssistant, createThread, askQuestion, createVectorStore } from '../providers/ai.js'

/**
 * Ask a question using the latest assistant and thread.
 * Optionally attaches the latest vector store.
 *
 * @param {string} question - The user’s question.
 * @param {boolean} internal - If true, skips logging the question to history.
 * @returns {Promise<string>} The assistant's reply.
 */
export async function ask(question, context = {}) {
  let vectorStoreId = getLatestVectorStoreId()
  if (!vectorStoreId) {
    vectorStoreId = await createVectorStore(getProjectName())
    console.log(`📦 Created new vector store: ${vectorStoreId}`)
  } else {
    console.log(`📂 Reusing vector store: ${vectorStoreId}`)
  }

  const vectorStoreIds = [vectorStoreId]

  let assistantId = getLatestAssistantId()
  if (!assistantId) {
    assistantId = await createAssistant({
      name: 'Helpful Assistant',
      instructions: 'You are a helpful assistant.',
      model: 'gpt-4o',
      vectorStoreIds
    })
    console.log(`🧠 Created new assistant: ${assistantId}`)
  } else {
    console.log(`🤖 Reusing assistant: ${assistantId}`)
  }

  let threadId = getLatestThreadId()
  if (!threadId) {
    threadId = await createThread()
    console.log(`🧵 Created new thread: ${threadId}`)
  } else {
    console.log(`🔁 Reusing thread: ${threadId}`)
  }

  const reply = await askQuestion({ assistantId, threadId, question, context })

  return reply
}

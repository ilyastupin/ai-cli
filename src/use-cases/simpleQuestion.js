import { getLatestVectorStoreId, getLatestAssistantId, getLatestThreadId } from '../history/history.js'
import { createAssistant, createThread, askQuestion } from '../providers/ai.js'

/**
 * Asks a question using the latest assistant/thread. Falls back to default creation if needed.
 * Optionally attaches latest vector store if available.
 *
 * @param {string} question
 * @returns {Promise<string>} assistant's reply
 */
export async function simpleQuestion(question) {
  let vectorStoreId = getLatestVectorStoreId()
  console.log(vectorStoreId)
  const vectorStoreIds = vectorStoreId ? [vectorStoreId] : undefined

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

  const reply = await askQuestion({ assistantId, threadId, question })
  console.log(`💬 Assistant replied:\n${reply}`)

  return reply
}

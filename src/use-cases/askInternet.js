import { getSearchQuery } from '../providers/prompts.js'
import { braveSearchToFile } from '../brave/brave.js'
import { getLatestVectorStoreId, getLatestThreadId, getProjectName, getLatestAssistantId } from '../history/history.js'
import {
  createVectorStore,
  createThread,
  deleteThread,
  uploadFilesToVectorStore,
  uploadFileToStorage,
  askQuestion,
  createAssistant
} from '../providers/ai.js'
import { ask } from './ask.js'
import fs from 'fs'

// Helpers

async function generateSearchQuery(question) {
  const query = await ask(`${getSearchQuery(question)}`, true)
  if (!query || query.length < 3) throw new Error('Empty search query from assistant')
  console.log(`🔍 Brave Search Query: "${query}"`)
  return query
}

async function performBraveSearch(query) {
  const resultFile = await braveSearchToFile(query, { trace: true, maxLinks: 20 })
  if (!resultFile) throw new Error('No results returned from Brave search')
  console.log(`📄 Search results saved to: ${resultFile}`)
  return resultFile
}

async function ensureVectorStore() {
  let vectorStoreId = getLatestVectorStoreId()
  if (!vectorStoreId) {
    vectorStoreId = await createVectorStore(getProjectName())
    console.log(`📦 Created vector store: ${vectorStoreId}`)
  } else {
    console.log(`📂 Reusing vector store: ${vectorStoreId}`)
  }
  return vectorStoreId
}

async function ensureAssistantAndThread(name, instructions) {
  let assistantId = getLatestAssistantId()
  if (!assistantId) {
    assistantId = await createAssistant({ name, instructions, model: 'gpt-4o' })
    console.log(`🧠 Created assistant: ${assistantId}`)
  }

  let threadId = getLatestThreadId()
  if (!threadId) {
    threadId = await createThread()
    console.log(`🧵 Created thread: ${threadId}`)
  }

  return { assistantId, threadId }
}

// Main exports

/**
 * Provides an internet-enhanced answer using vector store context.
 *
 * @param {string} question - The user’s question to query with web search integration.
 * @param {Object} [context={}] - Additional context to provide during the question.
 * @returns {Promise<string>} The assistant's reply.
 */
export async function askWithWebSearchVector(question, context = {}) {
  const query = await generateSearchQuery(question)
  const resultFile = await performBraveSearch(query)

  const vectorStoreId = await ensureVectorStore()
  const uploadedCount = await uploadFilesToVectorStore(vectorStoreId, [resultFile])
  console.log(`📤 Uploaded ${uploadedCount} Brave result file(s) to vector store`)

  return await askQuestion({ assistantId, threadId, question, context })
}

/**
 * Provides an internet-enhanced answer using attached file context.
 *
 * @param {string} question - The user’s question to query with web search integration.
 * @param {Object} [context={}] - Additional context to provide during the question.
 * @returns {Promise<string>} The assistant's reply.
 */
export async function askWithWebSearchFile(question, context = {}) {
  const query = await generateSearchQuery(question)
  const resultFile = await performBraveSearch(query)

  const fileId = await uploadFileToStorage(resultFile)
  console.log(`📤 Uploaded file ID: ${fileId}`)

  const { assistantId, threadId } = await ensureAssistantAndThread(
    'Web-Informed Assistant',
    'Answer questions using the provided file if relevant.'
  )

  return await askQuestion({
    assistantId,
    threadId,
    question,
    fileIds: [fileId],
    context
  })
}

/**
 * Provides an internet-enhanced answer by appending raw search context directly into the prompt.
 *
 * @param {string} question - The user’s question to query with appended web search context.
 * @param {Object} [context={}] - Additional context to provide during the question.
 * @returns {Promise<string>} The assistant's reply.
 */
export async function askWithWebSearchInline(question, context = {}) {
  const query = await generateSearchQuery(question)
  const resultFile = await performBraveSearch(query)

  const rawText = await fs.promises.readFile(resultFile, 'utf-8')

  let assistantId = getLatestAssistantId()
  if (!assistantId) {
    assistantId = await createAssistant({
      name: 'Context-Append Assistant',
      instructions: 'Use the context provided in the user question to answer helpfully.',
      model: 'gpt-4o'
    })
    console.log(`🧠 Created assistant: ${assistantId}`)
  }

  const threadId = await createThread()
  console.log(`🧵 Created temporary thread: ${threadId}`)

  const fullPrompt = `${question}\n\n---\n\nHere is some related context from web:\n\n${rawText.slice(0, 8000)}`
  const reply = await askQuestion({ assistantId, threadId, question: fullPrompt, context })

  await deleteThread(threadId)
  console.log(`🧹 Deleted temporary thread: ${threadId}`)

  return reply
}
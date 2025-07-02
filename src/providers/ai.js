import fs from 'fs'
import path from 'path'
import { toFile } from 'openai'
import OpenAI from 'openai'
import { putHistory } from '../history/history.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ─────────────────────────────────────────────────────────────────────────────
// VECTOR STORAGE

export async function createVectorStore(name) {
  const result = await openai.vectorStores.create({ name })
  putHistory('createVectorStore', { name }, result)
  return result.id
}

export async function uploadFilesToVectorStore(vectorStoreId, filePaths, metadata = {}) {
  const files = await Promise.all(filePaths.map((p) => toFile(fs.createReadStream(p), path.relative(process.cwd(), p))))
  await openai.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, { files })
  const uploadedCount = files.length
  putHistory('uploadFilesToVectorStore', { vectorStoreId, filePaths, metadata }, uploadedCount)
  return uploadedCount
}

export async function listVectorStoreFiles(vectorStoreId) {
  const result = await openai.vectorStores.files.list(vectorStoreId)
  return result.data.map((f) => ({
    id: f.id,
    name: f.file_name || f.filename || 'unknown',
    status: f.status
  }))
}

export async function deleteVectorStoreFile(vectorStoreId, fileId) {
  const result = await openai.vectorStores.files.delete(vectorStoreId, fileId)
  putHistory('deleteVectorStoreFile', { vectorStoreId, fileId }, result)
  return result
}

export async function deleteVectorStore(vectorStoreId) {
  const result = await openai.vectorStores.delete(vectorStoreId)
  putHistory('deleteVectorStore', { vectorStoreId }, result)
  return result
}

export async function getVectorStore(vectorStoreId) {
  return await openai.vectorStores.retrieve(vectorStoreId)
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSISTANT

export async function createAssistant({ name, instructions, model, vectorStoreIds }) {
  const result = await openai.beta.assistants.create({
    name,
    instructions,
    model,
    tools: [{ type: 'file_search' }],
    tool_resources: {
      file_search: { vector_store_ids: vectorStoreIds }
    }
  })
  putHistory('createAssistant', { name, instructions, model, vectorStoreIds }, result)
  return result.id
}

export async function updateAssistantVectorStores(assistantId, vectorStoreIds) {
  const result = await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: { vector_store_ids: vectorStoreIds }
    }
  })
  putHistory('updateAssistantVectorStores', { assistantId, vectorStoreIds }, result)
  return result
}

export async function deleteAssistant(assistantId) {
  const result = await openai.beta.assistants.delete(assistantId)
  putHistory('deleteAssistant', { assistantId }, result)
  return result
}

export async function getAssistant(assistantId) {
  return await openai.beta.assistants.retrieve(assistantId)
}

// ─────────────────────────────────────────────────────────────────────────────
// THREAD

export async function createThread() {
  const result = await openai.beta.threads.create()
  putHistory('createThread', {}, result)
  return result.id
}

export async function askQuestion({ assistantId, threadId, question, onProgress = () => {} }) {
  // Add user message to existing thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: question
  })

  // Initiate a run
  let run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId
  })

  // Poll for completion
  while (['queued', 'in_progress'].includes(run.status)) {
    onProgress(run.status)
    await new Promise((r) => setTimeout(r, 1000))
    run = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId })
  }

  // Get latest assistant reply
  const messages = await openai.beta.threads.messages.list(threadId)
  const reply = messages.data
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content?.[0]?.text?.value)
    .filter(Boolean)
    .pop()

  putHistory('askQuestion', { assistantId, threadId, question }, reply)
  return reply
}

export async function getThreadMessages(threadId) {
  const res = await openai.beta.threads.messages.list(threadId)
  return res.data
}

export async function deleteThread(threadId) {
  const result = await openai.beta.threads.delete(threadId)
  putHistory('deleteThread', { threadId }, result)
  return result
}

export async function estimateTokenCount({ threadId, prompt }) {
  const messages = await openai.beta.threads.messages.list(threadId)
  const text = messages.data.flatMap((m) => m.content.map((c) => c.text?.value || '')).join('\n') + '\n' + prompt
  const tokens = encode(text).length
  return tokens
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS

export async function prepareFileWithLogicalPath(filepath, logicalPath) {
  const absPath = path.resolve(filepath)
  const stream = fs.createReadStream(absPath)
  return await toFile(stream, logicalPath)
}

export function getAllTextFilesInDirectory(dir, filterExt = ['.js', '.ts', '.json', '.md']) {
  const files = []
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) walk(fullPath)
      else if (filterExt.includes(path.extname(entry.name))) files.push(fullPath)
    }
  }
  walk(dir)
  return files
}

export function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

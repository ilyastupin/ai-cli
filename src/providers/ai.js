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
  return result.data.map((f) => ({ id: f.id, name: f.filename, status: f.status }))
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
  const result = await openai.assistants.create({
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
  const result = await openai.assistants.update(assistantId, {
    tool_resources: {
      file_search: { vector_store_ids: vectorStoreIds }
    }
  })
  putHistory('updateAssistantVectorStores', { assistantId, vectorStoreIds }, result)
  return result
}

export async function deleteAssistant(assistantId) {
  const result = await openai.assistants.delete(assistantId)
  putHistory('deleteAssistant', { assistantId }, result)
  return result
}

export async function getAssistant(assistantId) {
  return await openai.assistants.retrieve(assistantId)
}

// ─────────────────────────────────────────────────────────────────────────────
// THREAD

export async function createThread() {
  const result = await openai.threads.create()
  putHistory('createThread', {}, result)
  return result.id
}

export async function askQuestion({ assistantId, threadId, question, onProgress = () => {} }) {
  const run = await openai.threads.createAndRun({
    assistant_id: assistantId,
    thread: { id: threadId, messages: [{ role: 'user', content: question }] }
  })

  while (run.status === 'queued' || run.status === 'in_progress') {
    onProgress(run.status)
    await new Promise((r) => setTimeout(r, 1000))
    const updated = await openai.runs.retrieve(run.thread_id, run.id)
    Object.assign(run, updated)
  }

  const messages = await openai.messages.list(run.thread_id)
  const reply = messages.data.find((m) => m.role === 'assistant')?.content?.[0]?.text?.value
  putHistory('askQuestion', { assistantId, threadId, question }, reply)
  return reply
}

export async function getThreadMessages(threadId) {
  const res = await openai.messages.list(threadId)
  return res.data
}

export async function deleteThread(threadId) {
  const result = await openai.threads.delete(threadId)
  putHistory('deleteThread', { threadId }, result)
  return result
}

export async function estimateTokenCount({ threadId, prompt }) {
  const messages = await openai.messages.list(threadId)
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

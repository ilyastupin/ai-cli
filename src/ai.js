import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function askQuestion({ question, fileIds = [], threadId = null }) {
  const assistant = await openai.beta.assistants.create({
    name: 'CLI Assistant',
    instructions: 'You are a helpful assistant.',
    model: 'gpt-4o',
    tools: fileIds.length > 0 ? [{ type: 'file_search' }] : []
  })

  const thread = threadId ? { id: threadId } : await openai.beta.threads.create()

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: question,
    ...(fileIds.length > 0 && {
      attachments: fileIds.map((file_id) => ({
        file_id,
        tools: [{ type: 'file_search' }]
      }))
    })
  })

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id
  })

  let runResult
  do {
    await new Promise((r) => setTimeout(r, 1000))
    runResult = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id })
  } while (runResult.status === 'queued' || runResult.status === 'in_progress')

  if (runResult.status === 'failed') {
    throw new Error('❌ Assistant run failed')
  }

  const messages = await openai.beta.threads.messages.list(thread.id)
  const answer = messages.data.find((m) => m.role === 'assistant')?.content?.[0]?.text?.value || ''

  return { answer, threadId: thread.id }
}

export async function uploadFile(filePath) {
  const absPath = path.resolve(filePath)
  const stream = fs.createReadStream(absPath)

  const uploaded = await openai.files.create({
    file: stream,
    purpose: 'assistants'
  })

  return {
    id: uploaded.id,
    name: uploaded.filename,
    size: uploaded.bytes,
    createdAt: new Date(uploaded.created_at * 1000).toLocaleString(),
    purpose: uploaded.purpose
  }
}

export async function listFiles() {
  const result = await openai.files.list()
  return result.data.map((file) => ({
    id: file.id,
    name: file.filename,
    size: file.bytes,
    createdAt: new Date(file.created_at * 1000).toLocaleString(),
    purpose: file.purpose
  }))
}

export async function deleteFile(fileId) {
  try {
    const res = await openai.files.delete(fileId)
    return { deleted: true, id: res.id }
  } catch (err) {
    console.warn(`❌ Failed to delete file ${fileId}: ${err.message}`)
    return { deleted: false, error: err.message }
  }
}

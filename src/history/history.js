import fs from 'fs'
import path from 'path'

const LOG_FILE = path.resolve('log/ai.json')

// ─────────────────────────────────────────────────────────────────────────────
// Logging and Project Name

export function setProjectName(name) {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE)
    }
  } catch (err) {
    console.warn(`[setProjectName] Failed to delete log: ${err.message}`)
  }

  putHistory('setProjectName', name)
}

export function putQuestion(question, metadata) {
  putHistory('putQuestion', question, metadata)
}

export function getProjectName() {
  try {
    if (!fs.existsSync(LOG_FILE)) return undefined
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const latest = [...logs].reverse().find((entry) => entry.funcName === 'setProjectName')
    return typeof latest?.arguments === 'string' ? latest.arguments : undefined
  } catch (err) {
    console.warn(`[getProjectName] Failed to read log: ${err.message}`)
    return undefined
  }
}

export function putHistory(funcName, args, result) {
  try {
    const logs = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')) : []
    logs.push({ funcName, arguments: args, result })
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2))
  } catch (err) {
    console.warn(`[putHistory] Failed to write log: ${err.message}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Latest Entity IDs (with deletion check)

export function getLatestVectorStoreId() {
  try {
    if (!fs.existsSync(LOG_FILE)) return undefined
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const latest = [...logs]
      .reverse()
      .find((entry) => entry.funcName === 'createVectorStore' && entry.result?.id && !checkIfDeleted(entry.result.id))
    return latest?.result?.id
  } catch (err) {
    console.warn(`[getLatestVectorStoreId] Failed to read log: ${err.message}`)
    return undefined
  }
}

export function getLatestAssistantId() {
  try {
    if (!fs.existsSync(LOG_FILE)) return undefined
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const latest = [...logs]
      .reverse()
      .find((entry) => entry.funcName === 'createAssistant' && entry.result?.id && !checkIfDeleted(entry.result.id))
    return latest?.result?.id
  } catch (err) {
    console.warn(`[getLatestAssistantId] Failed to read log: ${err.message}`)
    return undefined
  }
}

export function getLatestThreadId() {
  try {
    if (!fs.existsSync(LOG_FILE)) return undefined
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const latest = [...logs]
      .reverse()
      .find((entry) => entry.funcName === 'createThread' && entry.result?.id && !checkIfDeleted(entry.result.id))
    return latest?.result?.id
  } catch (err) {
    console.warn(`[getLatestThreadId] Failed to read log: ${err.message}`)
    return undefined
  }
}

export function findVectorStoreFileIdByName(nameSubstring) {
  try {
    if (!fs.existsSync(LOG_FILE)) return undefined
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const latest = [...logs]
      .reverse()
      .find(
        (entry) =>
          entry.funcName === 'uploadFilesToVectorStore' &&
          Array.isArray(entry.arguments?.filePaths) &&
          Array.isArray(entry.result)
      )

    if (!latest) return undefined
    const index = latest.arguments.filePaths.findIndex((p) => p.includes(nameSubstring))
    if (index === -1) return undefined

    const fileId = latest.result[index]
    return checkIfDeleted(fileId) ? undefined : fileId
  } catch (err) {
    console.warn(`[findVectorStoreFileIdByName] Failed to read log: ${err.message}`)
    return undefined
  }
}

export async function getVectorAndAssistantCreations() {
  if (!fs.existsSync(LOG_FILE)) return []
  const entries = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))

  if (!Array.isArray(entries)) throw new Error('Invalid log format: expected an array')

  return entries.filter(
    (entry) =>
      (entry.funcName === 'createVectorStore' || entry.funcName === 'createAssistant') &&
      entry.result?.id &&
      !checkIfDeleted(entry.result.id)
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Deletion + Checks

export async function deleteHistory() {
  try {
    await fs.promises.unlink(LOG_FILE)
    console.log(`🗑️ Deleted log file: ${LOG_FILE}`)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠️ Log file does not exist: ${LOG_FILE}`)
    } else {
      console.error(`❌ Failed to delete log file: ${err.message}`)
      throw err
    }
  }
}

export function getAllDeletedIds() {
  try {
    if (!fs.existsSync(LOG_FILE)) return []
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const ids = []

    for (const entry of logs) {
      const args = entry.arguments
      if (entry.funcName === 'deleteThread' && args?.threadId) ids.push(args.threadId)
      if (entry.funcName === 'deleteVectorStoreFile' && args?.fileId) ids.push(args.fileId)
      if (entry.funcName === 'deleteVectorStore' && args?.vectorStoreId) ids.push(args.vectorStoreId)
      if (entry.funcName === 'deleteAssistant' && args?.assistantId) ids.push(args.assistantId)
    }

    return ids
  } catch (err) {
    console.warn(`[getAllDeletedIds] Failed to read or parse log: ${err.message}`)
    return []
  }
}

export function checkIfDeleted(id) {
  const deletedIds = getAllDeletedIds()
  return deletedIds.includes(id)
}

export function question(n = 0) {
  return printHistoryEntry('putQuestion', n, (entry) => entry.arguments)
}

export function answer(n = 0) {
  return printHistoryEntry('askQuestion', n, (entry) => entry.result)
}

function printHistoryEntry(funcName, n, extractor) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      console.log(`⚠️ No log file found.`)
      return
    }

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const entries = logs.filter((e) => e.funcName === funcName)

    if (entries.length === 0) {
      console.log(`⚠️ No "${funcName}" entries in log.`)
      return
    }

    let index = n >= 0 ? entries.length - 1 - n : 0
    const entry = entries[index]

    if (!entry) {
      console.log(`⚠️ No ${funcName} entry at position ${n}`)
      return
    }

    const value = extractor(entry)
    if (typeof value === 'string') {
      return value
    } else {
      return JSON.stringify(value, null, 2)
    }
  } catch (err) {
    console.error(`[${funcName}] Failed to read log: ${err.message}`)
  }
}

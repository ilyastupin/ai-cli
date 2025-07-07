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
  return printHistoryEntry('askQuestion', n, (entry) => entry.arguments.question)
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

/**
 * Finds the most recent `askQuestion` log entry with context.action === 'getFullContent'
 * and returns the corresponding fileName.
 *
 * @returns {string} file name from the matching log entry
 * @throws {Error} if no matching entry is found
 */
export function getLastUpdatedFileName() {
  if (!fs.existsSync(LOG_FILE)) {
    throw new Error(`No log file found at ${LOG_FILE}`)
  }

  const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))

  const match = [...logs]
    .reverse()
    .find(
      (entry) =>
        entry.funcName === 'askQuestion' &&
        entry.arguments?.context?.action === 'getFullContent' &&
        typeof entry.arguments.context.fileName === 'string'
    )

  if (!match) {
    throw new Error('No askQuestion entry with context.action === "getFullContent" and fileName found')
  }

  return match.arguments.context.fileName
}

/**
 * Returns the result of the most recent askQuestion call
 * where context.action === 'getFileList'.
 *
 * @returns {string} Multiline file list string
 * @throws {Error} If no matching entry is found
 */
export function getLastFileList() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      throw new Error(`Log file not found at ${LOG_FILE}`)
    }

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))

    const match = [...logs]
      .reverse()
      .find(
        (entry) =>
          entry.funcName === 'askQuestion' &&
          entry.arguments?.context?.action === 'getFileList' &&
          typeof entry.result === 'string'
      )

    if (!match) {
      throw new Error('No askQuestion entry with context.action === "getFileList" found in history')
    }

    return match.result
  } catch (err) {
    console.error(`[getLastFileList] ${err.message}`)
    throw err
  }
}

/**
 * Finds the original questions based on specific signatures and context.
 *
 * @param {number} n - The index from the end for the question in the history array.
 * @returns {{ question: string, historyIndex: number }} The original question and its index in the history.
 */
export function originalQuestion(n = 0) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      console.log(`⚠️ No log file found.`)
      return
    }

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const relevantEntries = []

    logs.reverse().forEach((entry, index) => {
      if (
        entry.funcName === 'askQuestion' &&
        entry.arguments?.question &&
        (entry.arguments.question.includes('---+++---') ||
          !['getFullContent', 'getFileList'].includes(entry.arguments.context?.action))
      ) {
        const segments = entry.arguments.question.split('---+++---')
        const questionSegment = segments.length > 2 ? segments[1].trim() : entry.arguments.question
        relevantEntries.push({ question: questionSegment, historyIndex: index })
      }
    })

    if (n < 0 || n >= relevantEntries.length) {
      console.log(`⚠️ No relevant question entry at position ${n}`)
      return
    }

    return relevantEntries[n]
  } catch (err) {
    console.error(`[originalQuestion] Failed to read log: ${err.message}`)
  }
}

/**
 * Retrieves all non-deleted objects created: vector stores, files, assistants, and threads.
 * Validates single item assumption in upload files.
 *
 * @returns {Array<Object>} Array of non-deleted created objects.
 */
export function getAllCreatedObjects() {
  try {
    if (!fs.existsSync(LOG_FILE)) return []
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const objects = logs
      .filter((entry) => {
        return (
          [
            'createVectorStore',
            'uploadFilesToVectorStore',
            'uploadFileToStorage',
            'createAssistant',
            'createThread'
          ].includes(entry.funcName) &&
          entry.result?.id &&
          !checkIfDeleted(entry.result.id)
        )
      })
      .map((entry) => ({ funcName: entry.funcName, id: entry.result.id, filePath: entry.arguments?.filePath }))

    logs.forEach((entry) => {
      if (
        entry.funcName === 'uploadFilesToVectorStore' &&
        (entry.arguments.filePaths.length !== 1 || entry.result.length !== 1)
      ) {
        throw new Error(`Constraint violation: More than one item in filePaths or result for ${entry.funcName}`)
      }
      if (entry.funcName === 'uploadFilesToVectorStore' && !checkIfDeleted(entry.result[0])) {
        objects.push({
          funcName: entry.funcName,
          filePath: entry.arguments.filePaths[0],
          id: entry.result[0]
        })
      }
    })

    return objects
  } catch (err) {
    console.warn(`[getAllCreatedObjects] Failed to retrieve objects: ${err.message}`)
    return []
  }
}

/**
 * Retrieves the vector store ID associated with a given file ID.
 * 
 * @param {string} fileId - The file ID to search for.
 * @returns {string|undefined} The vector store ID if found, otherwise undefined.
 */
export function getVectorStoreIdByFileId(fileId) {
  try {
    if (!fs.existsSync(LOG_FILE)) return undefined
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    const entry = logs.find((entry) => entry.funcName === 'uploadFilesToVectorStore' && entry.result.includes(fileId))
    return entry?.arguments?.vectorStoreId
  } catch (err) {
    console.warn(`[getVectorStoreIdByFileId] Failed to find vector store ID: ${err.message}`)
    return undefined
  }
}

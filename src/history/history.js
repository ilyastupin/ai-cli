import fs from 'fs'
import path from 'path'

const LOG_FILE = path.resolve('log/ai.json')

/**
 * Append a log entry to the ai.json log file.
 * @param {string} funcName
 * @param {any} args
 * @param {any} result
 */
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

/**
 * Returns the most recently created vector store ID from the history log.
 * @returns {string|undefined}
 */
export function getLatestVectorStoreId() {
  try {
    if (!fs.existsSync(LOG_FILE)) return undefined

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))

    const latest = [...logs].reverse().find((entry) => entry.funcName === 'createVectorStore' && entry.result?.id)

    return latest?.result?.id
  } catch (err) {
    console.warn(`[getLatestVectorStoreId] Failed to read log: ${err.message}`)
    return undefined
  }
}

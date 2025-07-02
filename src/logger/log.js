// src/log.js
import fs from 'fs'
import path from 'path'

const LOG_FILE = path.resolve('log/ai.json')

/**
 * Append a log entry to the ai.json log file.
 * @param {string} funcName
 * @param {any} args
 * @param {any} result
 */
export function logAction(funcName, args, result) {
  try {
    const logs = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')) : []

    logs.push({ funcName, arguments: args, result })

    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2))
  } catch (err) {
    console.warn(`[logAction] Failed to write log: ${err.message}`)
  }
}

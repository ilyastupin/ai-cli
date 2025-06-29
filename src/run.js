import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Runs a shell script from the `commands/` folder.
 * @param {string|object} input - The script name as a string, or an object with name, chatFile, and optional fileIds
 * @param {string} [chatFilePath] - Absolute path to the chat file (deprecated, use object input instead)
 */
export async function runCommand(input, chatFilePath = '') {
  let name, chatFile, fileIds

  if (typeof input === 'string') {
    name = input
    chatFile = chatFilePath
    fileIds = null
  } else {
    ;({ name, chatFile, fileIds } = input)
  }

  const scriptPath = path.resolve(__dirname, `../commands/${name}.sh`)

  try {
    await fs.access(scriptPath)
  } catch {
    console.error(`❌ Script not found: ${scriptPath}`)
    process.exit(1)
  }

  const args = [scriptPath, chatFile]
  if (fileIds) {
    args.push(fileIds)
  }

  await new Promise((resolve, reject) => {
    const child = spawn('bash', args, {
      stdio: 'inherit'
    })

    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Script ${name}.sh exited with code ${code}. Please check the script and try again.`)
        reject()
      } else {
        resolve()
      }
    })

    child.on('error', (err) => {
      console.error(`❌ Error executing script: ${err.message}`)
      reject()
    })
  })
}

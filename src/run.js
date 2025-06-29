import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Runs a shell script from the `commands/` folder.
 * @param {string} name - The name of the script (without extension)
 * @param {string} chatFilePath - Absolute path to the chat file (passed as first arg)
 */
export async function runCommand(name, chatFilePath) {
  const scriptPath = path.resolve(__dirname, `../commands/${name}.sh`)

  try {
    await fs.access(scriptPath)
  } catch {
    console.error(`❌ Script not found: ${scriptPath}`)
    process.exit(1)
  }

  await new Promise((resolve, reject) => {
    const child = spawn('sh', [scriptPath, chatFilePath], {
      stdio: 'inherit'
    })

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}`))
      } else {
        resolve()
      }
    })

    child.on('error', reject)
  })
}

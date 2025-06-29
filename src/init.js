import fsPromises from 'fs/promises'
import path from 'path'

const CONFIG_FILE = 'assistant.config.json'
const WRITE_LOCK_TIMEOUT = 1000 // milliseconds
let isWriting = false

// Helper to ensure atomic writes by using a global lock
async function safeWriteFile(filePath, data) {
  while (isWriting) {
    await new Promise(resolve => setTimeout(resolve, WRITE_LOCK_TIMEOUT))
  }

  isWriting = true
  try {
    await fsPromises.writeFile(filePath, data)
  } finally {
    isWriting = false
  }
}

// Initialize the configuration with a given name
export async function initConfig(name) {
  try {
    const configPath = path.resolve(CONFIG_FILE)

    let config = {}

    // Read existing configuration if it exists
    try {
      const existingConfig = await fsPromises.readFile(configPath, 'utf8')
      config = existingConfig ? JSON.parse(existingConfig) : {}
    } catch (err) {
      if (err.code !== 'ENOENT') throw err // Continue if file not found
    }

    // Always update the name
    config.name = name

    // Ensure dump section exists
    if (!config.dump) {
      config.dump = {
        include: ['*.js', '*.jsx', '*.json', '*.ts', '*.tsx', '*.sh'],
        exclude: ['^.vscode/', 'package-lock.json']
      }
    }

    await safeWriteFile(configPath, JSON.stringify(config, null, 2))
    console.log(`✅ Configuration updated with name: ${name}`)
  } catch (error) {
    console.error(`❌ Error updating config file: ${error.message}`)
  }
}

// Update or set the chat file in configuration
export async function updateChatFileConfig(chatFilePath) {
  try {
    const configPath = path.resolve(CONFIG_FILE)
    let config = {}

    // Read existing configuration
    try {
      const existingConfig = await fsPromises.readFile(configPath, 'utf8')
      config = existingConfig ? JSON.parse(existingConfig) : {}
    } catch (err) {
      if (err.code !== 'ENOENT') throw err // Continue if file not found
    }

    // Always store relative paths for chat files
    config.chatFile = path.relative(process.cwd(), chatFilePath)

    await safeWriteFile(configPath, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error(`❌ Error updating chat file in config: ${error.message}`)
  }
}

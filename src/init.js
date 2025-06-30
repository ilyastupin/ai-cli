import fs from 'fs'
import path from 'path'

const CONFIG_FILE = 'assistant.config.json'

// Initialize the configuration with a given name
export function initConfig(name) {
  try {
    const configPath = path.resolve(CONFIG_FILE)

    // Load existing configuration or start with a blank object
    let config = {}
    try {
      const existingConfig = fs.readFileSync(configPath, 'utf8')
      config = existingConfig ? JSON.parse(existingConfig) : {}
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }

    // Update name, preserving other attributes
    config.name = name

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`✅ Configuration updated with name: ${name}`)
  } catch (error) {
    console.error(`❌ Error updating config file: ${error.message}`)
  }
}

// Update or set the chat file in configuration
export function updateChatFileConfig(chatFilePath, silent = false) {
  try {
    const configPath = path.resolve(CONFIG_FILE)

    // Load existing configuration or start with a blank object
    let config = {}
    try {
      const existingConfig = fs.readFileSync(configPath, 'utf8')
      config = existingConfig ? JSON.parse(existingConfig) : {}
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }

    // Update chatFile, preserving other attributes
    config.chatFile = path.relative(process.cwd(), chatFilePath)

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    if (!silent) {
      console.log(`✅ Chat file path updated in configuration: ${chatFilePath}`)
    }
  } catch (error) {
    console.error(`❌ Error updating chat file in config: ${error.message}`)
  }
}

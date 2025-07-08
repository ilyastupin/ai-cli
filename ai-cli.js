import fs from 'fs'
import path from 'path'
import { deleteThread, deleteAssistant, deleteVectorStore, deleteVectorStoreFile } from './src/providers/ai.js'
import {
  setProjectName,
  question,
  answer,
  getLastUpdatedFileName,
  getLastFileList,
  originalQuestion,
  getAllCreatedObjects,
  getVectorStoreIdByFileId
} from './src/history/history.js'

import { uploadCodebase } from './src/use-cases/uploadCodebase.js'
import { deleteCodebase } from './src/use-cases/deleteCodebase.js'
import { ask } from './src/use-cases/ask.js'
import { askWithWebSearchVector } from './src/use-cases/askInternet.js'
import { cleanUp } from './src/use-cases/cleanUp.js'
import { applyChanges, overwriteFiles, makeFileList } from './src/use-cases/applyChanges.js'
import { commitChanges } from './src/use-cases/commitChanges.js'

import { getFileList, getFullContent, clarify } from './src/providers/prompts.js'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version

let startTime

/**
 * Synchronous-like prompt function for Node.js
 * @param {string} question - The question to display to the user
 * @returns {Promise<string>} - User input
 */
async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

function loadAndClearQuestion() {
  const filePath = path.resolve('question.txt')

  if (!fs.existsSync(filePath)) {
    console.log('⚠️ File "question.txt" does not exist. Creating an empty one.')
    fs.writeFileSync(filePath, '')
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const question = raw.trim()

  if (!question) {
    console.log('⚠️ No new question: "question.txt" is empty.')
    process.exit(1)
  }

  // Clear the file
  fs.writeFileSync(filePath, '')

  return question
}

function showHelp() {
  console.log(`AI CLI Tool - Version ${version}`)
  console.log('AI CLI for managing projects and interacting with OpenAI resources')
  console.log('Available commands:')
  console.log('  ai-cli create <name> - Create a new project with <name>.')
  console.log('  ai-cli delete <id> - Delete an object by ID (thread, assistant, vector store, file).')
  console.log('  ai-cli help - Show this help message.')
}

function showMenu() {
  console.log('\nInteractive menu:')
  console.log('0. Change the code')
  console.log('1. Commit the change')
  console.log('2. Show question')
  console.log('3. Show original question')
  console.log('4. Show answer')
  console.log('5. Ask question')
  console.log('6. Ask question with Internet search')
  console.log('7. Delete codebase')
  console.log('8. Upload codebase')
  console.log('9. Show all created objects')
  console.log('10. Custom action')
}

async function showQuestion() {
  resetStartTime()
  const qNumber = parseInt(await prompt('Enter question number (default 0): '), 10) || 0
  console.log(question(qNumber))
}

async function showOriginalQuestion() {
  resetStartTime()
  const qNumber = parseInt(await prompt('Enter original question number from the end: '), 10) || 0
  const original = originalQuestion(qNumber)
  if (original) {
    console.log(`Question number from the end: ${original.historyIndex}`)
    console.log(original.question)
  } else {
    console.log('No original question found at that position.')
  }
}

async function showAnswer() {
  resetStartTime()
  const aNumber = parseInt(await prompt('Enter answer number (default 0): '), 10) || 0
  console.log(answer(aNumber))
}

async function changeTheCode() {
  await makeFileList(loadAndClearQuestion())
  await applyChanges(answer(0))
  overwriteFiles()
}

async function commitChange() {
  commitChanges()
}

async function askQuestion() {
  await ask(loadAndClearQuestion())
  console.log(answer(0))
}

async function askQuestionWithInternet() {
  await askWithWebSearchVector(loadAndClearQuestion())
  console.log(answer(0))
}

async function deleteTheCodebase() {
  await deleteCodebase()
}

async function uploadTheCodebase() {
  await uploadCodebase()
}

async function showAllCreatedObjects() {
  const objects = getAllCreatedObjects()
  objects.forEach((obj) => {
    if (obj.funcName === 'uploadFilesToVectorStore' || obj.funcName === 'uploadFileToStorage') {
      console.log(`Type: ${obj.funcName}, ID: ${obj.id}, File Path: ${obj.filePath}`)
    } else {
      console.log(`Type: ${obj.funcName}, ID: ${obj.id}`)
    }
  })
}

function processCommand(args) {
  const command = args[2]
  const id = args[3]

  switch (command) {
    case 'create':
      const projectName = id
      if (projectName) {
        setProjectName(projectName)
        console.log(`Project "${projectName}" created.`)
      } else {
        console.log('❌ Please provide a project name.')
      }
      break
    case 'delete':
      if (id) {
        try {
          if (id.startsWith('thread_')) {
            deleteThread(id)
          } else if (id.startsWith('asst_')) {
            deleteAssistant(id)
          } else if (id.startsWith('vs_')) {
            deleteVectorStore(id)
          } else if (id.startsWith('file-')) {
            const vectorStoreId = getVectorStoreIdByFileId(id)
            if (!vectorStoreId) throw new Error('Vector store ID not found for the given file ID.')
            deleteVectorStoreFile(vectorStoreId, id)
          } else {
            throw new Error('Unrecognized ID format.')
          }
          console.log(`Deleted object with ID: ${id}`)
        } catch (error) {
          console.error(`Failed to delete: ${error.message}`)
        }
      } else {
        console.log('❌ Please provide an ID to delete.')
      }
      break
    case 'help':
      showHelp()
      break
    default:
      console.log('Invalid command. Use "ai-cli help" for a list of commands.')
  }
}

function resetStartTime() {
  startTime = new Date()
}

async function main() {
  startTime = new Date()

  if (process.argv.length > 2) {
    processCommand(process.argv)
  } else {
    showHelp()
    showMenu()
    const option = parseInt(await prompt('Select an option (default 0): '), 10) || 0

    resetStartTime()
    switch (option) {
      case 0:
        await changeTheCode()
        break
      case 1:
        await commitChange()
        break
      case 2:
        await showQuestion()
        break
      case 3:
        await showOriginalQuestion()
        break
      case 4:
        await showAnswer()
        break
      case 5:
        await askQuestion()
        break
      case 6:
        await askQuestionWithInternet()
        break
      case 7:
        await deleteTheCodebase()
        break
      case 8:
        await uploadTheCodebase()
        break
      case 9:
        await showAllCreatedObjects()
        break
      case 10:
        await custom()
        break
      default:
        console.log('Invalid option')
    }
  }

  const endTime = new Date()
  const duration = (endTime - startTime) / 1000
  console.log(`⏱️ Command completed in ${duration} seconds`)
}

main().catch(console.error)

async function custom() {
  // Example custom functionality can be placed here
  console.log(getLastFileList())
}
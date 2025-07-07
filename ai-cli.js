import fs from 'fs'
import path from 'path'
import {
  setProjectName,
  question,
  answer,
  getLastUpdatedFileName,
  getLastFileList,
  originalQuestion,
  getAllCreatedObjects
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
    console.log('⚠️ No new question: file "question.txt" does not exist.')
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

function showMenu() {
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
  const qNumber = parseInt(await prompt('Enter question number (default 0): '), 10) || 0
  console.log(question(qNumber))
}

async function showOriginalQuestion() {
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

showMenu()
const option = parseInt(await prompt('Select an option (default 0): '), 10) || 0

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

async function custom() {
  // console.log(question(0))
  // answer(1)
  // console.log(answer(0))
  // const q = loadAndClearQuestion()
  // await applyChanges(answer(0))
  // setProjectName('ai-cli')
  // await uploadCodebase()
  // await ask(q)
  // await ask(getFileList(q), { action: 'getFileList' })
  // console.log(answer(0))
  // replaceFile(getLastUpdatedFileName(), answer(0))
  // await deleteCodebase()
  // cleanUp()
  // const q = loadAndClearQuestion()
  // await ask(getFileList(q), { action: 'getFileList' })
  // console.log(answer(0))
  // await uploadCodebase()
  // await deleteCodebase()
  // await uploadCodebase()
  // await ask('what clarification')
  // console.log(answer(0))
  // await ask(loadAndClearQuestion())
  // console.log(answer(0))
  // await deleteCodebase()
  // await uploadCodebase()
  // await applyChanges(getLastFileList())
  // overwriteFiles()
  // await ask(loadAndClearQuestion())
  // console.log(question(0))
  // console.log(answer(0))
  // await ask(clarify(loadAndClearQuestion()))
  // console.log(answer(0))
  // await makeFileList(loadAndClearQuestion())
  // await applyChanges(answer(0))
  // overwriteFiles()
  // 1. await deleteCodebase()
  // 2. await uploadCodebase()
  //    New feature in question.txt
  // 3. await ask(getFileList(loadAndClearQuestion()), { action: 'getFileList' }); console.log(answer(0))
  // 4. await applyChanges(answer(0))
  //    asked for clarification
  // 5. await ask('what clarification');console.log(answer(0))
  //     how to restart - find the list on your screen and copy out its tail only and put to questions.txt
  // 6. await applyChanges(loadAndClearQuestion())
  // 7. await ask(loadAndClearQuestion()); console.log(answer(0))
  // 8. console.log(getLastFileList()) - something that can help
  // 9. await applyChanges(getLastFileList())
  // 10. overwriteFiles()

  console.log(getLastFileList())
}

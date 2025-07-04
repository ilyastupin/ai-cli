import fs from 'fs'
import path from 'path'
import { setProjectName, question, answer, getLastUpdatedFileName, getLastFileList } from './src/history/history.js'

import { uploadCodebase } from './src/use-cases/uploadCodebase.js'
import { deleteCodebase } from './src/use-cases/deleteCodebase.js'
import { ask } from './src/use-cases/ask.js'
import { askWithWebSearchVector } from './src/use-cases/askInternet.js'
import { cleanUp } from './src/use-cases/cleanUp.js'
import { applyChanges } from './src/use-cases/applyChanges.js'

import { getFileList, getFullContent } from './src/providers/prompts.js'

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

function replaceFile(fileName, fileContent) {
  fs.writeFileSync(fileName, fileContent)
}

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

await applyChanges(getLastFileList())

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

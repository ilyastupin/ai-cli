import fs from 'fs'
import path from 'path'
import { setProjectName, question, answer, getLastUpdatedFileName } from './src/history/history.js'
import { uploadCodebase } from './src/use-cases/uploadCodebase.js'
import { deleteCodebase } from './src/use-cases/deleteCodebase.js'
import { ask } from './src/use-cases/ask.js'
import { askWithWebSearchVector } from './src/use-cases/askInternet.js'
import { cleanUp } from './src/use-cases/cleanUp.js'
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
//console.log(answer(0))
// const q = loadAndClearQuestion()

// const files = answer(0)
//   .split(/\r?\n/)
//   .filter((e) => !!e)
// for (const f of files) {
//   console.log(f)
//   await ask(getFullContent(f), { action: 'getFullContent', fileName: f })
// }

// setProjectName('ai-cli')
// await uploadCodebase()
// await ask(q)
// await ask(getFileList(q), { action: 'getFileList' })
// console.log(answer(0))
replaceFile(getLastUpdatedFileName(), answer(0))
// await deleteCodebase()
// cleanUp()

import { simpleQuestion } from './src/use-cases/simpleQuestion.js'

const question = 'create a README.md for this project'

console.log(`❓ Asking: "${question}"`)

const answer = await simpleQuestion(question)

console.log('\n📝 Response:\n')
console.log(answer)

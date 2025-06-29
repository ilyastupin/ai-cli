import fs from 'fs/promises'
import { stripAnswer } from './stripper.js'

/**
 * Extracts the next unanswered question and metadata from the chat file content.
 * @param {string} fileContent - Full contents of the chat file.
 * @returns {{ remainder: string, lastThreadId: string|null, lastAnswerIndex: number }}
 */
export function getQuestion(fileContent) {
  const answerBlockRegex = /### answer #(\d+)\n([\s\S]*?)\n\nanswer #\1 end \((thread_[^\)]+)\)\n\n---/g
  let lastMatch
  for (const match of fileContent.matchAll(answerBlockRegex)) lastMatch = match
  const lastAnswerIndex = lastMatch ? Number(lastMatch[1]) : 0
  const lastThreadId = lastMatch ? lastMatch[3] : null
  const lastAnswerEnd = lastMatch ? lastMatch.index + lastMatch[0].length : 0
  const remainder = fileContent.slice(lastAnswerEnd).trim()
  return { remainder, lastThreadId, lastAnswerIndex }
}

/**
 * Appends a formatted answer block to the chat file.
 * @param {string} chatFilePath - Path to the chat file.
 * @param {string} answer - Assistant's response text.
 * @param {string} threadId - OpenAI thread ID.
 * @param {number} lastAnswerIndex - Index of the last answer.
 */
export async function putAnswer(chatFilePath, answer, threadId, lastAnswerIndex) {
  const currentIndex = lastAnswerIndex + 1
  const newBlock = `\n\n### answer #${currentIndex}\n${answer.trim()}\n\nanswer #${currentIndex} end (${threadId})\n\n---\n`
  await fs.appendFile(chatFilePath, newBlock)
  console.log('📁 Answer written to file.')
}

/**
 * Returns the last assistant answer found in the file.
 * Optionally strips markdown formatting using custom logic.
 * @param {string} fileContent
 * @param {boolean} stripMarkdown
 * @returns {string|null}
 */
export function getLastAnswer(fileContent, stripMarkdown = false) {
  const answerBlockRegex = /### answer #(\d+)\n([\s\S]*?)\n\nanswer #\1 end \((thread_[^\)]+)\)\n\n---/g
  let lastMatch
  for (const match of fileContent.matchAll(answerBlockRegex)) lastMatch = match
  if (!lastMatch) return null
  const rawAnswer = lastMatch[2]
  return stripMarkdown ? stripAnswer(rawAnswer) : rawAnswer
}

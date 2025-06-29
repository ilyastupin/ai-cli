/**
 * Removes leading and trailing markdown code block markers
 * like ```json, ```plaintext, or ``` from the first and last lines.
 * Also trims any leading/trailing empty lines.
 *
 * @param {string} raw - Raw assistant answer text
 * @returns {string} - Cleaned answer string
 */
export function stripAnswer(raw) {
  const lines = raw.split(/\r?\n/)

  const startPatterns = ['```json', '```plaintext', '```']
  const endPattern = '```'

  // Remove known start marker
  if (lines.length > 0 && startPatterns.includes(lines[0].trim())) {
    lines.shift()
  }

  // Remove known end marker
  if (lines.length > 0 && lines[lines.length - 1].trim() === endPattern) {
    lines.pop()
  }

  // Remove any blank lines at start or end
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift()
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop()
  }

  return lines.join('\n')
}

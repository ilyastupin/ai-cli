/**
 * Removes leading and trailing markdown code block markers
 * like ```json, ```jsx, or plain ``` from the first and last lines.
 * Also trims any leading/trailing empty lines.
 *
 * @param {string} raw - Raw assistant answer text
 * @returns {string} - Cleaned answer string
 */
export function stripAnswer(raw) {
  const lines = raw.split(/\r?\n/)

  // Remove any ```* starting marker from the first line
  if (lines.length > 0 && lines[0].trim().startsWith('```')) {
    lines.shift()
  }

  // Remove ``` ending marker if it appears alone on the last line
  if (lines.length > 0 && lines[lines.length - 1].trim() === '```') {
    lines.pop()
  }

  // Remove leading/trailing blank lines
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift()
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop()
  }

  return lines.join('\n')
}

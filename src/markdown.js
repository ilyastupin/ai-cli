// src/markdown.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 🔧 Make __dirname work in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function generateMarkdownHtml(chatFile, fileContent, extra = '') {
  // ✅ Resolve relative to the current file (so CLI usage from other dirs works)
  const templatePath = path.resolve(__dirname, '../starter-app/markdown-viewer-template.html')
  const outDir = path.resolve(__dirname, '../out')
  await fs.mkdir(outDir, { recursive: true })

  const htmlFilename = path.basename(chatFile).replace(/\.txt$/, '.html')
  const htmlPath = path.join(outDir, htmlFilename)

  const rawContent = fileContent.trimEnd() + (extra ? '\n\n' + extra : '')
  const escaped = rawContent.replace(/`/g, '\\`')
  const template = await fs.readFile(templatePath, 'utf8')
  const html = template.replace('__MARKDOWN_PLACEHOLDER__', escaped)

  await fs.writeFile(htmlPath, html)
  console.log(`🌐 Markdown HTML view written to ${htmlPath}`)

  const openCmd =
    process.platform === 'darwin'
      ? `open "${htmlPath}"`
      : process.platform === 'win32'
      ? `start "" "${htmlPath}"`
      : `xdg-open "${htmlPath}"`
  await execAsync(openCmd)
}

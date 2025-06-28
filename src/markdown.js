// markdown.js
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function generateMarkdownHtml(chatFile, fileContent, extra = '') {
  const templatePath = path.resolve('markdown-viewer-template.html')
  const outDir = path.resolve('out')
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

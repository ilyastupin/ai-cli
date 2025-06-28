import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

const BRAVE_API_KEY = process.env.BRAVE_API_KEY

export async function braveSearchToFile(query, options = {}) {
  const maxLinks = options.maxLinks || 5
  const tempDir = options.tempDir || './tmp'
  const trace = options.trace || false
  const fileName = `brave-search-${Date.now()}.txt`
  const outPath = path.join(tempDir, fileName)

  await fs.mkdir(tempDir, { recursive: true })

  // Step 1: Search Brave API
  let searchQuery = query
  let links = await runBraveSearch(searchQuery, maxLinks, trace)

  // Step 1.5: Retry with unquoted query if empty
  if (links.length === 0 && query.startsWith('"') && query.endsWith('"')) {
    searchQuery = query.replace(/^"+|"+$/g, '')
    if (trace) console.log(`🔁 No results — retrying with fallback query: ${searchQuery}`)
    links = await runBraveSearch(searchQuery, maxLinks, trace)
  }

  // Return early if still no results
  if (links.length === 0) {
    if (trace) console.log('⚠️ No content to write. Returning null.')
    return null
  }

  // Step 2: Download and extract text
  const pages = await Promise.all(
    links.map(async (url, idx) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        if (trace) console.log(`📥 [${idx + 1}] Fetching ${url}...`)
        const pageRes = await fetch(url, { signal: controller.signal })
        const html = await pageRes.text()
        clearTimeout(timeoutId)

        // Suppress logs during JSDOM parsing
        let dom
        const originalConsole = {
          log: console.log,
          warn: console.warn,
          error: console.error
        }
        try {
          console.log = console.warn = console.error = () => {}
          dom = new JSDOM(html)
        } finally {
          console.log = originalConsole.log
          console.warn = originalConsole.warn
          console.error = originalConsole.error
        }

        const text = dom.window.document.body.textContent || ''
        if (trace) console.log(`📥 [${idx + 1}] Fetched ${url} ✅`)
        return `# ${url}\n\n${text.trim().slice(0, 10000)}\n\n`
      } catch (err) {
        clearTimeout(timeoutId)
        if (trace) console.log(`❌ [${idx + 1}] ${url} — ${err.name}: ${err.message}`)
        return ''
      }
    })
  )

  const mergedText = pages.join('\n')
  await fs.writeFile(outPath, mergedText, 'utf8')

  if (trace) console.log(`📄 Brave content written to: ${outPath}`)

  return outPath
}

// --- Internal helper to call Brave API ---
async function runBraveSearch(query, maxLinks, trace) {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxLinks}`
  const headers = {
    Accept: 'application/json',
    'X-Subscription-Token': BRAVE_API_KEY
  }

  if (trace) {
    console.log('🔎 Brave API Request:')
    console.log('  URL:', url)
    console.log('  Headers:', headers)
  }

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Brave search failed: ${res.status}`)
  const data = await res.json()
  const links = data.web?.results?.map((r) => r.url).slice(0, maxLinks) || []

  if (trace) {
    console.log('🔗 Brave API Links Received:')
    if (links.length === 0) {
      console.log('  ⚠️ No links found.')
    } else {
      links.forEach((link, idx) => {
        console.log(`  [${idx + 1}] ${link}`)
      })
    }
  }

  return links
}

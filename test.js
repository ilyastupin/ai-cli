import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function listVectorStores() {
  const allStores = []
  let page = await openai.vectorStores.list({ limit: 100 })
  allStores.push(...page.data)

  while (page.has_next_page) {
    page = await openai.vectorStores.list({ limit: 100, after: page.last_id })
    allStores.push(...page.data)
  }

  return allStores
}

async function deleteVectorStore(id) {
  try {
    await openai.vectorStores.delete(id)
    console.log(`🗑 Deleted vector store: ${id}`)
  } catch (err) {
    console.error(`❌ Failed to delete ${id}: ${err.message}`)
  }
}

async function main() {
  const stores = await listVectorStores()

  if (stores.length === 0) {
    console.log('✅ No vector stores found.')
    return
  }

  console.log(`📦 Found ${stores.length} vector store(s):`)
  stores.forEach((vs, idx) => {
    console.log(`  ${idx + 1}. ${vs.id} (${vs.name || 'unnamed'})`)
  })

  const confirmed = process.argv.includes('--delete')

  if (confirmed) {
    console.log('\n⚠️ Deleting all vector stores...\n')
    for (const vs of stores) {
      await deleteVectorStore(vs.id)
    }
  } else {
    console.log('\n🔒 To delete them, run with: `node cleanVectorStores.js --delete`')
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
})

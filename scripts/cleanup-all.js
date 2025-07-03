import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function deleteAllAssistants() {
  const assistants = await openai.beta.assistants.list()
  for (const assistant of assistants.data) {
    console.log(`🗑️ Deleting assistant: ${assistant.id} (${assistant.name})`)
    await openai.beta.assistants.delete(assistant.id)
  }
}

async function deleteAllVectorStores() {
  const stores = await openai.vectorStores.list()
  for (const store of stores.data) {
    console.log(`🗑️ Deleting vector store: ${store.id} (${store.name})`)
    await openai.vectorStores.delete(store.id)
  }
}

async function runCleanup() {
  console.log('🧹 Cleaning up all assistants and vector stores...')
  await deleteAllAssistants()
  await deleteAllVectorStores()
  console.log('✅ Cleanup complete.')
}

runCleanup().catch((err) => {
  console.error('❌ Cleanup failed:', err)
  process.exit(1)
})

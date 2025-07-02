import { uploadCodebase } from './src/use-cases/uploadCodebase.js'

async function main() {
  try {
    const count = await uploadCodebase()
    console.log(`✅ Uploaded ${count} file(s) to vector store.`)
  } catch (err) {
    console.error('❌ Failed to upload codebase:', err.message)
  }
}

main()

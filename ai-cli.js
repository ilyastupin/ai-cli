import { setProjectName } from './src/history/history.js'
import { uploadCodebase } from './src/use-cases/uploadCodebase.js'
import { deleteCodebase } from './src/use-cases/deleteCodebase.js'
import { ask } from './src/use-cases/ask.js'
import { askWithWebSearchVector } from './src/use-cases/askInternet.js'
import { cleanUp } from './src/use-cases/cleanUp.js'

// setProjectName('ai-cli')
await uploadCodebase()
// await deleteCodebase()

//console.log(await internetQuestion('tell me briefly about Iran Izrael conflict 2025'))
// console.log(await getVectorStore(getLatestVectorStoreId()))
// console.log(await simpleQuestion('create a README.md for this project'))
// await uploadCodebase()
// console.log(await simpleQuestion('create a README.md for this project'))
// console.log(await listVectorStoreFiles(getLatestVectorStoreId()))
// console.log(await getVectorStore(getLatestVectorStoreId()))
// console.log(await simpleQuestion('tell me briefly about Iran Izrael conflict 2025'))

// cleanUp()

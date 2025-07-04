import fs from 'fs'

/**
 * Template for generating a commit message.
 *
 * @returns {string} A template string suggesting a commit message.
 */
export const getCommitMessage = () => `
make me a good message for this changes to commit them into repository
I want you to show only single line of future commit message
Dont include ANY additional formatting like markdown or bullets.
`

/**
 * Template for generating a file list based on a question.
 *
 * @param {string} question - The question that requires assessing for file updates.
 * @returns {string} A template string requesting a list of files to update based on the question.
 */
export const getFileList = (question) => `
I am asking for a list of specific files that need to be created or updated based 
on some new requirements or changes regarding the following question:
---+++---
${question}
---+++---
first line - good commit message for the proposed changes. It should take ONLY one line.
After that you show me a list of files that I supposed to create or update in my file system manually

Show me text file names only (no images or ico files).

It must be real files that I can find on the disk. Dont include any files with template in names.

Dont include ANY additional formatting in your output like markdown or bullets.
No additional comments from your side.
I need a bare list with commit message and full paths - no other words

But if you think that you need to ask some clarifying question return me this: "clarification needed" -
this is important for me to parse it out properly - 
and from a new line tell me in details which clarification needed
`

/**
 * Template for generating a search query for an internet search engine.
 *
 * @param {string} question - The question for which to generate a search query.
 * @returns {string} A template string indicating the search query for Brave.
 */
export const getSearchQuery = (question) => `
Make a search query text for brave search engine. The query should be short enough
to fit internet search engine. The search engine request is needed because your data is not up to date.
I need only query and no other comments from your side. 
The question is:
---+++---
${question}
---+++---
`

/**
 * Template for clarifying input.
 *
 * @param {string} clarification - The text content to clarify.
 * @returns {string} A template string with the provided clarification content.
 */
export const clarify = (clarification) => `
---+++---
${clarification}
---+++---
Please tell me if it clear but do noting else until I ask you.
`

/**
 * Template for obtaining the full content of a specified file.
 *
 * @param {string} fileName - The name of the file to retrieve content for.
 * @returns {string} A formatted template to fetch the full content of the file.
 */
export const getFullContent = (fileName) => `
Now I tell you file name and you show me its full UPDATED! content.

I expect file content only but with most recent updates that we talked thru.

No comment from your side

No additional formatting needed

But if you think that you need to ask some clarifying question return me this: "clarification needed" -
this is important for me to parse it out properly - 
and from a new line tell me in details which clarification needed

Give me ${fileName}

${fs.existsSync(fileName) ? `For you reference the file before the changes is:\n\n${fs.readFileSync(fileName, 'utf8')}` : ''}
`

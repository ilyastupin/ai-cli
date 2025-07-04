import fs from 'fs'

export const getCommitMessage = () => `
make me a good message for this changes to commit them into repository
I want you to show only single line of future commit message
Dont include ANY additional formatting like markdown or bullets.
`

export const getFileList = (question) => `
I am asking for a list of specific files that need to be created or updated based 
on some new requirements or changes regarding the following question:

${question}

show me a list of files that I supposed to create or update in my file system manually

Show me text file names only (no images or ico files).

It must be real files that I can find on the disk. Dont include any files with template in names.

Dont include ANY additional formatting in your output like markdown or bullets.

I need a bare list with full paths - no other words

But if you think that you need to ask some clarifying question return me this: "clarification needed" -
this is important for me to parse it out properly - 
and from a new line tell me in details which clarification needed
`

export const getSearchQuery = (question) => `
Make a search query text for brave search engine. The query should be short enough
to fit internet search engine. The search engine request is needed because your data is not up to date.
I need only query and no other comments from your side. 
The question is:
${question}
`

export const getFullContent = (fileName) => `
Now I tell you file name and you show me its full content. I will do it several times for different files.

I expect file content only

No comment from your side

No additional formatting needed

Give me ${fileName}

For you reference the current file is:
${(() => {
  try {
    return fs.readFileSync(fileName, 'utf8')
  } catch (err) {
    return `file ${fileName} does not exist so far`
  }
})()}
`

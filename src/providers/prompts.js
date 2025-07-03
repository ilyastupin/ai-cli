export const getCommitMessage = () => `
make me a good message for this changes to commit them into repository
I want you to show only single line of future commit message
Dont include ANY additional formatting like markdown or bullets.
`

export const getFileList = () => `
I want to save this changes locally.

show me a list of files that I supposed to create or update in my file system manually
(that I just asked you about to change). 

Show me text file names only (no images or ico files).

It must be real files that I can find on the disk. Dont include any files with template in names.

Dont include ANY additional formatting like markdown or bullets. I need ONLY file content.

I need a bare list with full paths - no other words
`

export const getSearchQuery = () => `
Make a search query text for brave search engine. The query should be short enough
to fit internet search engine. The search engine request is needed because your data is not up to date.
I need only query and no other comments from your side. 
The question is:
`

export const getFullContent = (fileName, content) => `
Now I tell you file name and you show me its full content.

I expect file content only

Give me ${fileName}

The current file is:
${content}
`

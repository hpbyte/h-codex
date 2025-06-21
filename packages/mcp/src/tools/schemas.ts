import { z } from 'zod'

export const CodeIndexInputSchema = {
  path: z.string().describe('Path to the directory to explore and index'),
}

export const CodeIndexOutputSchema = {
  structuredContent: z
    .object({
      totalFiles: z.number().describe('Total number of files to index'),
      processedFiles: z.number().describe('Number of files processed'),
      failedFiles: z.number().describe('Number of files that failed to index'),
      errors: z
        .array(z.object({ file: z.string(), error: z.string() }))
        .describe('Errors encountered during indexing'),
    })
    .describe('Structured content of the code index'),
}

export const CodeSearchInputSchema = {
  query: z.string().describe('Search query to find similar code chunks'),
}

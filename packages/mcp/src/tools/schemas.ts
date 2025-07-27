import { z } from 'zod'

export const CodeIndexInputSchema = {
  path: z.string().describe('Path to the directory to explore and index'),
  project: z.string().optional().describe('Project name (defaults to directory name)'),
}

export const CodeSearchInputSchema = {
  query: z.string().describe('Search query to find similar code chunks'),
  projects: z.array(z.string()).optional().describe('List of project names to search within'),
}

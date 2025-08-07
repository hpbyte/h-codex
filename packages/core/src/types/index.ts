import { codeChunks, embeddings, projects } from '../storage/schemas'

export type CodeChunk = typeof codeChunks.$inferSelect
export type CodeChunkInsert = typeof codeChunks.$inferInsert

export type Embedding = typeof embeddings.$inferSelect

export type Project = typeof projects.$inferSelect
export type ProjectInsert = typeof projects.$inferInsert

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'typescript-react'
  | 'javascript-react'
  | 'python'

export interface SearchOptions {
  limit?: number
  threshold?: number
  filePaths?: string[]
  languages?: SupportedLanguage[]
  nodeTypes?: string[]
  excludeFilePaths?: string[]
  minSimilarity?: number
  diversityFactor?: number
  contextLines?: number
  projects?: string[]
}

export interface SearchResult {
  chunk: CodeChunk
  similarity: number
  context?: CodeChunk[]
  relevanceScore?: number
  rank: number
}

export interface FileExplorerConfig {
  supportedExtensions: string[]
  ignoreFiles: string[]
  defaultIgnorePatterns: string[]
}

export type ChunkParams = {
  filePath: string;
  projectId: string;
  language: SupportedLanguage
}


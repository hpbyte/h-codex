import { codeChunks, embeddings } from '../database/schemas'

export type CodeChunk = typeof codeChunks.$inferSelect
export type CodeChunkInsert = typeof codeChunks.$inferInsert

export type Embedding = typeof embeddings.$inferSelect

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'go'
  | 'rust'

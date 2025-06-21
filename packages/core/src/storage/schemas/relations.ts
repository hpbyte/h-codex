import { relations } from 'drizzle-orm'

import { codeChunks } from './code_chunks.schema'
import { embeddings } from './embeddings.schema'

export const codeChunksRelations = relations(codeChunks, ({ one }) => ({
  embedding: one(embeddings, {
    fields: [codeChunks.id],
    references: [embeddings.chunkId],
  }),
}))

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  codeChunk: one(codeChunks, {
    fields: [embeddings.chunkId],
    references: [codeChunks.id],
  }),
}))

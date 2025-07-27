import { relations } from 'drizzle-orm'

import { codeChunks } from './code_chunks.schema'
import { embeddings } from './embeddings.schema'
import { projects } from './projects.schema'

export const projectsRelations = relations(projects, ({ many }) => ({
  codeChunks: many(codeChunks),
}))

export const codeChunksRelations = relations(codeChunks, ({ one }) => ({
  project: one(projects, {
    fields: [codeChunks.projectId],
    references: [projects.id],
  }),
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

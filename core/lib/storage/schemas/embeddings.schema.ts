import { pgTable, uuid, vector, timestamp, unique } from 'drizzle-orm/pg-core'
import { codeChunks } from './code_chunks.schema'

export const embeddings = pgTable(
  'embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    chunkId: uuid('chunk_id')
      .notNull()
      .references(() => codeChunks.id, { onDelete: 'cascade' }),
    embedding: vector('embedding', { dimensions: 1536 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    uniqueChunkId: unique().on(table.chunkId),
  })
)

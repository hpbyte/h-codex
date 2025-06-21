import { integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const codeChunks = pgTable('code_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  filePath: varchar('file_path', { length: 512 }).notNull(),
  startLine: integer('start_line').notNull(),
  endLine: integer('end_line').notNull(),
  nodeType: varchar('node_type', { length: 100 }).notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  hash: varchar('hash', { length: 64 }).notNull().unique(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

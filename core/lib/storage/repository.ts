import { eq, sql, cosineDistance } from 'drizzle-orm'

import type { CodeChunkInsert } from '../types'
import { embeddingsConfig } from '../../config/database'
import { codeChunks as codeChunksTable, embeddings as embeddingsTable } from './schemas'
import { db } from './connection'

export class Repository {
  async insertCodeChunksWithEmbeddings(chunks: CodeChunkInsert[], embeddings: number[][]) {
    return await db.transaction(async tx => {
      const insertedChunks = await tx
        .insert(codeChunksTable)
        .values(chunks)
        .onConflictDoNothing()
        .returning()

      const chunkEmbeddings = insertedChunks.map((chunk, index) => ({
        chunkId: chunk.id,
        embedding: embeddings[index],
      }))

      const insertedEmbeddings = await tx
        .insert(embeddingsTable)
        .values(chunkEmbeddings)
        .onConflictDoNothing()
        .returning()

      return { insertedChunks, insertedEmbeddings }
    })
  }

  async findSimilarChunks(
    queryEmbedding: number[],
    limit = embeddingsConfig.searchResultsLimit,
    threshold = embeddingsConfig.similarityThreshold
  ) {
    const similarChunks = await db
      .select({
        chunk: codeChunksTable,
        similarity: sql<number>`1 - (${cosineDistance(embeddingsTable.embedding, queryEmbedding)})`,
      })
      .from(embeddingsTable)
      .innerJoin(codeChunksTable, eq(embeddingsTable.chunkId, codeChunksTable.id))
      .where(sql`1 - (${cosineDistance(embeddingsTable.embedding, queryEmbedding)}) > ${threshold}`)
      .orderBy(sql`${cosineDistance(embeddingsTable.embedding, queryEmbedding)}`)
      .limit(limit)

    return similarChunks.map(row => ({
      chunk: row.chunk,
      similarity: row.similarity,
    }))
  }
}

export const repository = new Repository()

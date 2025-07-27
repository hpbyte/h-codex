import { eq, sql, cosineDistance, and, inArray } from 'drizzle-orm'

import { embeddingsConfig } from '../config/embedding'
import { projectsRepository } from './projects.repository'
import { codeChunks as codeChunksTable, embeddings as embeddingsTable } from './schemas'
import { db } from './connection'

import type { CodeChunk, CodeChunkInsert, SearchOptions } from '../types'

export class ChunkEmbeddingsRepository {
  async insertCodeChunks(chunks: CodeChunkInsert[]) {
    return db.insert(codeChunksTable).values(chunks).onConflictDoNothing().returning()
  }

  async insertEmbeddings(codeChunks: CodeChunk[], embeddings: number[][]) {
    if (codeChunks.length === 0 || embeddings.length === 0) {
      return []
    }

    if (codeChunks.length !== embeddings.length) {
      throw new Error('Code chunks and embeddings must have the same length')
    }

    const chunkEmbeddings = codeChunks.map((chunk, index) => ({
      chunkId: chunk.id,
      embedding: embeddings[index],
    }))

    return db.insert(embeddingsTable).values(chunkEmbeddings).onConflictDoNothing().returning()
  }

  async findSimilarChunks(queryEmbedding: number[], options: SearchOptions = {}) {
    const {
      limit = embeddingsConfig.searchResultsLimit,
      threshold = embeddingsConfig.similarityThreshold,
      filePaths,
      languages,
      nodeTypes,
      excludeFilePaths,
      minSimilarity = 0.2,
      diversityFactor = 0.8,
      projects,
    } = options

    const conditions = [
      sql`1 - (${cosineDistance(embeddingsTable.embedding, queryEmbedding)}) > ${Math.max(threshold, minSimilarity)}`,
    ]

    if (projects && projects.length > 0) {
      const projectRecords = await Promise.all(projects.map(name => projectsRepository.get(name)))
      const projectIds = projectRecords.filter(p => p !== null).map(p => p!.id)

      if (projectIds.length > 0) {
        conditions.push(inArray(codeChunksTable.projectId, projectIds))
      }
    }

    if (filePaths && filePaths.length > 0) {
      conditions.push(inArray(codeChunksTable.filePath, filePaths))
    }

    if (excludeFilePaths && excludeFilePaths.length > 0) {
      conditions.push(sql`${codeChunksTable.filePath} NOT IN ${excludeFilePaths}`)
    }

    if (languages && languages.length > 0) {
      conditions.push(inArray(codeChunksTable.language, languages))
    }

    if (nodeTypes && nodeTypes.length > 0) {
      conditions.push(inArray(codeChunksTable.nodeType, nodeTypes))
    }

    const retrievalLimit = Math.min(limit * 3, 100)

    const similarChunks = await db
      .select({
        chunk: codeChunksTable,
        similarity: sql<number>`1 - (${cosineDistance(embeddingsTable.embedding, queryEmbedding)})`,
        distance: cosineDistance(embeddingsTable.embedding, queryEmbedding),
      })
      .from(embeddingsTable)
      .innerJoin(codeChunksTable, eq(embeddingsTable.chunkId, codeChunksTable.id))
      .where(and(...conditions))
      .orderBy(sql`${cosineDistance(embeddingsTable.embedding, queryEmbedding)}`)
      .limit(retrievalLimit)

    const diversifiedResults = this.diversifyResults(
      similarChunks.map(row => ({
        chunk: row.chunk,
        similarity: row.similarity,
      })),
      diversityFactor
    )

    return diversifiedResults.slice(0, limit)
  }

  async findSimilarChunksWithContext(queryEmbedding: number[], options: SearchOptions = {}) {
    const { contextLines = 3, ...searchOptions } = options
    const results = await this.findSimilarChunks(queryEmbedding, searchOptions)

    const contextualResults = await Promise.all(
      results.map(async ({ chunk, similarity }) => {
        const contextChunks = await db
          .select()
          .from(codeChunksTable)
          .where(
            and(
              eq(codeChunksTable.filePath, chunk.filePath),
              eq(codeChunksTable.projectId, chunk.projectId),
              sql`${codeChunksTable.startLine} BETWEEN ${chunk.startLine - contextLines * 10} AND ${chunk.endLine + contextLines * 10}`
            )
          )
          .orderBy(codeChunksTable.startLine)

        return {
          chunk,
          similarity,
          context: contextChunks.filter(c => c.id !== chunk.id),
        }
      })
    )

    return contextualResults
  }

  async clearChunkEmbeddings(projectId: string) {
    return db.delete(codeChunksTable).where(eq(codeChunksTable.projectId, projectId))
  }

  private diversifyResults<T extends { chunk: CodeChunk; similarity: number }>(
    results: T[],
    diversityFactor: number
  ): T[] {
    if (diversityFactor >= 1.0) return results

    const diversified: T[] = []
    const filePathCounts: Record<string, number> = {}

    for (const result of results) {
      const filePath = result.chunk.filePath
      const currentCount = filePathCounts[filePath] || 0

      const diversityPenalty = currentCount * (1 - diversityFactor)
      const adjustedScore = result.similarity * (1 - diversityPenalty)

      if (adjustedScore > 0.1) {
        diversified.push(result)
        filePathCounts[filePath] = currentCount + 1
      }
    }

    return diversified.sort((a, b) => b.similarity - a.similarity)
  }
}

export const chunkEmbeddingsRepository = new ChunkEmbeddingsRepository()

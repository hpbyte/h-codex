import { embedder } from '../ingestion/embedder'
import { chunkEmbeddingsRepository } from '../storage/chunk-embeddings.repository'
import type { SearchOptions, SearchResult } from '../types'

export class SemanticSearch {
  async search(query: string, options: SearchOptions = {}) {
    const queryEmbeddings = await this.getQueryEmbeddings(query)

    const contextResults = await chunkEmbeddingsRepository.findSimilarChunksWithContext(
      queryEmbeddings,
      options
    )

    const results = contextResults.map((result, index) => ({
      chunk: result.chunk,
      similarity: result.similarity,
      context: result.context,
      rank: index + 1,
    }))

    const processedResults = this.calculateRelevanceScores(results, query)

    return processedResults
  }

  private async getQueryEmbeddings(query: string) {
    const preprocessed = this.sanitizeQuery(query)

    try {
      const embedding = await embedder.generateEmbeddings([preprocessed])

      if (!embedding || embedding.length === 0 || !embedding[0]) {
        throw new Error('Failed to generate embedding for query')
      }

      return embedding[0]
    } catch (error) {
      throw new Error(
        `Failed to prepare search query: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private sanitizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private calculateRelevanceScores(results: SearchResult[], query: string): SearchResult[] {
    return results.map(result => {
      const semanticScore = result.similarity
      const textScore = this.calculateTextMatchScore(result.chunk.content, query)

      const relevanceScore = semanticScore * 0.6 + textScore * 0.3

      return {
        ...result,
        relevanceScore,
      }
    })
  }

  private calculateTextMatchScore(content: string, query: string): number {
    if (!content || !query) return 0

    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 0)

    if (queryTerms.length === 0) return 0

    const contentLower = content.toLowerCase()

    let score = 0
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        score += 1 / queryTerms.length
      }
    }

    return Math.min(score, 1.0)
  }
}

export const semanticSearch = new SemanticSearch()

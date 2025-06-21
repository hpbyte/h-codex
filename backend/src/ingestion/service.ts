import { embeddingsService } from '../embeddings/service'
import { repository } from '../database/repository'
import type { CodeChunkInsert } from '../types'

export class IngestionService {
  async ingest(chunks: CodeChunkInsert[]) {
    try {
      const embeddings = await embeddingsService.generate(chunks)

      return await repository.insertCodeChunksWithEmbeddings(chunks, embeddings)
    } catch (error) {
      console.error('Error ingesting chunks:', error)
      throw new Error(`Failed to ingest chunks: ${error}`)
    }
  }
}

export const ingestionService = new IngestionService()

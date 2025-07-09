import { embedder } from '@/lib/ingestion/embedder'
import { repository } from '@/lib/storage/repository'
import type { CodeChunkInsert } from '@/types'

export class Ingester {
  async ingest(chunks: CodeChunkInsert[]) {
    try {
      const embeddings = await embedder.generate(chunks)

      return await repository.insertCodeChunksWithEmbeddings(chunks, embeddings)
    } catch (error) {
      console.error('Error ingesting chunks:', error)
      throw new Error(`Failed to ingest chunks: ${error}`)
    }
  }
}

export const ingester = new Ingester()

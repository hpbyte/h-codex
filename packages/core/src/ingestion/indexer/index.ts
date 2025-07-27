import { chunker } from '../chunker'
import { embedder } from '../embedder'
import { fileExplorer } from '../explorer'
import { chunkEmbeddingsRepository } from '../../storage/chunk-embeddings.repository'
import { projectsRepository } from '../../storage/projects.repository'

export class Indexer {
  async index(path: string) {
    try {
      const files = await fileExplorer.discover(path)
      const project = await projectsRepository.create(path)

      if (files.length === 0) {
        return {
          totalFiles: 0,
          processedFiles: 0,
          failedFiles: 0,
          errors: [],
        }
      }

      const { results, errors } = await fileExplorer.processInBatches(files, (filePath: string) =>
        this.indexFile(filePath, project.id)
      )

      const processedFiles = results.filter(result => result !== null).length
      const failedFiles = errors.length

      return {
        totalFiles: files.length,
        processedFiles,
        failedFiles,
        errors: errors.map(error => ({
          file: error.item,
          error: error.error.message,
        })),
      }
    } catch (error) {
      throw new Error(`Failed to index folder ${path}: ${error}`)
    }
  }

  async indexFile(filePath: string, projectId: string) {
    try {
      const chunks = await chunker.processFile(filePath, projectId)
      const newCodeChunks = await chunkEmbeddingsRepository.insertCodeChunks(chunks)

      const embeddings = await embedder.generate(newCodeChunks)
      const newEmbeddings = await chunkEmbeddingsRepository.insertEmbeddings(
        newCodeChunks,
        embeddings
      )

      return { newCodeChunks, newEmbeddings }
    } catch (error) {
      throw new Error(`Failed to index file ${filePath}: ${error}`)
    }
  }
}

export const indexer = new Indexer()

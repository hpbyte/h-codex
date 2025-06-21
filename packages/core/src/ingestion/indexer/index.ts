import { chunker } from '../chunker'
import { embedder } from '../embedder'
import { fileExplorer } from '../explorer'
import { repository } from '../../storage/repository'

export class Indexer {
  async index(path: string): Promise<{
    totalFiles: number
    processedFiles: number
    failedFiles: number
    errors: Array<{ file: string; error: string }>
  }> {
    console.log(`Starting indexing of folder: ${path}`)

    try {
      const files = await fileExplorer.discover(path)
      console.log(`Found ${files.length} files to process`)

      if (files.length === 0) {
        return {
          totalFiles: 0,
          processedFiles: 0,
          failedFiles: 0,
          errors: [],
        }
      }

      const { results, errors } = await fileExplorer.processInBatches(files, (filePath: string) =>
        this.indexFile(filePath)
      )

      const processedFiles = results.filter(result => result !== null).length
      const failedFiles = errors.length

      console.log(
        `Indexing completed: ${processedFiles} files processed, ${failedFiles} files failed`
      )

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
      console.error('Error during folder indexing:', error)
      throw new Error(`Failed to index folder ${path}: ${error}`)
    }
  }

  async indexFile(filePath: string) {
    try {
      const chunks = await chunker.processFile(filePath)
      const newCodeChunks = await repository.insertCodeChunks(chunks)

      const embeddings = await embedder.generate(newCodeChunks)
      const newEmbeddings = await repository.insertEmbeddings(newCodeChunks, embeddings)

      return { newCodeChunks, newEmbeddings }
    } catch (error) {
      console.error('Error indexing file:', error)
      throw new Error(`Failed to index file ${filePath}: ${error}`)
    }
  }
}

export const indexer = new Indexer()

import * as path from 'path'

import { cstChunker } from './cst-chunker'
import { recursiveChunker } from './recursive-chunker'

import type { CodeChunkInsert, SupportedLanguage } from '../../types'

export class Chunker {
  async processFile(filePath: string, projectId: string): Promise<CodeChunkInsert[]> {
    try {
      const language = this.detectLanguage(filePath)

      return await cstChunker.chunk({ filePath, projectId, language })
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unsupported language')) {
        return await recursiveChunker.chunk({ filePath, projectId })
      }

      console.error(`Error processing file ${filePath}:`, error)
      return []
    }
  }

  private detectLanguage(filePath: string): SupportedLanguage {
    const extension = path.extname(filePath).toLowerCase()

    switch (extension) {
      case '.ts':
        return 'typescript'
      case '.tsx':
        return 'typescript-react'
      case '.js':
      case '.mjs':
      case '.cjs':
        return 'javascript'
      case '.jsx':
        return 'javascript-react'
      case '.py':
        return 'python'
      default:
        throw new Error(`Unsupported language for filepath ${filePath}`)
    }
  }
}

export const chunker = new Chunker()


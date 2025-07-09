import * as fs from 'fs'
import * as path from 'path'

import type { CodeChunkInsert, SupportedLanguage } from '@/types'
import { treeSitterParser } from './tree-sitter-parser'

export class ASTChunker {
  async processFile(filePath: string): Promise<CodeChunkInsert[]> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8')
      const language = this.detectLanguage(filePath)

      if (!this.isSupported(language)) {
        console.warn(`Unsupported language for file: ${filePath}`)
        return []
      }

      return await treeSitterParser.parseFile(filePath, content)
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
      return []
    }
  }

  private detectLanguage(filePath: string): SupportedLanguage {
    const extension = path.extname(filePath).toLowerCase()

    switch (extension) {
      case '.ts':
      case '.tsx':
        return 'typescript'
      case '.js':
      case '.jsx':
        return 'javascript'
      default:
        return 'javascript'
    }
  }

  private isSupported(language: SupportedLanguage): boolean {
    return ['typescript', 'javascript'].includes(language)
  }
}

export const astChunker = new ASTChunker()

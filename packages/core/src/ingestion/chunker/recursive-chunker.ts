import * as fs from 'node:fs/promises'
import * as path from 'path'
import crypto from 'crypto'

import type { ChunkParams, CodeChunkInsert } from '../../types'
import { maxChunkSize, coalesce, countLengthWithoutWhitespace } from '../../utils'

export class RecursiveChunker {
  async chunk({ filePath, projectId }: Omit<ChunkParams, 'language'>) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const chunks = this.splitRecursive(content)

      return this.processChunks(chunks, filePath, projectId)
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
      return []
    }
  }

  private splitRecursive(content: string, separators = ['\n\n', '\n', ' ']): string[] {
    if (content.length <= maxChunkSize) {
      return [content]
    }

    for (const separator of separators) {
      const splits = content.split(separator)

      if (splits.length > 1) {
        const result: string[] = []

        for (const split of splits) {
          if (split.length > maxChunkSize) {
            result.push(...this.splitRecursive(split, separators.slice(1)))
          } else {
            result.push(split)
          }
        }

        return result
      }
    }

    const chunks: string[] = []
    for (let i = 0; i < content.length; i += maxChunkSize) {
      chunks.push(content.slice(i, i + maxChunkSize))
    }

    return chunks
  }

  private processChunks(chunks: string[], filePath: string, projectId: string): CodeChunkInsert[] {
    if (chunks.length === 0) return []

    const processedChunks: CodeChunkInsert[] = []
    let currentLineNumber = 1

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i]!

      while (countLengthWithoutWhitespace(chunk) < coalesce && i < chunks.length - 1) {
        const nextChunk = chunks[i + 1]!
        const combinedChunk = chunk + '\n' + nextChunk

        if (combinedChunk.length <= maxChunkSize) {
          chunk = combinedChunk
          i++
        } else {
          break
        }
      }

      const lineCount = (chunk.match(/\n/g) || []).length + 1
      const endLine = currentLineNumber + lineCount - 1

      processedChunks.push({
        content: chunk.trim(),
        filePath,
        projectId,
        startLine: currentLineNumber,
        endLine,
        nodeType: 'text',
        language: this.getLanguage(filePath),
        hash: crypto.createHash('sha256').update(chunk).digest('hex'),
        size: chunk.length,
      })

      currentLineNumber = endLine + 1
    }

    return processedChunks
  }

  private getLanguage(filePath: string) {
    return path.extname(filePath).toLowerCase().replace('.', '')
  }
}

export const recursiveChunker = new RecursiveChunker()

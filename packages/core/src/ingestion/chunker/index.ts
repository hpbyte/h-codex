import * as path from 'path'
import type { SyntaxNode } from 'tree-sitter'
import crypto from 'crypto'

import type { CodeChunkInsert, SupportedLanguage } from '../../types'
import { treeSitterParser } from './tree-sitter-parser'
import { ChunkRange } from './chunk-range'

export class CSTChunker {
  private maxChunkSize = 512 * 3
  private coalesce = 50
  private filePath = ''
  private fileContent = ''
  private language: SupportedLanguage | null = null

  async processFile(filePath: string): Promise<CodeChunkInsert[]> {
    try {
      const language = this.detectLanguage(filePath)
      const cstRootNode = await treeSitterParser.parseFile(filePath, language)

      this.filePath = filePath
      this.language = language
      this.fileContent = cstRootNode.text

      const chunks = this.chunkNode(cstRootNode)
      const processedChunks = this.processChunks(chunks)

      return processedChunks
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
      return []
    }
  }

  /**
   * AST-based chunking
   * - each nodes are traversed and greedily bundled together
   * - if a node is too large, recursively chunk its children
   * - else, concatenate the current chunk to the node
   */
  private chunkNode(node: SyntaxNode): ChunkRange[] {
    const chunks: ChunkRange[] = []
    let currentChunk: ChunkRange | null = null

    const addCurrentChunk = () => {
      if (currentChunk && !currentChunk.isEmpty) {
        chunks.push(currentChunk)
        currentChunk = null
      }
    }

    for (const child of node.children) {
      const childChunkRange = new ChunkRange(
        child.startPosition.row,
        child.endPosition.row,
        child.type
      )
      const childText = child.text

      if (childText.length > this.maxChunkSize) {
        addCurrentChunk()
        chunks.push(...this.chunkNode(child))
        continue
      }

      const currentChunkText = currentChunk?.extract(this.fileContent) ?? ''
      const wouldExceedSize = currentChunkText.length + childText.length > this.maxChunkSize

      if (wouldExceedSize) {
        addCurrentChunk()
        currentChunk = childChunkRange
      } else {
        currentChunk = currentChunk ? currentChunk.add(childChunkRange) : childChunkRange
      }
    }

    addCurrentChunk()

    return chunks
  }

  /**
   * try to combine very small chunks (under the coalesce threshold) with adjacent chunks
   * but if combing will exceed the max chunk size, keep as is
   */
  private processChunks(chunks: ChunkRange[]): CodeChunkInsert[] {
    if (chunks.length === 0) return []

    const processedChunks: CodeChunkInsert[] = []

    const countLengthWithoutWhitespace = (s: string) => s.replace(/\s/g, '').length

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!
      const chunkText = chunk.extract(this.fileContent)

      if (countLengthWithoutWhitespace(chunkText) >= this.coalesce) {
        processedChunks.push(this.formatAsCodeChunk(chunk, chunkText))
        continue
      }

      if (i < chunks.length - 1) {
        const nextChunk = chunks[i + 1]!
        const combinedChunk = chunk.add(nextChunk)
        const combinedText = combinedChunk.extract(this.fileContent)

        if (combinedText.length <= this.maxChunkSize) {
          processedChunks.push(this.formatAsCodeChunk(combinedChunk, combinedText))
          // skip the next chunk as it's combined with the current one
          i++
          continue
        }
      }

      // can't coalesce, keep as is
      processedChunks.push(this.formatAsCodeChunk(chunk, chunkText))
    }

    return processedChunks
  }

  private formatAsCodeChunk(chunk: ChunkRange, content: string): CodeChunkInsert {
    return {
      content,
      filePath: this.filePath,
      startLine: chunk.start + 1, // tree-sitter index starts from 0, make it human-readable
      endLine: chunk.end + 1,
      nodeType: chunk.nodeType,
      language: this.language!,
      hash: crypto.createHash('sha256').update(content).digest('hex'),
      size: content.length,
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
        return 'javascript'
      case '.jsx':
        return 'javascript-react'
      default:
        throw new Error(`Unsupported language for file: ${filePath}`)
    }
  }
}

export const chunker = new CSTChunker()

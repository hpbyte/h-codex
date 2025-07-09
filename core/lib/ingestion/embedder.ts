import OpenAI from 'openai'

import { embeddingsConfig } from '@/config/database'
import type { CodeChunkInsert } from '@/types'

export class Embedder {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: embeddingsConfig.apiKey,
    })
  }

  async generateEmbeddings(texts: string[]) {
    try {
      const response = await this.openai.embeddings.create({
        model: embeddingsConfig.model,
        input: texts,
        encoding_format: 'float',
      })

      return response.data.map(item => item.embedding)
    } catch (error) {
      console.error('Error generating embeddings batch:', error)
      throw new Error(`Failed to generate embeddings batch: ${error}`)
    }
  }

  async generate(codeChunks: CodeChunkInsert[]) {
    const textsToEmbed = this.getTextsToEmbed(codeChunks)
    const batchEmbeddings = await Promise.all(
      textsToEmbed.map(texts => this.generateEmbeddings(texts))
    )

    const embeddings = batchEmbeddings.flat()

    if (embeddings.length !== codeChunks.length) {
      throw new Error('Failed to generate embeddings for all chunks')
    }

    return embeddings
  }

  private getTextsToEmbed(codeChunks: CodeChunkInsert[], chunkSize = 10) {
    const result: string[][] = []
    const texts = codeChunks.map(chunk => this.prepareTextForEmbedding(chunk))

    for (let i = 0; i < texts.length; i += chunkSize) {
      result.push(texts.slice(i, i + chunkSize))
    }

    return result
  }

  private prepareTextForEmbedding(chunk: CodeChunkInsert) {
    let context = ''

    context += `File: ${chunk.filePath}\n`

    if (chunk.className) {
      context += `Class: ${chunk.className}\n`
    }

    if (chunk.functionName) {
      context += `Function: ${chunk.functionName}\n`
    }

    context += `Node Type: ${chunk.nodeType}\n`
    context += `Code:\n${chunk.content}`

    return context
  }
}

export const embedder = new Embedder()

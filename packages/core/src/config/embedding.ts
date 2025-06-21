import { getEnvVar, getEnvNumber } from './helper'

interface EmbeddingsConfig {
  apiKey: string
  model: string
  chunkSize: number
  searchResultsLimit: number
  similarityThreshold: number
}

export const embeddingsConfig: EmbeddingsConfig = {
  apiKey: getEnvVar('OPENAI_API_KEY'),
  model: getEnvVar('EMBEDDING_MODEL', 'text-embedding-3-small'),
  chunkSize: getEnvNumber('CHUNK_SIZE', 1000),
  searchResultsLimit: getEnvNumber('SEARCH_RESULTS_LIMIT', 10),
  similarityThreshold: parseFloat(getEnvVar('SIMILARITY_THRESHOLD', '0.5')),
}

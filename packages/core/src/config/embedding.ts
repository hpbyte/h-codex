import { getEnvVar, getEnvNumber } from '../utils'

interface EmbeddingsConfig {
  apiKey: string
  baseURL: string
  model: string
  chunkSize: number
  searchResultsLimit: number
  similarityThreshold: number
}

export const embeddingsConfig: EmbeddingsConfig = {
  apiKey: getEnvVar('LLM_API_KEY'),
  baseURL: getEnvVar('LLM_BASE_URL', 'https://api.openai.com/v1'),
  model: getEnvVar('EMBEDDING_MODEL', 'text-embedding-3-small'),
  chunkSize: getEnvNumber('CHUNK_SIZE', 1000),
  searchResultsLimit: getEnvNumber('SEARCH_RESULTS_LIMIT', 10),
  similarityThreshold: parseFloat(getEnvVar('SIMILARITY_THRESHOLD', '0.5')),
}

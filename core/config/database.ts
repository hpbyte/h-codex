interface DatabaseConfig {
  host: string
  port: number
  name: string
  user: string
  password: string
}

interface EmbeddingsConfig {
  apiKey: string
  model: string
  chunkSize: number
  chunkOverlap: number
  searchResultsLimit: number
  similarityThreshold: number
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value || defaultValue!
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`)
  }
  return parsed
}

export const dbConfig: DatabaseConfig = {
  host: getEnvVar('DB_HOST', 'localhost'),
  port: getEnvNumber('DB_PORT', 5432),
  name: getEnvVar('DB_NAME', 'h-codex'),
  user: getEnvVar('DB_USER', 'postgres'),
  password: getEnvVar('DB_PASSWORD', 'password'),
}

export const dbConnectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`

export const embeddingsConfig: EmbeddingsConfig = {
  apiKey: getEnvVar('OPENAI_API_KEY'),
  model: getEnvVar('EMBEDDING_MODEL', 'text-embedding-3-small'),
  chunkSize: getEnvNumber('CHUNK_SIZE', 1000),
  chunkOverlap: getEnvNumber('CHUNK_OVERLAP', 200),
  searchResultsLimit: getEnvNumber('SEARCH_RESULTS_LIMIT', 10),
  similarityThreshold: parseFloat(getEnvVar('SIMILARITY_THRESHOLD', '0.7')),
}

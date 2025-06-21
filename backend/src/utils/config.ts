import { z } from 'zod'

const dbConfigSchema = z.object({
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_NAME: z.string().default('h-codex'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
})

const appConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  OPENAI_API_KEY: z.string().nonempty(),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  CHUNK_SIZE: z.coerce.number().default(1000),
  CHUNK_OVERLAP: z.coerce.number().default(200),
  SEARCH_RESULTS_LIMIT: z.coerce.number().default(10),
  SIMILARITY_THRESHOLD: z.coerce.number().default(0.7),
})

export const dbConfig = dbConfigSchema.parse(process.env)
export const dbConnectionString = `postgresql://${dbConfig.DB_USER}:${dbConfig.DB_PASSWORD}@${dbConfig.DB_HOST}:${dbConfig.DB_PORT}/${dbConfig.DB_NAME}`

export const appConfig = appConfigSchema.parse(process.env)

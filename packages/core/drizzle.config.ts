import type { Config } from 'drizzle-kit'

const config: Config = {
  schema: './src/storage/schemas',
  out: './src/storage/migrations/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DB_CONNECTION_STRING || 'postgresql://postgres:password@localhost:5432/h-codex',
  },
}

export default config

import { getEnvVar } from './helper'

export const dbConnectionString = getEnvVar(
  'DB_CONNECTION_STRING',
  'postgresql://postgres:password@localhost:5432/h-codex'
)

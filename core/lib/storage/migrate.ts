import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { dbConnectionString } from '@/config/database'
import * as schema from './schemas'

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...')

    const client = postgres(dbConnectionString, {
      max: 20,
      idle_timeout: 30,
      connect_timeout: 2,
    })

    const db = drizzle(client, { schema })

    await client`CREATE EXTENSION IF NOT EXISTS vector`
    console.log('✅ Vector extension enabled')

    await migrate(db, { migrationsFolder: './core/migrations/drizzle' })
    console.log('✅ Migrations completed successfully')

    await client.end()
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

if (import.meta.main) {
  runMigrations()
    .then(() => {
      console.log('✅ Database migration completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Database migration failed:', error)
      process.exit(1)
    })
}

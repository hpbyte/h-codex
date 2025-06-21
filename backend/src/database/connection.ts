import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { dbConnectionString } from '../utils/config'
import * as schema from './schemas'

class DatabaseConnection {
  private client: postgres.Sql
  public db: ReturnType<typeof drizzle>

  constructor(connectionString: string) {
    this.client = postgres(connectionString, {
      max: 20,
      idle_timeout: 30,
      connect_timeout: 2,
    })

    this.db = drizzle(this.client, { schema })
  }

  async close() {
    await this.client.end()
  }

  async testConnection() {
    try {
      await this.client`SELECT NOW()`
      console.log('Database connection successful')
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  async enableExtensions() {
    await this.client`CREATE EXTENSION IF NOT EXISTS vector`
  }
}

export const dbConnection = new DatabaseConnection(dbConnectionString)
export const db = dbConnection.db

export default dbConnection

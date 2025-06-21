import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { dbConnectionString } from '../config/database'
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
}

export const dbConnection = new DatabaseConnection(dbConnectionString)
export const db = dbConnection.db

export default dbConnection

import { dbConnection } from './connection'

export async function setupDatabase() {
  try {
    console.log('Setting up database...')

    await dbConnection.enableExtensions()
    console.log('✓ Vector extension enabled')

    console.log('✓ Database setup completed successfully')
  } catch (error) {
    console.error('Error setting up database:', error)
    throw error
  }
}

if (import.meta.main) {
  setupDatabase()
    .then(() => {
      console.log('Database setup completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('Database setup failed:', error)
      process.exit(1)
    })
}

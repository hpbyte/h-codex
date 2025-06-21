-- Initialize database with pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for better performance
-- These will be created after migrations run, but we ensure the extension is available
SELECT 'Database initialized with pgvector extension' as status; 
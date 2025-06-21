# @h-codex/core

Core package for h-codex semantic code indexing and search.

## ✨ Features

- **AST-Based Chunking**: Parse code using tree-sitter for intelligent chunk boundaries
- **Semantic Embeddings**: Generate embeddings using OpenAI text-embedding models
- **File Discovery**: Explore codebases with configurable ignore patterns
- **Vector Search**: Store and search embeddings in PostgreSQL with pgvector

## 🚀 Quick Start

### Installation

```bash
pnpm add @h-codex/core
```

### Environment Setup

Create a `.env` file with:

```
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-small
DB_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/h-codex
```

### Usage Example

```typescript
import { indexer, semanticSearch } from '@h-codex/core'

// Index a codebase
const indexResult = await indexer.index('./path/to/codebase')
console.log(`Indexed ${indexResult.indexedFiles} files and ${indexResult.totalChunks} code chunks`)

// Search for code
const searchResults = await semanticSearch.search('database connection implementation')
console.log(searchResults)
```

## 🛠️ API Reference

### Indexer

Indexes code repositories by exploring files, chunking code, and generating embeddings.

```typescript
const stats = await indexer.index(
  path: string,               // Path to the codebase
  options?: {
    ignorePatterns?: string[], // Additional glob patterns to ignore
    maxChunkSize?: number      // Override default chunk size
  }
): Promise<{
  indexedFiles: number,       // Number of indexed files
  totalChunks: number         // Total code chunks created
}>
```

### Semantic Search

Search indexed code using natural language queries.

```typescript
const results = await semanticSearch.search(
  query: string,                // Natural language search query
  options?: {
    limit?: number,             // Max results to return (default: 10)
    threshold?: number          // Minimum similarity score (default: 0.5)
  }
): Promise<Array<{
  id: string,                   // Chunk identifier
  content: string,              // Code content
  relativePath: string,         // File path relative to indexed root
  absolutePath: string,         // Absolute file path
  language: string,             // Programming language
  startLine: number,            // Starting line in file
  endLine: number,              // Ending line in file
  score: number                 // Similarity score (0-1)
}>>
```

## 🏗️ Architecture

### Ingestion Pipeline

- **Explorer** (`ingestion/explorer/`) - Discover files in repositories
- **Chunker** (`ingestion/chunker/`) - Parse and chunk code using AST
- **Embedder** (`ingestion/embedder/`) - Generate semantic embeddings
- **Indexer** (`ingestion/indexer/`) - Orchestrate the full ingestion pipeline

### Storage

- **Repository** (`storage/repository/`) - Database operations for chunks and embeddings
- **Schema** (`storage/schema/`) - Drizzle ORM schema definitions
- **Migrations** - Managed with Drizzle ORM

### Search

- **Semantic Search** (`search/`) - Vector similarity search with filtering

## 🧑‍💻 Development

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm run db:migrate

# Build the package
pnpm build

# Run in development mode with hot reload
pnpm dev
```

## 📄 License

This project is licensed under the MIT License.

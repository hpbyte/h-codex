# h-codex

A semantic code searcher (like Cursor) for intelligent code discovery.

- **AST-Based Chunking**: Intelligent code parsing using Abstract Syntax Trees for optimal chunk boundaries
- **Semantic Search**: Powered by OpenAI's `text-embedding-3-small` model for contextual understanding
- **Vector Database**: `PostgreSQL` with `pgvector` extension for similarity search
- **Multi-Language Support**: `TypeScript`, `JavaScript`, and extensible for other languages

## 🐳 Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/hpbyte/h-codex.git
   cd h-codex
   ```

2. **Environment file**

   ```bash
   cp .env.example .env
   ```

3. **Run the initial setup script**

   ```bash
   cd scripts && ./docker-setup.sh
   ```

## 🔧 Configuration Options

| Environment Variable   | Description                      | Default                  |
| ---------------------- | -------------------------------- | ------------------------ |
| `OPENAI_API_KEY`       | OpenAI API key for embeddings    | Required                 |
| `EMBEDDING_MODEL`      | OpenAI model for embeddings      | `text-embedding-3-small` |
| `CHUNK_SIZE`           | Maximum chunk size in characters | `1_000`                  |
| `CHUNK_OVERLAP`        | Overlap between chunks           | `200`                    |
| `SEARCH_RESULTS_LIMIT` | Max search results returned      | `10`                     |
| `SIMILARITY_THRESHOLD` | Minimum similarity for results   | `0.7`                    |

## 🎯 Supported Code Constructs

The AST chunker recognizes and processes:

- **Functions**: Function declarations, arrow functions, function expressions
- **Classes**: Class declarations with methods
- **Interfaces**: TypeScript interface definitions
- **Type Aliases**: TypeScript type definitions
- **Exports**: Default and named exports
- **Methods**: Class methods with proper context

## 🚧 Development

### Run the deps

```bash
docker compose --profile deps up -d
```

### Run the backend

```bash
cd backend && bun run dev
```

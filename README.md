# h-codex

A semantic code search tool for intelligent, cross-repo context retrieval.

- **AST-Based Chunking**: Intelligent code parsing using Abstract Syntax Trees for optimal chunk boundaries
- **Semantic Search**: Powered by OpenAI's `text-embedding-3-small` model for contextual understanding
- **Vector Database**: `PostgreSQL` with `pgvector` extension for similarity search
- **Multi-Language Support**: `TypeScript`, `JavaScript`, and extensible for other languages

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) - For running PostgreSQL with pgvector

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/hpbyte/h-codex.git
   cd h-codex
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your OpenAI API key and other configuration options.

3. **Install dependencies**

   ```bash
   bun install
   ```

4. **Start PostgreSQL database**

   ```bash
   cd dev && docker compose up -d
   ```

5. **Set up the database**

   ```bash
   bun run db:setup
   ```

### Available Scripts

- `bun run db:generate --name migration_name` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run lint:fix` - Fix linting issues
- `bun run format` - Format code using Prettier

## 🔧 Configuration Options

| Environment Variable   | Description                      | Default                  |
| ---------------------- | -------------------------------- | ------------------------ |
| `OPENAI_API_KEY`       | OpenAI API key for embeddings    | Required                 |
| `EMBEDDING_MODEL`      | OpenAI model for embeddings      | `text-embedding-3-small` |
| `CHUNK_SIZE`           | Maximum chunk size in characters | `1_000`                  |
| `CHUNK_OVERLAP`        | Overlap between chunks           | `200`                    |
| `SEARCH_RESULTS_LIMIT` | Max search results returned      | `10`                     |
| `SIMILARITY_THRESHOLD` | Minimum similarity for results   | `0.7`                    |

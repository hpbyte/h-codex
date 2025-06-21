# h-codex

A semantic code search tool for intelligent, cross-repo context retrieval.

## ✨ Features

- **AST-Based Chunking**: Intelligent code parsing using Abstract Syntax Trees for optimal chunk boundaries
- **Embedding & Semantic Search**: Using OpenAI's `text-embedding-3-small` model (support for `voyage-code-3` planned)
- **Vector Database**: PostgreSQL with pgvector extension for efficient similarity search
- **Multi-Language Support**: TypeScript, JavaScript, and extensible for other languages
- **MCP Integration**: Seamlessly connects with AI coding assistants through Model Context Protocol

## 🚀 Getting started

h-codex can be integrated with AI assistants through the Model Context Protocol.

### Example with Claude Desktop

Edit your `claude_mcp_settings.json` file:

```json
{
  "mcpServers": {
    "h-codex": {
      "command": "npx",
      "args": ["@h-codex/mcp"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "DB_CONNECTION_STRING": "postgresql://postgres:password@localhost:5432/h-codex"
      }
    }
  }
}
```

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) - Package manager
- [Docker](https://www.docker.com/) - For running PostgreSQL with pgvector
- OpenAI API key for embeddings

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/hpbyte/h-codex.git
   cd h-codex
   ```

2. **Set up environment variables**

   ```bash
   cp packages/core/.env.example packages/core/.env
   ```

   Edit the `.env` file with your OpenAI API key and other configuration options.

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Start PostgreSQL database**

   ```bash
   cd dev && docker compose up -d
   ```

5. **Set up the database**

   ```bash
   pnpm run db:migrate
   ```

6. **Start development server**

   ```bash
   pnpm dev
   ```

## 🔧 Configuration Options

| Environment Variable   | Description                      | Default                                                 |
| ---------------------- | -------------------------------- | ------------------------------------------------------- |
| `OPENAI_API_KEY`       | OpenAI API key for embeddings    | Required                                                |
| `EMBEDDING_MODEL`      | OpenAI model for embeddings      | `text-embedding-3-small`                                |
| `CHUNK_SIZE`           | Maximum chunk size in characters | `1000`                                                  |
| `SEARCH_RESULTS_LIMIT` | Max search results returned      | `10`                                                    |
| `SIMILARITY_THRESHOLD` | Minimum similarity for results   | `0.5`                                                   |
| `DB_CONNECTION_STRING` | PostgreSQL connection string     | `postgresql://postgres:password@localhost:5432/h-codex` |

## 🏗️ Architecture

```mermaid
graph TD
    subgraph "Core Package"
        subgraph "Ingestion Pipeline"
            Explorer["Explorer<br/>(file discovery)"]
            Chunker["Chunker<br/>(AST parsing & chunking)"]
            Embedder["Embedder<br/>(semantic embeddings)"]
            Indexer["Indexer<br/>(orchestration)"]

            Explorer --> Chunker
            Chunker --> Embedder
            Embedder --> Indexer
        end

        subgraph "Storage Layer"
            Repository["Repository"]
        end

        Indexer --> Repository
        Repository --> Database[(PostgreSQL Vector Database)]
    end

    subgraph "MCP Package"
        MCPServer["MCP Server"]
        CodeIndexTool["Code Index Tool"]
        CodeSearchTool["Code Search Tool"]

        MCPServer --> CodeIndexTool
        MCPServer --> CodeSearchTool
    end

    CodeIndexTool --> Indexer
    CodeSearchTool --> Repository
```

## 🗺️ Roadmap

- Support for additional embedding providers (Voyage AI)
- Enhanced language support with more tree-sitter parsers

## 📄 License

This project is licensed under the MIT License

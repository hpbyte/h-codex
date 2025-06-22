# h-codex Backend

API server with OpenAI embeddings

## Prerequisites

- [Bun](https://bun.sh/) runtime
- PostgreSQL database
- OpenAI API key

## Setup

```bash
# Install dependencies
bun install

# Setup database
bun run db:setup
bun run db:migrate
```

## Development

```bash
bun run dev
```

## API Endpoints

- `GET /` - Healthcheck
- `POST /api/ingest` - Ingest code chunks
- `POST /api/search` - Talk with the code

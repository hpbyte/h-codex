# h-codex CLI

Command-line interface for h-codex semantic code search.

## Installation

```bash
npm install -g @hpbyte/h-codex-cli
```

## Setup

Run the setup wizard to configure your API key:

```bash
h-codex init
```

This creates `~/.config/h-codex/config.json` with your settings.

## Configuration

The config file at `~/.config/h-codex/config.json` contains:

```json
{
  "apiKey": "your-api-key",
  "dbConnectionString": "postgresql://localhost:5432/h-codex",
  "baseURL": "https://api.openai.com/v1",
  "model": "text-embedding-3-small",
  "chunkSize": 1000,
  "searchResultsLimit": 10,
  "similarityThreshold": 0.5
}
```

## Commands

```bash
# Index a directory
h-codex index ./src

# List indexed projects
h-codex list

# Clear project's indexed data
h-codex clear project-name
```

## Requirements

- Node.js 18+
- OpenAI API key
- PostgreSQL database

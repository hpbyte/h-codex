# @hpbyte/h-codex-mcp

Model Context Protocol server for h-codex, providing AI assistants with tools to interact with code indexing and search functionality.

## ✨ Features

- Multiple Projects Support: Index and search multiple projects
- **Semantic Search**: Find relevant code snippets using natural language queries
- **Code Indexing**: Index repositories for semantic code search
- **AI Assistant Integration**: Seamlessly works with AI assistants that support MCP
- **Simple Setup**: Easy configuration with common AI coding tools

## 🚀 Getting started

h-codex MCP server can be integrated with various AI assistants that support the Model Context Protocol:

### Claude Desktop

```json
{
  "mcpServers": {
    "h-codex": {
      "command": "npx",
      "args": ["@hpbyte/h-codex-mcp"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "DB_CONNECTION_STRING": "postgresql://postgres:password@localhost:5432/h-codex"
      }
    }
  }
}
```

### Cursor

1. Navigate to **Settings → MCP Servers → Add Server**
2. Fill in the server details:
   - **Name**: `h-codex`
   - **Type**: `STDIO`
   - **Command**: `npx`
   - **Arguments**: `["@hpbyte/h-codex-mcp"]`
   - **Environment Variables**:
     _ `OPENAI_API_KEY`: `your-openai-api-key`
     _ And any additional database configuration variables

### Other MCP Clients

The server uses stdio transport and follows the standard MCP protocol. It can be integrated with any MCP-compatible client.

## 🛠️ Available Tools

| Tool Name     | Description                                | Parameters                                      |
| ------------- | ------------------------------------------ | ----------------------------------------------- |
| `code-search` | Semantically search through indexed code   | `query`: String - The search query text         |
| `code-index`  | Index a directory/repository for searching | `path`: String - Path to the directory to index |

### Example Usage

With Claude or other AI assistants, you can use these tools like:

```
Please search the codebase for "database connection implementation"
```

Or:

```
Please index the src directory for me
```

## 🧑‍💻 Development

### Getting Started

```bash
# Clone repository
git clone https://github.com/hpbyte/h-codex.git
cd h-codex

# Install dependencies
pnpm install

# Start development server with hot reload
pnpm --filter @hpbyte/h-codex-mcp dev
```

### Building

```bash
# Build for production
pnpm --filter @hpbyte/h-codex-mcp build
```

## 🔮 Upcoming Features

- [ ] Enhanced code analysis tools
- [ ] Dependency graph analysis

## 📄 License

This project is licensed under the MIT License.

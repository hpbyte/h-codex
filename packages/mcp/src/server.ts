import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export const server = new McpServer(
  {
    name: 'h-codex',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {
        listChanged: true,
      },
    },
  }
)

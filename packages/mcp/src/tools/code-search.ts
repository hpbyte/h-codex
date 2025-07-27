import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { semanticSearch } from '@hpbyte/h-codex-core'

import type { Tool } from '../types'

import { CodeSearchInputSchema } from './schemas'

class CodeSearchTool implements Tool {
  register(server: McpServer) {
    server.registerTool(
      'code-search',
      {
        title: 'Semantically search the codebase',
        description: 'Perform semantic search on indexed code chunks',
        inputSchema: CodeSearchInputSchema,
      },
      async ({ query, projects }) => {
        try {
          const result = await semanticSearch.search(query, { projects })

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error searching code: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          }
        }
      }
    )
  }
}

const tool = new CodeSearchTool()

export default tool

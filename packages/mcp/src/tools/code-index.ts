import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { indexer } from '@hpbyte/h-codex-core'

import type { Tool } from '../types'

import { CodeIndexInputSchema } from './schemas'

class CodeIndexTool implements Tool {
  register(server: McpServer) {
    server.registerTool(
      'code-index',
      {
        title: 'Index codebase',
        description: 'Explore and index code files in a directory path',
        inputSchema: CodeIndexInputSchema,
      },
      async ({ path }) => {
        try {
          const result = await indexer.index(path)

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  result,
                  (_, value) => {
                    if (
                      typeof value === 'function' ||
                      value instanceof RegExp ||
                      value instanceof Error
                    ) {
                      return value.toString()
                    }
                    return value
                  },
                  2
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error indexing code: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          }
        }
      }
    )
  }
}

const tool = new CodeIndexTool()

export default tool

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { indexer } from '@hpbyte/h-codex-core'

import { CodeClearInputSchema } from './schemas'

import type { Tool } from '../types'

class CodeClearTool implements Tool {
  register(server: McpServer) {
    server.registerTool(
      'code-clear',
      {
        title: 'Clear codebase indices',
        description: 'Clear the indexed information about the codebase in a project',
        inputSchema: CodeClearInputSchema,
      },
      async ({ project }) => {
        try {
          await indexer.clear(project)

          return {
            content: [
              {
                type: 'text',
                text: 'Codebase indices cleared',
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error clearing codebase: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          }
        }
      }
    )
  }
}

const tool = new CodeClearTool()

export default tool

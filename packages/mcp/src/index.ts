#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { server } from './server'
import tools from './tools'

function registerTools() {
  tools.forEach(tool => tool.register(server))
}

async function main() {
  const transport = new StdioServerTransport()

  registerTools()

  await server.connect(transport)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})

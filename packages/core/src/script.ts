#!/usr/bin/env node

import { indexer } from './ingestion'
import { semanticSearch } from './search'

const helpMesg = `
  Usage: h-codexx <command> <path>

  Commands:
    index <path>   Index a directory of code
    search <query> Search for a query
`

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('No arguments provided')
    return
  }

  const [command, arg] = args

  if (!command || !arg) {
    console.log(helpMesg)
    return
  }

  if (!['index', 'search', 'clear'].includes(command)) {
    console.log('Invalid command')
    return
  }

  if (command === 'index') {
    return indexer.index(arg)
  }

  if (command === 'search') {
    return semanticSearch.search(arg)
  }

  if (command === 'clear') {
    return indexer.clear(arg)
  }
}

main()

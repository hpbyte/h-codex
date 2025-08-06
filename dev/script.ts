import { indexer } from './ingestion'
import { semanticSearch } from './search'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: h-codexx <command> [options]')
    console.log('Commands:')
    console.log('  index <path>   Index a folder of code files')
    console.log('  clear <name>   Clear the index for a project')
    console.log('  search <query> Search for code snippets')
  }

  const command = args[0]
  const param = args[1]?.toString()

  if (!param) {
    console.log('Missing parameter')
    return
  }

  switch (command) {
    case 'index':
      await indexer.index(param)
      break
    case 'clear':
      await indexer.clear(param)
      break
    case 'search':
      await semanticSearch.search(param)
      break
    default:
      console.log('Invalid command')
      break
  }
}

main()

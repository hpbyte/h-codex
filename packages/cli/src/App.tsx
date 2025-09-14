import { Box, Text } from 'ink'

import { IndexCodebase, ListProjects, ClearCodebase, InitConfig } from './commands/index.js'

interface Props {
  input: string[]
  flags: Record<string, any>
}

export default function App({ input, flags }: Props) {
  const [command] = input
  const args = input.slice(1)[0] || ''

  if (!command) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">⚠️ No command provided</Text>
        <Text>Run with --help to see available commands</Text>
      </Box>
    )
  }

  switch (command) {
    case 'init':
      return <InitConfig />
    case 'index':
      return <IndexCodebase path={args} flags={flags} />
    case 'clear':
      return <ClearCodebase project={args} />
    case 'list':
      return <ListProjects />
    default:
      return (
        <Box flexDirection="column">
          <Text color="red">❌ Unknown command: {command}</Text>
          <Text>Available commands: init, index, list, clear</Text>
        </Box>
      )
  }
}

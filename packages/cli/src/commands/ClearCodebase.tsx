import { useState, useEffect } from 'react'
import { Box, Text } from 'ink'

interface Props {
  project: string
}

export default function ClearCommand({ project }: Props) {
  const [isClearing, setIsClearing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!project) {
      setError('Project name is required for clearing')
      return
    }

    const runClear = async () => {
      setIsClearing(true)
      try {
        const { indexer } = await import('@hpbyte/h-codex-core')
        await indexer.clear(project)
        setResult(`✅ Successfully cleared project "${project}"`)
      } catch (err) {
        setError(`Failed to clear project: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsClearing(false)
      }
    }

    runClear()
  }, [project])

  if (error) {
    return (
      <Box>
        <Text color="red">❌ {error}</Text>
      </Box>
    )
  }

  if (isClearing) {
    return (
      <Box>
        <Text color="blue">⏳ Clearing project "{project}"...</Text>
      </Box>
    )
  }

  if (result) {
    return (
      <Box>
        <Text color="green">{result}</Text>
      </Box>
    )
  }

  return null
}

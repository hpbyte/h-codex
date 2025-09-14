import { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import path from 'path'

interface Props {
  path: string
  flags: Record<string, any>
}

export default function IndexCommand({ path: targetPath, flags }: Props) {
  const [isIndexing, setIsIndexing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!targetPath) {
      setError('Path is required for indexing')
      return
    }

    const runIndex = async () => {
      setIsIndexing(true)
      try {
        const { indexer } = await import('@hpbyte/h-codex-core')
        const absolutePath = path.resolve(targetPath)
        const projectName = flags.project || path.basename(absolutePath)

        await indexer.index(absolutePath)
        setResult(`✅ Successfully indexed ${absolutePath} as project "${projectName}"`)
      } catch (err) {
        setError(`Failed to index: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsIndexing(false)
      }
    }

    runIndex()
  }, [targetPath, flags.project])

  if (error) {
    return (
      <Box>
        <Text color="red">❌ {error}</Text>
      </Box>
    )
  }

  if (isIndexing) {
    return (
      <Box>
        <Text color="blue">⏳ Indexing {targetPath}...</Text>
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

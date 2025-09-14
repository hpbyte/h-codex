import { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import type { Project } from '@hpbyte/h-codex-core'

export default function ListCommand() {
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runList = async () => {
      setIsLoading(true)
      try {
        const { projectsRepository } = await import('@hpbyte/h-codex-core')
        const projectList = await projectsRepository.list()
        setProjects(projectList)
      } catch (err) {
        setError(`Failed to list projects: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    runList()
  }, [])

  if (error) {
    return (
      <Box>
        <Text color="red">❌ {error}</Text>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box>
        <Text color="blue">⏳ Loading projects...</Text>
      </Box>
    )
  }

  if (projects) {
    if (projects.length === 0) {
      return (
        <Box>
          <Text color="yellow">No projects indexed yet</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Text color="green">📋 Indexed projects ({projects.length}):</Text>
        <Text></Text>
        {projects.map((project, index) => (
          <Text key={index} color="cyan">
            • {project.name}
          </Text>
        ))}
      </Box>
    )
  }

  return null
}

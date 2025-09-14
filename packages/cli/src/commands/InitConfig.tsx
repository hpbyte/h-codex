import React, { useState } from 'react'
import { Box, Text, Newline } from 'ink'
import TextInput from 'ink-text-input'
import { configManager, type Config } from '../config/manager.js'

enum SetupStep {
  ApiKey,
  DatabaseUrl,
  BaseUrl,
  Model,
  Complete,
  Error,
}

export default function InitCommand() {
  const [step, setStep] = useState(SetupStep.ApiKey)
  const [config, setConfig] = useState<Config>({})
  const [error, setError] = useState<string | null>(null)
  const [currentInput, setCurrentInput] = useState('')

  const handleApiKeySubmit = (value: string) => {
    if (!value.trim()) {
      setError('API key is required')
      return
    }
    setConfig(prev => ({ ...prev, apiKey: value.trim() }))
    setCurrentInput('')
    setError(null)
    setStep(SetupStep.DatabaseUrl)
  }

  const handleDatabaseUrlSubmit = (value: string) => {
    const dbUrl = value.trim() || 'postgresql://postgres:password@localhost:5432/h-codex'
    setConfig(prev => ({ ...prev, dbConnectionString: dbUrl }))
    setCurrentInput('')
    setStep(SetupStep.BaseUrl)
  }

  const handleBaseUrlSubmit = (value: string) => {
    const baseUrl = value.trim() || 'https://api.openai.com/v1'
    setConfig(prev => ({ ...prev, baseURL: baseUrl }))
    setCurrentInput('')
    setStep(SetupStep.Model)
  }

  const handleModelSubmit = (value: string) => {
    const model = value.trim() || 'text-embedding-3-small'
    const finalConfig: Config = {
      ...config,
      model,
      chunkSize: 1000,
      searchResultsLimit: 10,
      similarityThreshold: 0.5,
    }

    try {
      configManager.writeConfig(finalConfig)
      setStep(SetupStep.Complete)
    } catch (err) {
      setError(`Failed to save config: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setStep(SetupStep.Error)
    }
  }

  if (step === SetupStep.Complete) {
    return (
      <Box flexDirection="column">
        <Text color="green">✅ Configuration saved successfully!</Text>
        <Text color="gray">Config file: {configManager.getConfigPath()}</Text>
        <Newline />
        <Text>You can now use h-codex commands:</Text>
        <Text color="cyan"> h-codex index ./src</Text>
        <Text color="cyan"> h-codex list</Text>
        <Text color="cyan"> h-codex clear project-name</Text>
      </Box>
    )
  }

  if (step === SetupStep.Error) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ Setup failed</Text>
        <Text color="red">{error}</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text color="blue">🔧 h-codex Configuration Setup</Text>
      <Newline />

      {step === SetupStep.ApiKey && (
        <>
          <Text>Enter your API key (required):</Text>
          <Text color="gray">This will be used for generating embeddings</Text>
          <Box marginTop={1}>
            <Text color="cyan">API Key: </Text>
            <TextInput
              value={currentInput}
              onChange={setCurrentInput}
              onSubmit={handleApiKeySubmit}
              mask="*"
            />
          </Box>
          {error && <Text color="red">{error}</Text>}
        </>
      )}

      {step === SetupStep.DatabaseUrl && (
        <>
          <Text>Enter database connection string (optional):</Text>
          <Text color="gray">
            Press Enter for default: postgresql://postgres:password@localhost:5432/h-codex
          </Text>
          <Box marginTop={1}>
            <Text color="cyan">Database URL: </Text>
            <TextInput
              value={currentInput}
              onChange={setCurrentInput}
              onSubmit={handleDatabaseUrlSubmit}
              placeholder="postgresql://postgres:password@localhost:5432/h-codex"
            />
          </Box>
        </>
      )}

      {step === SetupStep.BaseUrl && (
        <>
          <Text>Enter API base URL (optional):</Text>
          <Text color="gray">Press Enter for default: https://api.openai.com/v1</Text>
          <Box marginTop={1}>
            <Text color="cyan">Base URL: </Text>
            <TextInput
              value={currentInput}
              onChange={setCurrentInput}
              onSubmit={handleBaseUrlSubmit}
              placeholder="https://api.openai.com/v1"
            />
          </Box>
        </>
      )}

      {step === SetupStep.Model && (
        <>
          <Text>Enter embedding model (optional):</Text>
          <Text color="gray">Press Enter for default: text-embedding-3-small</Text>
          <Box marginTop={1}>
            <Text color="cyan">Model: </Text>
            <TextInput
              value={currentInput}
              onChange={setCurrentInput}
              onSubmit={handleModelSubmit}
              placeholder="text-embedding-3-small"
            />
          </Box>
        </>
      )}
    </Box>
  )
}

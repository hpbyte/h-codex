import fs from 'fs'
import path from 'path'
import os from 'os'

export interface Config {
  apiKey?: string
  dbConnectionString?: string
  baseURL?: string
  model?: string
  chunkSize?: number
  searchResultsLimit?: number
  similarityThreshold?: number
}

export class ConfigManager {
  private configPath: string

  constructor() {
    const configDir = path.join(os.homedir(), '.config', 'h-codex')
    this.configPath = path.join(configDir, 'config.json')
  }

  getConfigPath() {
    return this.configPath
  }

  getConfigDir() {
    return path.dirname(this.configPath)
  }

  configExists() {
    return fs.existsSync(this.configPath)
  }

  ensureConfigDir() {
    const configDir = this.getConfigDir()
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
  }

  readConfig(): Config | null {
    if (!this.configExists()) {
      return null
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      throw new Error(
        `Failed to read config file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  writeConfig(config: Config) {
    this.ensureConfigDir()

    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2))
    } catch (error) {
      throw new Error(
        `Failed to write config file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  loadConfigIntoEnv() {
    const config = this.readConfig()

    if (!config) {
      throw new Error(
        `Configuration file not found. Please run 'h-codex init' to set up your configuration.`
      )
    }

    if (!config.apiKey) {
      throw new Error(
        `API key not configured. Please run 'h-codex init' to set up your configuration.`
      )
    }

    process.env.LLM_API_KEY = config.apiKey

    if (config.dbConnectionString) {
      process.env.DB_CONNECTION_STRING = config.dbConnectionString
    }

    if (config.baseURL) {
      process.env.LLM_BASE_URL = config.baseURL
    }

    if (config.model) {
      process.env.EMBEDDING_MODEL = config.model
    }

    if (config.chunkSize) {
      process.env.CHUNK_SIZE = config.chunkSize.toString()
    }

    if (config.searchResultsLimit) {
      process.env.SEARCH_RESULTS_LIMIT = config.searchResultsLimit.toString()
    }

    if (config.similarityThreshold) {
      process.env.SIMILARITY_THRESHOLD = config.similarityThreshold.toString()
    }
  }
}

export const configManager = new ConfigManager()

import fg from 'fast-glob'
import { promises as fs } from 'fs'
import { resolve, join } from 'path'

export interface FileExplorerConfig {
  supportedExtensions: string[]
  ignoreFiles: string[]
  defaultIgnorePatterns: string[]
}

export const DEFAULT_CONFIG: FileExplorerConfig = {
  supportedExtensions: [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.mjs',
    '.cjs',
    '.json',
    '.md',
    '.yaml',
    '.yml',
    '.toml',
    '.graphql',
    '.gql',
    '.sql',
    '.html',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.vue',
    '.svelte',
  ],
  ignoreFiles: [
    '.gitignore',
    '.dockerignore',
    '.eslintignore',
    '.prettierignore',
    '.npmignore',
    '.vercelignore',
  ],
  defaultIgnorePatterns: [
    'node_modules/**',
    '.git/**',
    '*.log',
    '*.lock',
    'package-lock.json',
    'yarn.lock',
    'bun.lockb',
  ],
}

export class FileExplorer {
  private config: FileExplorerConfig

  constructor(config: FileExplorerConfig = DEFAULT_CONFIG) {
    this.config = config
  }

  async discover(folderPath: string): Promise<string[]> {
    const absolutePath = resolve(folderPath)

    try {
      const stats = await fs.stat(absolutePath)
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${absolutePath}`)
      }
    } catch {
      throw new Error(`Cannot access folder: ${absolutePath}`)
    }

    const patterns = this.config.supportedExtensions.map(ext => `**/*${ext}`)

    const ignorePatterns = await this.loadIgnorePatterns(absolutePath)

    const files = await fg(patterns, {
      cwd: absolutePath,
      absolute: true,
      ignore: ignorePatterns,
      onlyFiles: true,
      followSymbolicLinks: false,
      suppressErrors: true,
    })

    return files.sort()
  }

  private async loadIgnorePatterns(rootPath: string): Promise<string[]> {
    const allPatterns = [...this.config.defaultIgnorePatterns]

    for (const ignoreFile of this.config.ignoreFiles) {
      const filePath = join(rootPath, ignoreFile)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        const patterns = this.parseIgnoreFile(content)
        allPatterns.push(...patterns)
      } catch {
        // Ignore file doesn't exist or can't be read, skip it
      }
    }

    return allPatterns
  }

  private parseIgnoreFile(content: string): string[] {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        // Convert gitignore patterns to fast-glob patterns
        if (line.endsWith('/')) {
          return `${line}**`
        }
        if (!line.includes('/') && !line.includes('*')) {
          return `**/${line}`
        }
        return line
      })
  }

  async validateFile(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath)
      return stats.isFile() && stats.size > 0
    } catch {
      return false
    }
  }

  createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  async processInBatches<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options = { batchSize: 10, maxConcurrency: 5 }
  ): Promise<{ results: R[]; errors: Array<{ item: T; error: Error }> }> {
    const batches = this.createBatches(items, options.batchSize)
    const results: R[] = []
    const errors: Array<{ item: T; error: Error }> = []

    for (let i = 0; i < batches.length; i += options.maxConcurrency) {
      const currentBatches = batches.slice(i, i + options.maxConcurrency)

      const batchPromises = currentBatches.map(async batch => {
        const batchResults = await Promise.allSettled(batch.map(item => processor(item)))

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            errors.push({
              item: batch[index]!,
              error: result.reason,
            })
          }
        })
      })

      await Promise.all(batchPromises)
    }

    return { results, errors }
  }

  getFileExtension(filePath: string): string {
    const lastDotIndex = filePath.lastIndexOf('.')
    return lastDotIndex === -1 ? '' : filePath.substring(lastDotIndex)
  }

  isFileSupported(filePath: string): boolean {
    const extension = this.getFileExtension(filePath)
    return this.config.supportedExtensions.includes(extension)
  }

  updateConfig(newConfig: Partial<FileExplorerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

export const fileExplorer = new FileExplorer()

import type { FileExplorerConfig } from '../types'

export const maxChunkSize = 512 * 3
export const coalesce = 50

export const supportedExtensions = [
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
  '.py',
  '.json',
]

export const DEFAULT_CONFIG: FileExplorerConfig = {
  supportedExtensions,
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
    'dist/**',
    '.git/**',
    '*.log',
    '*.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'bun.lockb',
  ],
}

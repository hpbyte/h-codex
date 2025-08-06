export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value || defaultValue!
}

export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`)
  }
  return parsed
}

export function formatString(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[.-]+|[.-]+$/g, '')
    .replace(/^$/, 'untitled-project')
    .substring(0, 100)
}

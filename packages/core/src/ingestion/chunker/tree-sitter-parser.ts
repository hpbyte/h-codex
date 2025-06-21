import * as fs from 'node:fs/promises'
import Parser from 'tree-sitter'

import type { SupportedLanguage } from '../../types'

export class TreeSitterParser {
  private parser: Parser

  constructor() {
    this.parser = new Parser()
  }

  async parseFile(filePath: string, language: SupportedLanguage) {
    const languageParser = await this.getLanguageParser(language)

    this.parser.setLanguage(languageParser)

    const content = await fs.readFile(filePath, 'utf-8')
    const tree = this.parser.parse(content)

    console.log('total content length: ', content.length)

    return tree.rootNode
  }

  private async getLanguageParser(language: SupportedLanguage) {
    const langObject = await import(`tree-sitter-${this.getParserName(language)}`)

    if (!langObject) {
      throw new Error(`Language ${language} was not properly initialized`)
    }

    switch (language) {
      case 'typescript':
        return langObject.default.typescript
      case 'typescript-react':
        return langObject.default.typescriptReact
      case 'javascript':
        return langObject.default
      case 'javascript-react':
        return langObject.default.javascriptReact
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  }

  private getParserName(language: SupportedLanguage) {
    switch (language) {
      case 'typescript':
      case 'typescript-react':
        return 'typescript'
      case 'javascript':
      case 'javascript-react':
        return 'javascript'
      default:
        return language
    }
  }
}

export const treeSitterParser = new TreeSitterParser()

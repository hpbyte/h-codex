import Parser from 'tree-sitter'
import JavaScript from 'tree-sitter-javascript'
import TypeScript from 'tree-sitter-typescript'
import { createHash } from 'crypto'

import type { CodeChunkInsert, SupportedLanguage } from '../../types'

export class TreeSitterParser {
  private parser: Parser
  private jsLanguage: any
  private tsLanguage: any

  constructor() {
    this.parser = new Parser()
    this.jsLanguage = JavaScript
    this.tsLanguage = TypeScript.typescript
  }

  async parseFile(filePath: string, content: string): Promise<CodeChunkInsert[]> {
    try {
      const language = this.detectLanguage(filePath)

      if (!this.isSupported(language)) {
        console.warn(`Unsupported language for file: ${filePath}`)
        return []
      }

      return this.extractChunks(content, filePath, language)
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
      return []
    }
  }

  private extractChunks(
    content: string,
    filePath: string,
    language: SupportedLanguage
  ): CodeChunkInsert[] {
    const chunks: CodeChunkInsert[] = []

    try {
      // Set the appropriate language
      if (language === 'typescript') {
        this.parser.setLanguage(this.tsLanguage)
      } else {
        this.parser.setLanguage(this.jsLanguage)
      }

      const tree = this.parser.parse(content)
      const lines = content.split('\n')

      // Query for different node types
      const queries = this.getQueries(language)

      for (const queryInfo of queries) {
        const query = this.parser.getLanguage().query(queryInfo.pattern)
        const captures = query.captures(tree.rootNode)

        for (const capture of captures) {
          const node = capture.node
          const startPos = node.startPosition
          const endPos = node.endPosition

          const chunk = this.createChunk(
            content,
            filePath,
            startPos.row + 1, // Tree-sitter uses 0-based rows
            endPos.row + 1,
            queryInfo.nodeType,
            this.extractNodeName(node, capture.name),
            this.extractClassName(node),
            lines,
            language
          )

          chunks.push(chunk)
        }
      }
    } catch (error) {
      console.error(`Error parsing with Tree-sitter for ${filePath}:`, error)
      throw error
    }

    return chunks
  }

  private getQueries(language: SupportedLanguage) {
    const baseQueries = [
      {
        pattern: '(function_declaration name: (identifier) @name) @function',
        nodeType: 'FunctionDeclaration',
      },
      {
        pattern: '(arrow_function) @function',
        nodeType: 'ArrowFunctionExpression',
      },
      {
        pattern: '(method_definition name: (property_identifier) @name) @method',
        nodeType: 'ClassMethod',
      },
      {
        pattern: '(class_declaration name: (identifier) @name) @class',
        nodeType: 'ClassDeclaration',
      },
      {
        pattern:
          '(variable_declarator name: (identifier) @name value: (function_expression)) @variable_function',
        nodeType: 'VariableDeclarator',
      },
      {
        pattern:
          '(variable_declarator name: (identifier) @name value: (arrow_function)) @variable_function',
        nodeType: 'VariableDeclarator',
      },
      {
        pattern: '(export_statement declaration: (function_declaration)) @export',
        nodeType: 'ExportDefaultDeclaration',
      },
      {
        pattern: '(export_statement declaration: (class_declaration)) @export',
        nodeType: 'ExportDefaultDeclaration',
      },
    ]

    if (language === 'typescript') {
      baseQueries.push(
        {
          pattern: '(interface_declaration name: (type_identifier) @name) @interface',
          nodeType: 'TSInterfaceDeclaration',
        },
        {
          pattern: '(type_alias_declaration name: (type_identifier) @name) @type',
          nodeType: 'TSTypeAliasDeclaration',
        }
      )
    }

    return baseQueries
  }

  private extractNodeName(node: any, captureName?: string): string | undefined {
    // Try to get name from the captured node
    if (captureName === 'name') {
      return node.text
    }

    // Try to find name in child nodes
    for (const child of node.children) {
      if (child.type === 'identifier' || child.type === 'property_identifier') {
        return child.text
      }
    }

    return undefined
  }

  private extractClassName(node: any): string | undefined {
    // Walk up the tree to find containing class
    let current = node.parent
    while (current) {
      if (current.type === 'class_declaration') {
        // Find the identifier child
        for (const child of current.children) {
          if (child.type === 'identifier') {
            return child.text
          }
        }
      }
      current = current.parent
    }
    return undefined
  }

  private createChunk(
    content: string,
    filePath: string,
    startLine: number,
    endLine: number,
    nodeType: string,
    functionName?: string,
    className?: string,
    lines?: string[],
    language?: SupportedLanguage
  ): CodeChunkInsert {
    const chunkContent = lines
      ? lines.slice(startLine - 1, endLine).join('\n')
      : this.extractLines(content, startLine, endLine)

    const chunk: CodeChunkInsert = {
      content: chunkContent,
      filePath,
      startLine,
      endLine,
      nodeType,
      functionName,
      className,
      hash: this.generateHash(chunkContent, filePath, startLine, endLine),
      size: chunkContent.length,
      language: language || this.detectLanguage(filePath),
    }

    return chunk
  }

  private extractLines(content: string, startLine: number, endLine: number): string {
    const lines = content.split('\n')
    return lines.slice(startLine - 1, endLine).join('\n')
  }

  private generateHash(
    content: string,
    filePath: string,
    startLine: number,
    endLine: number
  ): string {
    const data = `${filePath}:${startLine}-${endLine}:${content}`
    return createHash('sha256').update(data).digest('hex')
  }

  private detectLanguage(filePath: string): SupportedLanguage {
    const extension = filePath.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'js':
      case 'jsx':
        return 'javascript'
      default:
        return 'javascript'
    }
  }

  private isSupported(language: SupportedLanguage): boolean {
    return ['typescript', 'javascript'].includes(language)
  }
}

export const treeSitterParser = new TreeSitterParser()

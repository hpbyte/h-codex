import * as fs from 'fs'
import * as path from 'path'
import { parse, type ParserOptions } from '@babel/parser'
import traverse, { type NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import { createHash } from 'crypto'

import type { CodeChunkInsert, SupportedLanguage } from '../types'

export class ASTChunker {
  async processFile(filePath: string) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8')
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

  private extractChunks(content: string, filePath: string, language: SupportedLanguage) {
    const chunks: CodeChunkInsert[] = []

    try {
      const ast = this.parseCode(content, language)
      const lines = content.split('\n')

      traverse(ast, {
        FunctionDeclaration: path => {
          const node = path.node
          if (node.loc) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'FunctionDeclaration',
              node.id?.name,
              undefined,
              lines
            )
            chunks.push(chunk)
          }
        },

        ArrowFunctionExpression: path => {
          const node = path.node
          if (node.loc) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'ArrowFunctionExpression',
              this.getFunctionName(path),
              undefined,
              lines
            )
            chunks.push(chunk)
          }
        },

        ClassMethod: path => {
          const node = path.node
          const className = this.getClassName(path)
          if (node.loc) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'ClassMethod',
              this.getMethodName(node),
              className,
              lines
            )
            chunks.push(chunk)
          }
        },

        ClassDeclaration: path => {
          const node = path.node
          if (node.loc) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'ClassDeclaration',
              undefined,
              node.id?.name,
              lines
            )
            chunks.push(chunk)
          }
        },

        TSInterfaceDeclaration: path => {
          const node = path.node
          if (node.loc) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'TSInterfaceDeclaration',
              undefined,
              node.id?.name,
              lines
            )
            chunks.push(chunk)
          }
        },

        TSTypeAliasDeclaration: path => {
          const node = path.node
          if (node.loc) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'TSTypeAliasDeclaration',
              undefined,
              node.id?.name,
              lines
            )
            chunks.push(chunk)
          }
        },

        VariableDeclarator: path => {
          const node = path.node
          if (
            node.loc &&
            (t.isFunctionExpression(node.init) || t.isArrowFunctionExpression(node.init))
          ) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'VariableDeclarator',
              t.isIdentifier(node.id) ? node.id.name : undefined,
              undefined,
              lines
            )
            chunks.push(chunk)
          }
        },

        ExportDefaultDeclaration: path => {
          const node = path.node
          if (
            node.loc &&
            (t.isFunctionDeclaration(node.declaration) || t.isClassDeclaration(node.declaration))
          ) {
            const chunk = this.createChunk(
              content,
              filePath,
              node.loc.start.line,
              node.loc.end.line,
              'ExportDefaultDeclaration',
              this.getExportName(node.declaration),
              undefined,
              lines
            )
            chunks.push(chunk)
          }
        },
      })
    } catch (error) {
      console.error(`Error parsing AST for ${filePath}:`, error)
      throw error
    }

    return chunks
  }

  private parseCode(content: string, language: SupportedLanguage) {
    const isTypeScript = language === 'typescript'

    const plugins: ParserOptions['plugins'] = [
      'jsx',
      'asyncGenerators',
      'bigInt',
      'classProperties',
      'decorators-legacy',
      'doExpressions',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionSent',
      'functionBind',
      'importMeta',
      'nullishCoalescingOperator',
      'numericSeparator',
      'objectRestSpread',
      'optionalCatchBinding',
      'optionalChaining',
      'throwExpressions',
      'topLevelAwait',
    ]

    if (isTypeScript) {
      plugins.push('typescript', 'decorators-legacy')
    }

    return parse(content, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins,
    })
  }

  private createChunk(
    content: string,
    filePath: string,
    startLine: number,
    endLine: number,
    nodeType: string,
    functionName?: string,
    className?: string,
    lines?: string[]
  ) {
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
      language: this.detectLanguage(filePath),
    }

    return chunk
  }

  private extractLines(content: string, startLine: number, endLine: number) {
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

  private getFunctionName(path: NodePath) {
    if (path.parent && t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
      return path.parent.id.name
    }
    if (path.parent && t.isProperty(path.parent) && t.isIdentifier(path.parent.key)) {
      return path.parent.key.name
    }
    return undefined
  }

  private getClassName(path: NodePath) {
    let current = path.parent
    while (current) {
      if (t.isClassDeclaration(current) && current.id) {
        return current.id.name
      }
      // @ts-expect-error - parent is not always defined
      current = current.parent
    }
    return undefined
  }

  private getMethodName(node: t.ClassMethod) {
    if (t.isIdentifier(node.key)) {
      return node.key.name
    }
    return undefined
  }

  private getExportName(declaration: t.Declaration | t.Expression) {
    if (t.isFunctionDeclaration(declaration) && declaration.id) {
      return declaration.id.name
    }
    if (t.isClassDeclaration(declaration) && declaration.id) {
      return declaration.id.name
    }
    return undefined
  }

  private detectLanguage(filePath: string) {
    const extension = path.extname(filePath).toLowerCase()

    switch (extension) {
      case '.ts':
      case '.tsx':
        return 'typescript'
      case '.js':
      case '.jsx':
        return 'javascript'
      default:
        return 'javascript'
    }
  }

  private isSupported(language: SupportedLanguage) {
    return ['typescript', 'javascript'].includes(language)
  }
}

export const astChunker = new ASTChunker()

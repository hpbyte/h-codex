#!/usr/bin/env node

import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import { configManager } from './config/manager.js'
import App from './App.js'

const cli = meow(
  `
	 ██╗  ██╗       ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗
	 ██║  ██║      ██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝
	 ███████║█████╗██║     ██║   ██║██║  ██║█████╗   ╚███╔╝
	 ██╔══██║╚════╝██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗
	 ██║  ██║      ╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗
	 ╚═╝  ╚═╝       ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝

	Usage
	  $ h-codex <command> [options]

	Commands
	  init             Set up h-codex configuration
	  index <path>     Index a directory for semantic search
	  list             List all indexed projects
	  clear [project]  Clear indexed data for a project

	Options
	  --help           Show help
	  --version        Show version

	Examples
	  $ h-codex init
	  $ h-codex index ./src
	  $ h-codex list
	  $ h-codex clear my-project
`,
  {
    importMeta: import.meta,
    flags: {
      project: {
        type: 'string',
        shortFlag: 'p',
      },
    },
  }
)

const [command] = cli.input

if (command === 'init') {
  render(<App input={cli.input} flags={cli.flags} />)
} else {
  try {
    configManager.loadConfigIntoEnv()

    render(<App input={cli.input} flags={cli.flags} />)
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : 'Configuration error'}`)
    process.exit(1)
  }
}

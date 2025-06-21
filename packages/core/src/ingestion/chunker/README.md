# Code Chunker

## Key Features

- **AST-Aware**: Respects TypeScript/JavaScript syntax boundaries (classes, functions, interfaces)
- **No Missing Lines**: Ensures complete coverage from line 0 to end of file
- **Size Limits**: Respects both maximum chunk size and minimum coalesce thresholds
- **Language Detection**: Supports TypeScript, TSX, JavaScript, and JSX files

## Core Components

### 1. **Span Class**
- Represents a line range with `start` and `end` properties
- `add()` method combines spans by taking min start and max end
- `extract()` method extracts text from content using line slice
- `length` property returns the number of lines in the span

### 2. **CSTChunker Class**
- **Configuration**: `maxChunkSize` (1536 chars), `coalesce` (50 chars)
- **Main method**: `processFile()` - orchestrates the entire chunking process

## Chunking Process

### Step 1: **AST-Based Initial Chunking** (`chunkNode()`)
- Uses Tree-sitter to parse the file into a syntax tree
- Traverses AST nodes and groups them into chunks based on semantic boundaries
- **For root node**: Ensures first chunk starts from line 0
- **Size management**: If a node is too large, recursively chunks it; if adding a node would exceed `maxChunkSize`, starts a new chunk
- **Output**: Array of `Span` objects representing semantic code boundaries

### Step 2: **Gap Filling** (`processChunks()`)
- **Makes chunks contiguous**: Fills gaps between AST-based chunks so no lines are skipped
- **First chunk**: Always starts from line 0
- **Subsequent chunks**: Start exactly where the previous chunk ended
- **Last chunk**: Extends to the end of the file

### Step 3: **Coalescing**
- Combines small chunks (< `coalesce` threshold) with adjacent chunks if the result doesn't exceed `maxChunkSize`
- Ensures chunks are meaningful and not too fragmented


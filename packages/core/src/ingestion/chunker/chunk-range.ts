interface IChunkRange {
  start: number
  end: number
  nodeType: string
}

export class ChunkRange implements IChunkRange {
  start: number
  end: number
  nodeType: string

  constructor(start: number, end: number, nodeType: string) {
    this.start = start
    this.end = end
    this.nodeType = nodeType
  }

  add(other: number | IChunkRange) {
    if (typeof other === 'number') {
      return new ChunkRange(this.start + other, this.end + other, this.nodeType)
    } else if (other instanceof ChunkRange) {
      return new ChunkRange(
        Math.min(this.start, other.start),
        Math.max(this.end, other.end),
        this.chooseNodeType(other.nodeType)
      )
    } else {
      throw new Error('Invalid argument type')
    }
  }

  extract(s: string) {
    const lines = s.split(/\r?\n/)
    let start = this.start
    let end = this.end

    while (start < end && lines[start]?.trim() === '') {
      start++
    }

    while (end > start && lines[end]?.trim() === '') {
      end--
    }

    this.start = start
    this.end = end

    return lines.slice(start, end + 1).join('\n')
  }

  chooseNodeType(nodeType: string) {
    if (['{', '}'].includes(nodeType)) {
      return this.nodeType
    }

    return nodeType
  }

  get isEmpty() {
    return this.end - this.start === 0
  }
}

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import { repository } from '../database/repository'
import { embeddingsService } from '../embeddings/service'
import { searchDto } from './dtos/search.dto'

const app = new Hono()

app.post('/', zValidator('json', searchDto), async c => {
  try {
    const { query } = c.req.valid('json')

    const [embedding] = await embeddingsService.generateEmbeddings([query])
    const results = await repository.findSimilarChunks(embedding!)

    return c.json({ results })
  } catch (error: unknown) {
    console.error(`Search error: ${error}`)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app

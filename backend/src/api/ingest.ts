import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import { ingestionService } from '../ingestion/service'
import { ingestDto } from './dtos/ingest'

const app = new Hono()

app.post('/', zValidator('json', ingestDto), async c => {
  const { chunks } = c.req.valid('json')

  const { insertedChunks } = await ingestionService.ingest(chunks)

  return c.json({ message: 'Ingestion successful', successful: insertedChunks.length })
})

export default app

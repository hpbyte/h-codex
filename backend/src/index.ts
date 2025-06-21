import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import api from './api'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())
app.use('*', prettyJSON())

app.get('/', c => c.json({ message: 'Welcome to H-Codex' }))

app.route('/api', api)

export default app

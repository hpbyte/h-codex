import { Hono } from 'hono'

import search from './search'

const app = new Hono()

app.route('/search', search)

export default app

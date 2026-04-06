import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { corsMiddleware } from './middleware/cors'
import { config } from './config'
import health from './routes/health'
import status from './routes/status'

const app = new Hono()

// Middleware
app.use('*', corsMiddleware)

// Routes
app.route('/health', health)
app.route('/api', status)

// Start server
const port = config.port
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})

export default app

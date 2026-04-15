import { Hono } from 'hono'

const status = new Hono()

status.get('/status', (c) => {
  return c.json({
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

export default status

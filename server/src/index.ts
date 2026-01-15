import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import config from './config'
import { initializeSocketHandlers } from './socket'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes (to be added)
app.get('/api/rooms', async (req, res) => {
  res.json({ rooms: [] })
})

app.get('/api/custom-boards', async (req, res) => {
  res.json({ boards: [] })
})

// Initialize Socket.io handlers
initializeSocketHandlers(io)

// Start server
httpServer.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`)
  console.log(`📡 WebSocket ready for connections`)
  console.log(`🌐 CORS origin: ${config.corsOrigin}`)
})

export { app, io }

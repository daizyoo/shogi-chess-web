import { Server, Socket } from 'socket.io'
import { handleRoomEvents } from './roomHandlers'
import { handleGameEvents } from './gameHandlers'

export function initializeSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`)

    // Room events
    handleRoomEvents(socket, io)

    // Game events
    handleGameEvents(socket, io)

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`)
    })
  })
}

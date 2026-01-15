import { Server, Socket } from 'socket.io'
import supabase from '../db/supabase'

export function handleGameEvents(socket: Socket, io: Server) {
  // Make a move
  socket.on('makeMove', async (roomId: string, move: any) => {
    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error) throw error

      if (!room || room.status !== 'playing') {
        socket.emit('error', 'Invalid game state')
        return
      }

      // TODO: Validate move with game logic
      // For now, just update the game state

      const gameState = room.game_state || {
        board: Array(9).fill(null).map(() => Array(9).fill(null)),
        hands: { 1: {}, 2: {} },
        currentTurn: 1,
        moves: [],
        status: 'playing',
      }

      // Add move to history
      gameState.moves.push(move)

      // Switch turn
      gameState.currentTurn = gameState.currentTurn === 1 ? 2 : 1

      // Update database
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          game_state: gameState,
          current_turn: gameState.currentTurn,
        })
        .eq('id', roomId)

      if (updateError) throw updateError

      // Broadcast to all players in the room
      io.to(roomId).emit('gameStateUpdate', gameState)
    } catch (error) {
      console.error('Error making move:', error)
      socket.emit('error', 'Failed to make move')
    }
  })

  // Game over (placeholder)
  socket.on('gameOver', async (roomId: string, winner: number | 'draw') => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          status: 'finished',
        })
        .eq('id', roomId)

      if (error) throw error

      io.to(roomId).emit('gameOver', winner)
    } catch (error) {
      console.error('Error ending game:', error)
    }
  })
}

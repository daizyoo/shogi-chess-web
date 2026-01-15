import { Server, Socket } from 'socket.io'
import supabase from '../db/supabase'

// インメモリストレージ（Supabaseが利用できない場合の代替）
const inMemoryRooms: any[] = []

export function handleRoomEvents(socket: Socket, io: Server) {
  // Get all rooms
  socket.on('getRooms', async () => {
    try {
      if (supabase) {
        const { data: rooms, error } = await supabase
          .from('rooms')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const formattedRooms = rooms?.map(room => ({
          ...room,
          createdAt: new Date(room.created_at),
        }))

        socket.emit('roomList', formattedRooms || [])
      } else {
        // インメモリモード
        socket.emit('roomList', inMemoryRooms)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      socket.emit('error', 'Failed to fetch rooms')
    }
  })

  // Create room
  socket.on('createRoom', async (roomData) => {
    try {
      if (supabase) {
        const { data: room, error } = await supabase
          .from('rooms')
          .insert([
            {
              name: roomData.name,
              board_type: roomData.boardType,
              custom_board_id: roomData.customBoardId,
              has_hand_pieces: roomData.hasHandPieces,
              player1_id: socket.id,
              status: 'waiting',
            },
          ])
          .select()
          .single()

        if (error) throw error

        socket.join(room.id)
        io.emit('roomList', await getAllRooms())
        socket.emit('roomJoined', {
          ...room,
          createdAt: new Date(room.created_at),
        })
      } else {
        // インメモリモード
        const room = {
          id: `room-${Date.now()}`,
          name: roomData.name,
          boardType: roomData.boardType,
          customBoardId: roomData.customBoardId,
          hasHandPieces: roomData.hasHandPieces,
          player1Id: socket.id,
          player2Id: null,
          status: 'waiting',
          createdAt: new Date(),
        }
        inMemoryRooms.push(room)
        socket.join(room.id)
        io.emit('roomList', inMemoryRooms)
        socket.emit('roomJoined', room)
      }
    } catch (error) {
      console.error('Error creating room:', error)
      socket.emit('error', 'Failed to create room')
    }
  })

  // Join room
  socket.on('joinRoom', async (roomId: string) => {
    try {
      if (supabase) {
        const { data: room, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single()

        if (error) throw error

        if (!room) {
          socket.emit('error', 'Room not found')
          return
        }

        if (room.status !== 'waiting') {
          socket.emit('error', 'Room is not available')
          return
        }

        const { data: updatedRoom, error: updateError } = await supabase
          .from('rooms')
          .update({
            player2_id: socket.id,
            status: 'playing',
          })
          .eq('id', roomId)
          .select()
          .single()

        if (updateError) throw updateError

        socket.join(roomId)
        io.to(roomId).emit('roomJoined', {
          ...updatedRoom,
          createdAt: new Date(updatedRoom.created_at),
        })
        io.to(roomId).emit('playerJoined', socket.id, 2)
        io.emit('roomList', await getAllRooms())
      } else {
        // インメモリモード
        const room = inMemoryRooms.find(r => r.id === roomId)
        if (!room) {
          socket.emit('error', 'Room not found')
          return
        }

        if (room.status !== 'waiting') {
          socket.emit('error', 'Room is not available')
          return
        }

        room.player2Id = socket.id
        room.status = 'playing'

        socket.join(roomId)
        io.to(roomId).emit('roomJoined', room)
        io.to(roomId).emit('playerJoined', socket.id, 2)
        io.emit('roomList', inMemoryRooms)
      }
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', 'Failed to join room')
    }
  })

  // Leave room
  socket.on('leaveRoom', async (roomId: string) => {
    try {
      socket.leave(roomId)

      if (supabase) {
        const { data: room } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single()

        if (!room) return

        if (room.player1_id === socket.id && !room.player2_id) {
          await supabase.from('rooms').delete().eq('id', roomId)
        } else {
          const update: any = {}
          if (room.player1_id === socket.id) {
            update.player1_id = room.player2_id
            update.player2_id = null
            update.status = 'waiting'
          } else if (room.player2_id === socket.id) {
            update.player2_id = null
            update.status = 'waiting'
          }

          await supabase.from('rooms').update(update).eq('id', roomId)
        }

        io.to(roomId).emit('playerLeft', socket.id)
        io.emit('roomList', await getAllRooms())
      } else {
        // インメモリモード
        const index = inMemoryRooms.findIndex(r => r.id === roomId)
        if (index === -1) return

        const room = inMemoryRooms[index]
        if (room.player1Id === socket.id && !room.player2Id) {
          inMemoryRooms.splice(index, 1)
        } else {
          if (room.player1Id === socket.id) {
            room.player1Id = room.player2Id
            room.player2Id = null
            room.status = 'waiting'
          } else if (room.player2Id === socket.id) {
            room.player2Id = null
            room.status = 'waiting'
          }
        }

        io.to(roomId).emit('playerLeft', socket.id)
        io.emit('roomList', inMemoryRooms)
      }
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  })
}

// Helper function
async function getAllRooms() {
  if (supabase) {
    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false })

    return rooms?.map(room => ({
      ...room,
      createdAt: new Date(room.created_at),
    })) || []
  } else {
    return inMemoryRooms
  }
}

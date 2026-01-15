'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      setIsConnected(false)
    })

    socketInstance.on('error', (error: string) => {
      console.error('Socket error:', error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const emit = useCallback(
    (event: string, ...args: any[]) => {
      if (socket) {
        socket.emit(event, ...args)
      }
    },
    [socket]
  )

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (socket) {
        socket.on(event, callback)
      }
    },
    [socket]
  )

  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      if (socket) {
        socket.off(event, callback)
      }
    },
    [socket]
  )

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
  }
}

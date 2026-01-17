import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { GameState } from '@/lib/types'

interface UseSupabaseRealtimeOptions {
  roomId: string
  onGameStateUpdate?: (gameState: GameState) => void
  onPlayerJoin?: (playerId: string) => void
  onPlayerLeave?: (playerId: string) => void
}

export function useSupabaseRealtime({
  roomId,
  onGameStateUpdate,
  onPlayerJoin,
  onPlayerLeave,
}: UseSupabaseRealtimeOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Use refs to avoid dependency issues
  const onGameStateUpdateRef = useRef(onGameStateUpdate)
  const onPlayerJoinRef = useRef(onPlayerJoin)
  const onPlayerLeaveRef = useRef(onPlayerLeave)

  // Update refs when callbacks change
  useEffect(() => {
    onGameStateUpdateRef.current = onGameStateUpdate
    onPlayerJoinRef.current = onPlayerJoin
    onPlayerLeaveRef.current = onPlayerLeave
  }, [onGameStateUpdate, onPlayerJoin, onPlayerLeave])

  useEffect(() => {
    if (!roomId) return

    // チャンネルに接続
    const roomChannel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true },
      },
    })

    // ゲーム状態の更新を購読
    roomChannel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_states',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          try {
            if (onGameStateUpdateRef.current && payload.new) {
              // roomsテーブルからcurrent_turnを取得
              const { data: room } = await supabase
                .from('rooms')
                .select('current_turn')
                .eq('id', roomId)
                .single() as any

              const gameState: GameState = {
                board: payload.new.board as any,
                hands: payload.new.hands as any,
                currentTurn: room?.current_turn || 1,
                moves: [],
                status: payload.new.status as any,
                winner: payload.new.winner as any,
              }
              onGameStateUpdateRef.current(gameState)
            }
          } catch (error: any) {
            // AbortErrorは無視
            if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
              return
            }
            console.error('Error in game state update:', error)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log('Rooms table UPDATE event received:', payload)
          // プレイヤーの参加/退出を検知
          if (payload.new && payload.old) {
            const newPlayer2 = payload.new.player2_id
            const oldPlayer2 = (payload.old as any).player2_id

            console.log('Player2 change detected:', { oldPlayer2, newPlayer2 })

            if (newPlayer2 && !oldPlayer2 && onPlayerJoinRef.current) {
              console.log('Calling onPlayerJoin callback')
              onPlayerJoinRef.current(newPlayer2 as string)
            } else if (!newPlayer2 && oldPlayer2 && onPlayerLeaveRef.current) {
              console.log('Calling onPlayerLeave callback')
              onPlayerLeaveRef.current(oldPlayer2 as string)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status, 'for room:', roomId)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          console.log('Successfully subscribed to room updates')
        } else if (status === 'CLOSED') {
          setIsConnected(false)
          console.log('Subscription closed')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred')
        }
      })

    setChannel(roomChannel)

    return () => {
      roomChannel.unsubscribe()
      setIsConnected(false)
    }
  }, [roomId]) // Only roomId as dependency

  const sendMove = useCallback(
    async (move: any) => {
      if (!channel) return

      // ブロードキャストで他のクライアントに通知
      await channel.send({
        type: 'broadcast',
        event: 'move',
        payload: move,
      })
    },
    [channel]
  )

  return {
    isConnected,
    sendMove,
  }
}

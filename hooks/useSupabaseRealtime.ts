import { useEffect, useState, useCallback } from 'react'
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
        (payload) => {
          if (onGameStateUpdate && payload.new) {
            const gameState: GameState = {
              board: payload.new.board as any,
              hands: payload.new.hands as any,
              currentTurn: 1, // TODO: 適切に設定
              moves: [],
              status: payload.new.status as any,
              winner: payload.new.winner as any,
            }
            onGameStateUpdate(gameState)
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
          // プレイヤーの参加/退出を検知
          if (payload.new && payload.old) {
            const newPlayer2 = payload.new.player2_id
            const oldPlayer2 = (payload.old as any).player2_id

            if (newPlayer2 && !oldPlayer2 && onPlayerJoin) {
              onPlayerJoin(newPlayer2 as string)
            } else if (!newPlayer2 && oldPlayer2 && onPlayerLeave) {
              onPlayerLeave(oldPlayer2 as string)
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    setChannel(roomChannel)

    return () => {
      roomChannel.unsubscribe()
      setIsConnected(false)
    }
  }, [roomId, onGameStateUpdate, onPlayerJoin, onPlayerLeave])

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

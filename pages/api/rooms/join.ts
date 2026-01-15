import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId, playerId } = req.body

    if (!roomId) {
      return res.status(400).json({ error: 'Missing roomId' })
    }

    // ルームを取得
    const { data: room, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single() as any

    if (fetchError || !room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // ルームが満員かチェック
    if (room.player1_id && room.player2_id) {
      return res.status(400).json({ error: 'Room is full' })
    }

    // プレイヤー2として参加
    const { data: updatedRoom, error: updateError } = await (supabase
      .from('rooms') as any)
      .update({
        player2_id: playerId || `player-${Date.now()}`,
        status: 'playing',
      })
      .eq('id', roomId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // ゲーム状態を開始
    await (supabase
      .from('game_states') as any)
      .update({ status: 'playing' })
      .eq('room_id', roomId)

    res.status(200).json({ room: updatedRoom })
  } catch (error: any) {
    console.error('Join room error:', error)
    res.status(500).json({ error: error.message })
  }
}

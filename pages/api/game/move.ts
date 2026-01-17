import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// サーバーサイドではService Roleキーを使用（RLSをバイパス）
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId, move, newBoard, newHands, winner } = req.body

    if (!roomId || !move) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // 手を記録
    await (supabase.from('moves') as any).insert({
      room_id: roomId,
      player: move.piece.player,
      from_row: move.from?.row ?? null,
      from_col: move.from?.col ?? null,
      to_row: move.to.row,
      to_col: move.to.col,
      piece_type: move.piece.type,
      promoted: move.promote || false,
      captured_piece: move.captured?.type ?? null,
    })

    // ゲーム状態を更新
    const updateData: any = {
      board: newBoard,
      hands: newHands,
    }

    if (winner) {
      updateData.status = 'finished'
      updateData.winner = winner
    }

    const { error } = await (supabase
      .from('game_states') as any)
      .update(updateData)
      .eq('room_id', roomId)

    if (error) {
      throw error
    }

    // ルームのターンを更新
    const { data: room } = await (supabase
      .from('rooms')
      .select('current_turn') as any)
      .eq('id', roomId)
      .single()

    if (room) {
      await (supabase
        .from('rooms') as any)
        .update({
          current_turn: room.current_turn === 1 ? 2 : 1,
          status: winner ? 'finished' : 'playing',
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', roomId)
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Move error:', error)
    res.status(500).json({ error: error.message })
  }
}

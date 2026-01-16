import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createInitialBoard, getBoardSize } from '@/lib/game/board'

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
    const { name, boardType, hasHandPieces, playerId } = req.body

    if (!name || !boardType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // ルームを作成
    const { data: room, error: roomError } = await (supabase
      .from('rooms') as any)
      .insert({
        name,
        board_type: boardType,
        has_hand_pieces: hasHandPieces ?? false,
        player1_id: playerId || null, // 作成者をplayer1に設定
        status: 'waiting',
        current_turn: 1,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (roomError) {
      throw roomError
    }

    // 初期ゲーム状態を作成
    const initialBoard = createInitialBoard(boardType as any)
    const { error: stateError } = await (supabase
      .from('game_states') as any)
      .insert({
        room_id: room.id,
        board: initialBoard as any,
        hands: { 1: {}, 2: {} } as any,
        status: 'waiting',
      })

    if (stateError) {
      throw stateError
    }

    res.status(200).json({ room })
  } catch (error: any) {
    console.error('Create room error:', error)
    res.status(500).json({ error: error.message })
  }
}

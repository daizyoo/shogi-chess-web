import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createInitialBoard, getBoardSize } from '@/lib/game/board'

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
    const { name, boardType, hasHandPieces, playerId, customData } = req.body

    if (!name || !boardType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // プレイヤーの設定を決定
    let p1Config = { isShogi: true, useHandPieces: true }
    let p2Config = { isShogi: true, useHandPieces: true }

    if (boardType === 'chess') {
      p1Config = { isShogi: false, useHandPieces: false }
      p2Config = { isShogi: false, useHandPieces: false }
    } else if (boardType === 'hybrid') {
      p1Config = { isShogi: true, useHandPieces: true }
      p2Config = { isShogi: false, useHandPieces: false }
    } else if (boardType === 'custom' && customData) {
      p1Config = customData.player1
      p2Config = customData.player2
    }

    // ルームを作成
    const { data: room, error: roomError } = await (supabase
      .from('rooms') as any)
      .insert({
        name,
        board_type: boardType,
        has_hand_pieces: hasHandPieces ?? (p1Config.useHandPieces || p2Config.useHandPieces),
        player1_id: playerId || null,
        status: 'waiting',
        current_turn: 1,
        last_activity_at: new Date().toISOString(),
        p1_config: p1Config,
        p2_config: p2Config,
      })
      .select()
      .single()

    if (roomError) {
      throw roomError
    }

    // 初期ゲーム状態を作成
    const initialBoard = createInitialBoard(boardType as any, customData)
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

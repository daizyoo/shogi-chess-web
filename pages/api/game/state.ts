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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId } = req.query

    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({ error: 'Missing roomId' })
    }

    // ゲーム状態を取得
    const { data: gameState, error } = await supabase
      .from('game_states')
      .select('*')
      .eq('room_id', roomId)
      .single()

    if (error) {
      throw error
    }

    res.status(200).json({ gameState })
  } catch (error: any) {
    console.error('Get state error:', error)
    res.status(500).json({ error: error.message })
  }
}

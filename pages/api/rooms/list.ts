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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 待機中または進行中のルームを取得
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    res.status(200).json({ rooms: rooms || [] })
  } catch (error: any) {
    console.error('List rooms error:', error)
    res.status(500).json({ error: error.message })
  }
}

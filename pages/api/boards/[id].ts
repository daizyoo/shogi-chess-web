import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Board ID is required' })
  }

  // 認証チェック
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    if (req.method === 'DELETE') {
      // 削除: 自分のボードのみ削除可能
      const { error } = await supabase
        .from('custom_boards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return res.status(200).json({ message: 'Board deleted successfully' })

    } else if (req.method === 'PATCH') {
      // 更新: is_public, board_data, nameを更新可能
      const { is_public, board_data, name } = req.body

      const updateData: any = {}
      if (typeof is_public === 'boolean') updateData.is_public = is_public
      if (board_data) updateData.board_data = board_data
      if (name) updateData.name = name

      const { data, error } = await supabase
        .from('custom_boards')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Board not found or unauthorized' })
      }

      return res.status(200).json({ message: 'Board updated successfully', data: data[0] })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Board operation error:', error)
    return res.status(500).json({ error: error.message })
  }
}

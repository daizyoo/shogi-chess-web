import type { NextApiRequest, NextApiResponse } from 'next'
import { cleanupInactiveRooms } from '@/lib/cleanup/cleanup-job'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 環境変数からタイムアウト時間を取得（デフォルト: 30分）
    const timeoutMinutes = parseInt(
      process.env.ROOM_TIMEOUT_MINUTES || '30',
      10
    )

    const deletedCount = await cleanupInactiveRooms(timeoutMinutes)

    res.status(200).json({
      success: true,
      deletedCount,
      timeoutMinutes,
      message: `${deletedCount} inactive rooms cleaned up`,
    })
  } catch (error: any) {
    console.error('Cleanup API error:', error)
    res.status(500).json({ error: error.message })
  }
}

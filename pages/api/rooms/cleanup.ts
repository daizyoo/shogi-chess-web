import type { NextApiRequest, NextApiResponse } from 'next'
import { cleanupInactiveRooms } from '@/lib/cleanup/cleanup-job'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GETのみ許可（Vercel CronはGETを使用）
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Vercel Cronからのリクエストを検証
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cleanup attempt')
      return res.status(401).json({ error: 'Unauthorized' })
    }
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

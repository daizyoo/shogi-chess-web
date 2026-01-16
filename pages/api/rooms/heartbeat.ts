import type { NextApiRequest, NextApiResponse } from 'next'
import { updateRoomActivity } from '@/lib/cleanup/cleanup-job'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId } = req.body

    if (!roomId) {
      return res.status(400).json({ error: 'Missing roomId' })
    }

    await updateRoomActivity(roomId)

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Heartbeat error:', error)
    res.status(500).json({ error: error.message })
  }
}

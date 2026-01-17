import { createClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/types'

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

/**
 * タイムアウトしたルームを検索して削除する
 * @param timeoutMinutes タイムアウト時間（分）
 * @returns 削除されたルーム数
 */
export async function cleanupInactiveRooms(timeoutMinutes: number = 30): Promise<number> {
  try {
    // タイムアウトしたルームを検索
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString()

    const { data: timedOutRooms, error: selectError } = await supabase
      .from('rooms')
      .select('id')
      .neq('status', 'finished')
      .lt('last_activity_at', cutoffTime)

    if (selectError) {
      console.error('Error finding timed out rooms:', selectError)
      return 0
    }

    if (!timedOutRooms || timedOutRooms.length === 0) {
      console.log('No timed out rooms found')
      return 0
    }

    const roomIds = (timedOutRooms as Array<{ id: string }>).map(room => room.id)

    // 関連データを削除
    // 1. 手の履歴を削除
    const { error: movesError } = await supabase
      .from('moves')
      .delete()
      .in('room_id', roomIds)

    if (movesError) {
      console.error('Error deleting moves:', movesError)
    }

    // 2. ゲーム状態を削除
    const { error: statesError } = await supabase
      .from('game_states')
      .delete()
      .in('room_id', roomIds)

    if (statesError) {
      console.error('Error deleting game states:', statesError)
    }

    // 3. ルームを削除
    const { error: roomsError } = await supabase
      .from('rooms')
      .delete()
      .in('id', roomIds)

    if (roomsError) {
      console.error('Error deleting rooms:', roomsError)
      return 0
    }

    console.log(`Cleaned up ${roomIds.length} inactive rooms`)
    return roomIds.length
  } catch (error) {
    console.error('Cleanup error:', error)
    return 0
  }
}

export async function updateRoomActivity(roomId: string): Promise<void> {
  try {
    await (supabase.from('rooms') as any)
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', roomId)
  } catch (error) {
    console.error('Error updating room activity:', error)
  }
}

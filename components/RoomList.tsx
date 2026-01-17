'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import BoardSelector from './BoardSelector'

interface Room {
  id: string
  name: string
  board_type: string
  has_hand_pieces: boolean
  player1_id: string | null
  player2_id: string | null
  status: string
  created_at: string
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRooms()

    // リアルタイム更新を購読
    const channel = supabase
      .channel('rooms-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          fetchRooms()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .in('status', ['waiting', 'playing'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const [isCreating, setIsCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [selectedBoardType, setSelectedBoardType] = useState('shogi')

  const createRoom = async (customData?: any) => {
    if (!newRoomName) {
      const name = prompt('ルーム名を入力してください')
      if (!name) return
      setNewRoomName(name)
    }

    try {
      let playerId = localStorage.getItem('playerId')
      if (!playerId) {
        playerId = `player-${Date.now()}-${Math.random().toString(36).substring(7)}`
        localStorage.setItem('playerId', playerId)
      }

      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName || '新しいルーム',
          boardType: customData ? 'custom' : selectedBoardType,
          playerId,
          customData,
        }),
      })

      const { room } = await response.json()
      if (room) {
        router.push(`/room/${room.id}`)
      }
    } catch (error) {
      console.error('Error creating room:', error)
      alert('ルームの作成に失敗しました')
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      })

      const { room } = await response.json()
      if (room) {
        router.push(`/room/${roomId}`)
      }
    } catch (error) {
      console.error('Error joining room:', error)
      alert('ルームへの参加に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="container text-center" style={{ paddingTop: '2rem' }}>
        <div className="pulse">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {isCreating ? (
        <div className="card mb-xl">
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
            ルーム作成
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ルーム名</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="input w-full"
                placeholder="対戦ルーム"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">盤の種類を選択</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                {['shogi', 'chess', 'hybrid'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedBoardType(type)}
                    className={`btn btn-sm ${selectedBoardType === type ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {type === 'shogi' ? '将棋' : type === 'chess' ? 'チェス' : 'ハイブリッド'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => createRoom()}
                  disabled={!newRoomName}
                >
                  標準の盤で作成
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsCreating(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-xl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)' }}>
              <p className="text-sm font-medium mb-2">または、カスタムボードを選択：</p>
              <BoardSelector onSelect={(data: any) => createRoom(data)} showTitle={false} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
            オンライン対戦ルーム
          </h2>
          <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
            新しいルームを作成
          </button>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
          <p className="text-muted">現在、利用可能なルームがありません</p>
          <p className="text-muted mt-sm">新しいルームを作成してください</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {rooms.map((room) => (
            <div key={room.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                    {room.name}
                  </h3>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {room.board_type === 'shogi' ? '将棋' : room.board_type === 'chess' ? 'チェス' : 'ハイブリッド'}
                    {room.has_hand_pieces && ' (持ち駒あり)'}
                  </p>
                  <p className="text-muted mt-xs" style={{ fontSize: 'var(--font-size-sm)' }}>
                    プレイヤー: {room.player2_id ? '2/2' : '1/2'}
                  </p>
                </div>
                <div>
                  {room.status === 'waiting' && !room.player2_id ? (
                    <button
                      className="btn btn-success"
                      onClick={() => joinRoom(room.id)}
                    >
                      参加する
                    </button>
                  ) : room.status === 'playing' ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => router.push(`/room/${room.id}`)}
                    >
                      観戦する
                    </button>
                  ) : (
                    <span className="text-muted">満員</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
      }
    </div >
  )
}

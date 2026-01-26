'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { getSupabaseClient } from '@/lib/supabase/client'
import { isCheckmate } from '@/lib/game/checkmate'
import Board from '@/components/Board'
import HandPieces from '@/components/HandPieces'
import type { GameState, Position } from '@/lib/types'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()

  if (!params) {
    return null
  }

  const roomId = params.id as string

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [roomInfo, setRoomInfo] = useState<any>(null)
  const [myPlayerId, setMyPlayerId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [roomDeleted, setRoomDeleted] = useState(false)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Memoize loadRoomData to prevent recreation on every render
  // Reload room data - use ref to prevent infinite loop
  const loadRoomDataRef = useRef<() => Promise<void>>()

  const loadRoomData = useCallback(async () => {
    try {
      const supabase = getSupabaseClient()
      // ルーム情報を取得
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single() as any

      if (!room) {
        setRoomDeleted(true) // Room not found
        return
      }

      setRoomInfo(room)

      // ゲーム状態を取得
      const { data: state } = await supabase
        .from('game_states')
        .select('*')
        .eq('room_id', roomId)
        .single() as any

      if (state) {
        setGameState({
          board: state.board as any,
          hands: state.hands as any,
          currentTurn: room.current_turn || 1,
          moves: [],
          status: state.status as any,
          winner: state.winner as any,
        })
      } else {
        // Game state not found, but room exists. This might be a new room.
        // Or if room was deleted, it would have been caught above.
        // For now, if state is null, we assume room is valid but game not started.
        // The initial state should be set by the room creation process.
        // If this happens, it's an inconsistency, so we might treat it as room deleted.
        setRoomDeleted(true)
      }
    } catch (error) {
      // Error loading room data, assume room is deleted or inaccessible
      setRoomDeleted(true)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  loadRoomDataRef.current = loadRoomData

  // Memoize callback to prevent re-subscriptions
  const handleGameStateUpdate = useCallback((newState: GameState) => {
    setGameState(newState)
  }, [])

  // Reload room data when a player joins
  const handlePlayerJoin = useCallback(() => {
    loadRoomDataRef.current?.()
  }, [])

  // Supabase Realtimeを使用
  const { isConnected } = useSupabaseRealtime({
    roomId,
    onGameStateUpdate: handleGameStateUpdate,
    onPlayerJoin: handlePlayerJoin,
  })

  useEffect(() => {
    if (!roomId) return

    // プレイヤーIDを生成または取得
    let playerId = localStorage.getItem('playerId')
    if (!playerId) {
      playerId = `player-${Date.now()}-${Math.random().toString(36).substring(7)}`
      localStorage.setItem('playerId', playerId)
    }
    setMyPlayerId(playerId)

    // 初期データを読み込み
    loadRoomDataRef.current?.()
  }, [roomId])

  // ハートビート機能：定期的にルームのアクティビティを更新
  useEffect(() => {
    if (!roomId) return

    // ハートビート間隔（秒）を環境変数から取得（デフォルト: 60秒）
    const intervalSeconds = parseInt(
      process.env.NEXT_PUBLIC_HEARTBEAT_INTERVAL_SECONDS || '60',
      10
    )

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/rooms/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId }),
        })
      } catch (error) {
        console.error('Heartbeat error:', error)
      }
    }

    // 初回ハートビート送信
    sendHeartbeat()

    // 定期的にハートビートを送信
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, intervalSeconds * 1000)

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
    }
  }, [roomId]) // roomInfoを依存配列から削除

  const handleMove = async (from: Position, to: Position) => {
    if (!gameState || !roomInfo) return

    const piece = gameState.board[from.row][from.col]
    if (!piece) return

    // 自分のターンかチェック
    const myPlayerNumber = roomInfo.player1_id === myPlayerId ? 1 : 2
    const myConfig = myPlayerNumber === 1 ? roomInfo.p1_config : roomInfo.p2_config
    const hasHandPieces = myConfig?.useHandPieces ?? roomInfo.has_hand_pieces

    if (gameState.currentTurn !== myPlayerNumber) {
      alert('あなたのターンではありません')
      return
    }

    // 盤面を更新
    const newBoard = gameState.board.map(row => [...row])
    const capturedPiece = newBoard[to.row][to.col]
    newBoard[to.row][to.col] = piece
    newBoard[from.row][from.col] = null

    const newHands = { ...gameState.hands }
    if (capturedPiece && hasHandPieces) {
      const handKey = capturedPiece.type
      if (!newHands[myPlayerNumber][handKey]) {
        newHands[myPlayerNumber][handKey] = 0
      }
      newHands[myPlayerNumber][handKey]++
    }

    // 詰みチェック
    const nextTurn = myPlayerNumber === 1 ? 2 : 1

    // キングを取った場合は即座にゲーム終了
    const isKingCaptured = capturedPiece && (capturedPiece.type === 'king' || capturedPiece.type === 'chess_king')

    // 詰み判定（キングを取っていない場合のみチェック）
    const isGameOver = isKingCaptured || isCheckmate(newBoard, nextTurn)

    // 楽観的UI更新：即座にローカル状態を更新
    const optimisticState: GameState = {
      board: newBoard,
      hands: newHands,
      currentTurn: nextTurn as 1 | 2,
      moves: [...gameState.moves, { from, to, piece, captured: capturedPiece || undefined }],
      status: isGameOver ? 'finished' : 'playing',
      winner: isGameOver ? (myPlayerNumber as 1 | 2) : undefined,
    }
    setGameState(optimisticState)

    // バックグラウンドでAPIリクエストを送信
    try {
      const response = await fetch('/api/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          move: { from, to, piece, captured: capturedPiece },
          newBoard,
          newHands,
          winner: isGameOver ? myPlayerNumber : null,
        }),
      })

      if (!response.ok) {
        // API失敗時は状態を元に戻す
        setGameState(gameState)
        throw new Error('Move API failed')
      }
    } catch (error) {
      console.error('Error making move:', error)
      // ルームが削除された可能性をチェック
      const supabase = getSupabaseClient()
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', roomId)
        .single() as any

      if (!room) {
        setRoomDeleted(true)
        alert('ルームが削除されました。トップページに戻ります。')
      } else {
        // API失敗時は元の状態に戻す
        setGameState(gameState)
        alert('手の送信に失敗しました')
      }
    }
  }

  if (loading) {
    return (
      <div className="container text-center" style={{ paddingTop: '2rem' }}>
        <div className="pulse">読み込み中...</div>
      </div>
    )
  }

  if (roomDeleted || (!loading && (!gameState || !roomInfo))) {
    return (
      <div className="container text-center" style={{ paddingTop: '2rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>⚠️ ルームが削除されました</h2>
        <p className="text-muted mb-lg">
          このルームは非アクティブのため削除されました。<br />
          新しいルームを作成するか、別のルームに参加してください。
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>
    )
  }

  const myPlayerNumber = roomInfo.player1_id === myPlayerId ? 1 : 2
  const isMyTurn = gameState?.currentTurn === myPlayerNumber

  const p1Config = roomInfo.p1_config || { useHandPieces: roomInfo.has_hand_pieces }
  const p2Config = roomInfo.p2_config || { useHandPieces: roomInfo.has_hand_pieces }

  if (!gameState) return null

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', textAlign: 'center', marginBottom: 'var(--spacing-sm)' }}>
        {roomInfo.name}
      </h1>

      <p className="text-center text-muted mb-lg">
        {isConnected ? '🟢 接続中' : '🔴 切断'}
      </p>

      <div style={{ display: 'flex', gap: 'var(--spacing-xl)', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {p2Config.useHandPieces && (
          <HandPieces
            hand={gameState.hands[2]}
            playerName={myPlayerNumber === 2 ? 'あなたの持ち駒' : '相手の持ち駒'}
          />
        )}

        <Board
          board={gameState.board}
          currentPlayer={gameState.currentTurn}
          onMove={isMyTurn ? handleMove : undefined}
          flipped={myPlayerNumber === 2}
        />

        {p1Config.useHandPieces && (
          <HandPieces
            hand={gameState.hands[1]}
            playerName={myPlayerNumber === 1 ? 'あなたの持ち駒' : '相手の持ち駒'}
          />
        )}
      </div>

      <div className="card text-center mt-lg">
        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
          {isMyTurn ? 'あなたのターンです' : '相手のターンを待っています...'}
        </p>
        <p className="text-muted mt-sm">手数: {gameState.moves.length}</p>
      </div>

      <div className="text-center mt-lg">
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>

      {/* ゲームオーバーダイアログ */}
      {gameState.status === 'finished' && gameState.winner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
        }}>
          <div className="card" style={{ padding: 'var(--spacing-2xl)', maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }}>
              🎉 ゲーム終了！
            </h2>
            <p style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>
              {gameState.winner === myPlayerNumber ? 'あなたの勝ちです！' : '相手の勝ちです'}
            </p>
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              トップに戻る
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

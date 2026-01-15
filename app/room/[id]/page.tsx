'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { supabase } from '@/lib/supabase/client'
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

  // Supabase Realtimeを使用
  const { isConnected } = useSupabaseRealtime({
    roomId,
    onGameStateUpdate: (newState) => {
      setGameState(newState)
    },
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
    loadRoomData()
  }, [roomId])

  const loadRoomData = async () => {
    try {
      // ルーム情報を取得
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single() as any

      if (room) {
        setRoomInfo(room)
      }

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
          currentTurn: room?.current_turn || 1,
          moves: [],
          status: state.status as any,
          winner: state.winner as any,
        })
      }
    } catch (error) {
      console.error('Error loading room:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMove = async (from: Position, to: Position) => {
    if (!gameState || !roomInfo) return

    const piece = gameState.board[from.row][from.col]
    if (!piece) return

    // 自分のターンかチェック
    const myPlayerNumber = roomInfo.player1_id === myPlayerId ? 1 : 2
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
    if (capturedPiece && roomInfo.has_hand_pieces) {
      const handKey = capturedPiece.type
      if (!newHands[myPlayerNumber][handKey]) {
        newHands[myPlayerNumber][handKey] = 0
      }
      newHands[myPlayerNumber][handKey]++
    }

    // 詰みチェック
    const nextTurn = myPlayerNumber === 1 ? 2 : 1
    const isGameOver = isCheckmate(newBoard, nextTurn)

    // APIで手を送信
    try {
      await fetch('/api/game/move', {
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

      // ローカル状態を更新
      setGameState({
        board: newBoard,
        hands: newHands,
        currentTurn: nextTurn,
        moves: [...gameState.moves, { from, to, piece, captured: capturedPiece || undefined }],
        status: isGameOver ? 'finished' : 'playing',
        winner: isGameOver ? myPlayerNumber : undefined,
      })
    } catch (error) {
      console.error('Error making move:', error)
      alert('手の送信に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="container text-center" style={{ paddingTop: '2rem' }}>
        <div className="pulse">読み込み中...</div>
      </div>
    )
  }

  if (!gameState || !roomInfo) {
    return (
      <div className="container text-center" style={{ paddingTop: '2rem' }}>
        <p>ルームが見つかりません</p>
        <button className="btn btn-secondary mt-md" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>
    )
  }

  const myPlayerNumber = roomInfo.player1_id === myPlayerId ? 1 : 2
  const isMyTurn = gameState.currentTurn === myPlayerNumber
  const hasHandPieces = roomInfo.has_hand_pieces

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', textAlign: 'center', marginBottom: 'var(--spacing-sm)' }}>
        {roomInfo.name}
      </h1>

      <p className="text-center text-muted mb-lg">
        {isConnected ? '🟢 接続中' : '🔴 切断'}
      </p>

      <div style={{ display: 'flex', gap: 'var(--spacing-xl)', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {hasHandPieces && (
          <HandPieces
            hand={gameState.hands[2]}
            playerName={myPlayerNumber === 2 ? 'あなたの持ち駒' : '相手の持ち駒'}
          />
        )}

        <Board
          board={gameState.board}
          currentPlayer={gameState.currentTurn}
          onMove={isMyTurn ? handleMove : undefined}
        />

        {hasHandPieces && (
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

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createInitialBoard, getBoardSize } from '@/lib/game/board'
import { getDropPositions, useHandPiece } from '@/lib/game/drops'
import { canPromoteOnMove, mustPromote } from '@/lib/game/promotion'
import { getBestMove } from '@/lib/ai/simpleAI'
import type { GameState, Position, Move, Player, BoardType, PieceType } from '@/lib/types'
import Board from '@/components/Board'
import HandPieces from '@/components/HandPieces'

export default function LocalGamePage() {
  const params = useParams()
  const router = useRouter()

  if (!params) {
    return null
  }

  const mode = params.mode as string
  const boardType = (params.boardType as BoardType) || 'shogi'
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [selectedHandPiece, setSelectedHandPiece] = useState<PieceType | null>(null)
  const [promotionDialog, setPromotionDialog] = useState<{
    from: Position
    to: Position
    piece: any
  } | null>(null)

  const hasHandPieces = boardType === 'shogi' || boardType === 'hybrid'

  // ゲーム初期化
  useEffect(() => {
    const initialBoard = createInitialBoard(boardType)
    setGameState({
      board: initialBoard,
      hands: { 1: {}, 2: {} },
      currentTurn: 1,
      moves: [],
      status: 'playing',
    })
  }, [boardType])

  // AI の手番処理
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') return

    if (mode === 'pva' && gameState.currentTurn === 2 && !isAIThinking) {
      setIsAIThinking(true)

      setTimeout(() => {
        const aiMove = getBestMove(gameState.board, 2, 'medium')

        if (aiMove && aiMove.from) {
          handleMove(aiMove.from, aiMove.to)
        }

        setIsAIThinking(false)
      }, 500)
    }
  }, [gameState, mode, isAIThinking])

  const executeMoveWithPromotion = (from: Position, to: Position, promote: boolean) => {
    if (!gameState) return

    const piece = gameState.board[from.row][from.col]
    if (!piece) return

    const newBoard = gameState.board.map((row) => [...row])
    const capturedPiece = newBoard[to.row][to.col]

    // 駒を移動（成る場合はpromoted = true）
    newBoard[to.row][to.col] = promote ? { ...piece, promoted: true } : piece
    newBoard[from.row][from.col] = null

    const newHands = { ...gameState.hands }
    if (capturedPiece && hasHandPieces) {
      // 成り駒は元の駒に戻す
      let handPieceType = capturedPiece.type
      if (capturedPiece.promoted) {
        handPieceType = capturedPiece.type
      }

      const handKey = handPieceType
      if (!newHands[gameState.currentTurn][handKey]) {
        newHands[gameState.currentTurn][handKey] = 0
      }
      newHands[gameState.currentTurn][handKey]++
    }

    const move: Move = {
      from,
      to,
      piece,
      captured: capturedPiece || undefined,
      promote,
    }

    const nextTurn: Player = gameState.currentTurn === 1 ? 2 : 1

    // 詰み判定
    const { isCheckmate } = require('@/lib/game/checkmate')
    const isGameOver = isCheckmate(newBoard, nextTurn)

    setGameState({
      board: newBoard,
      hands: newHands,
      currentTurn: nextTurn,
      moves: [...gameState.moves, move],
      status: isGameOver ? 'finished' : 'playing',
      winner: isGameOver ? gameState.currentTurn : undefined,
    })

    setSelectedHandPiece(null)
    setPromotionDialog(null)
  }

  const handleMove = (from: Position, to: Position) => {
    if (!gameState) return

    const piece = gameState.board[from.row][from.col]
    if (!piece) return

    // 成りが可能かチェック
    const boardSize = gameState.board.length
    const canPromoteMove = !piece.promoted && canPromoteOnMove(from, to, piece.player, piece.type, boardSize)
    const mustPromoteMove = !piece.promoted && mustPromote(to, piece.player, piece.type, boardSize)

    // 必ず成る場合
    if (mustPromoteMove) {
      executeMoveWithPromotion(from, to, true)
      return
    }

    // 成るか選択する場合
    if (canPromoteMove && hasHandPieces) {
      setPromotionDialog({
        from,
        to,
        piece,
      })
      return
    }

    // 通常の移動
    executeMoveWithPromotion(from, to, false)
  }

  const handleDrop = (row: number, col: number) => {
    if (!gameState || !selectedHandPiece) return

    const newBoard = gameState.board.map((r) => [...r])
    newBoard[row][col] = {
      type: selectedHandPiece,
      player: gameState.currentTurn,
    }

    const newHands = {
      ...gameState.hands,
      [gameState.currentTurn]: useHandPiece(
        gameState.hands[gameState.currentTurn],
        gameState.currentTurn,
        selectedHandPiece
      ),
    }

    const move: Move = {
      from: null,
      to: { row, col },
      piece: {
        type: selectedHandPiece,
        player: gameState.currentTurn,
      },
    }

    const nextTurn: Player = gameState.currentTurn === 1 ? 2 : 1

    setGameState({
      board: newBoard,
      hands: newHands,
      currentTurn: nextTurn,
      moves: [...gameState.moves, move],
      status: 'playing',
    })

    setSelectedHandPiece(null)
  }

  const handleSelectHandPiece = (pieceType: PieceType) => {
    if (!gameState) return
    setSelectedHandPiece(selectedHandPiece === pieceType ? null : pieceType)
  }

  if (!gameState) {
    return (
      <div className="container text-center" style={{ paddingTop: '2rem' }}>
        <div className="pulse">読み込み中...</div>
      </div>
    )
  }

  const boardSize = getBoardSize(boardType)
  const boardName =
    boardType === 'shogi' ? '将棋' : boardType === 'chess' ? 'チェス' : 'ハイブリッド'

  // 持ち駒配置可能位置を取得
  const dropPositions = selectedHandPiece
    ? getDropPositions(gameState.board, selectedHandPiece, gameState.currentTurn)
    : []

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1
        style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-sm)',
          textAlign: 'center',
        }}
      >
        {mode === 'pva' ? 'プレイヤー vs AI' : 'プレイヤー vs プレイヤー'}
      </h1>

      <p className="text-center text-muted mb-lg">
        {boardName} ({boardSize}x{boardSize})
      </p>



      {selectedHandPiece && (
        <div className="text-center mb-md">
          <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>
            持ち駒を選択中: {selectedHandPiece} （盤面をクリックして配置）
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-xl)',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {hasHandPieces && (
          <HandPieces
            hand={gameState.hands[2]}
            playerName={mode === 'pva' ? 'AI の持ち駒' : 'プレイヤー2 の持ち駒'}
            onSelectPiece={gameState.currentTurn === 2 ? handleSelectHandPiece : undefined}
            selectedPiece={gameState.currentTurn === 2 ? selectedHandPiece : null}
          />
        )}

        <Board
          board={gameState.board}
          currentPlayer={gameState.currentTurn}
          onMove={selectedHandPiece ? undefined : handleMove}
          onDrop={selectedHandPiece ? handleDrop : undefined}
          dropPositions={dropPositions}
        />

        {hasHandPieces && (
          <HandPieces
            hand={gameState.hands[1]}
            playerName="あなたの持ち駒"
            onSelectPiece={gameState.currentTurn === 1 ? handleSelectHandPiece : undefined}
            selectedPiece={gameState.currentTurn === 1 ? selectedHandPiece : null}
          />
        )}
      </div>

      <div className="card text-center mt-lg">
        {isAIThinking && (
          <div className="text-center mb-md">
            <span className="pulse" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              AIが考え中...
            </span>
          </div>
        )}
        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
          現在のターン:{' '}
          {gameState.currentTurn === 1 ? 'あなた' : mode === 'pva' ? 'AI' : 'プレイヤー2'}
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
        <div
          style={{
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
          }}
        >
          <div
            className="card"
            style={{
              padding: 'var(--spacing-2xl)',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'bold',
                marginBottom: 'var(--spacing-lg)',
                color: 'var(--color-primary)',
              }}
            >
              🎉 ゲーム終了！
            </h2>
            <p style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>
              {gameState.winner === 1
                ? 'あなたの勝ちです！'
                : mode === 'pva'
                  ? 'AIの勝ちです！'
                  : 'プレイヤー2の勝ちです！'}
            </p>
            <p className="text-muted mb-xl">手数: {gameState.moves.length}</p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.location.reload()
                }}
              >
                もう一度
              </button>
              <button className="btn btn-outline" onClick={() => router.push('/')}>
                トップに戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成り選択ダイアログ */}
      {promotionDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            executeMoveWithPromotion(promotionDialog.from, promotionDialog.to, false)
          }}
        >
          <div
            className="card"
            style={{
              padding: 'var(--spacing-xl)',
              maxWidth: '400px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>
              成りますか？
            </h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  executeMoveWithPromotion(promotionDialog.from, promotionDialog.to, true)
                }}
              >
                成る
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => {
                  executeMoveWithPromotion(promotionDialog.from, promotionDialog.to, false)
                }}
              >
                成らない
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

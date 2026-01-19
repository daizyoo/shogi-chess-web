'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createInitialBoard, getBoardSize } from '@/lib/game/board'
import { getDropPositions, useHandPiece } from '@/lib/game/drops'
import { isCheckmate } from '@/lib/game/checkmate'
import { canPromoteChess, canPromoteOnMove, mustPromote } from '@/lib/game/promotion'
import { getBestMove } from '@/lib/ai/simpleAI'
import type { GameState, Position, Move, Player, BoardType, PieceType } from '@/lib/types'
import Board from '@/components/Board'
import HandPieces from '@/components/HandPieces'
import PromotionModal from '@/components/PromotionModal'

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
    promotionType?: 'shogi' | 'chess' // 将棋かチェスか
    promotionPieceType?: PieceType // チェスの場合の選択した駒
  } | null>(null)

  const hasHandPieces = boardType === 'shogi'

  // ゲーム初期化
  useEffect(() => {
    if (boardType === 'custom') {
      const saved = localStorage.getItem('customBoard')
      if (saved) {
        try {
          const customData = JSON.parse(saved)
          const initialBoard = createInitialBoard('custom', customData)
          setGameState({
            board: initialBoard,
            hands: { 1: {}, 2: {} },
            currentTurn: 1,
            moves: [],
            status: 'playing',
            promotionZones: customData.promotionZones, // カスタムpromotion zones設定を追加
          })

          // カスタムボードの設定を反映
          // 注意: このコンポーネントの hasHandPieces は boardType に依存している
          // 暫定的に localStorage から情報を取得して上書きする
          return
        } catch (e) {
          console.error('Failed to parse custom board', e)
        }
      }
    }

    const initialBoard = createInitialBoard(boardType)
    setGameState({
      board: initialBoard,
      hands: { 1: {}, 2: {} },
      currentTurn: 1,
      moves: [],
      status: 'playing',
    })
  }, [boardType])

  // カスタム設定の取得
  const getCustomConfig = () => {
    if (boardType !== 'custom') return null
    const saved = localStorage.getItem('customBoard')
    if (saved) return JSON.parse(saved)
    return null
  }

  const customConfig = getCustomConfig()
  const p1Config = customConfig?.player1 || { isShogi: boardType !== 'chess', useHandPieces: boardType !== 'chess' }
  const p2Config = customConfig?.player2 || { isShogi: boardType !== 'chess', useHandPieces: boardType !== 'chess' }

  // hasHandPieces を各プレイヤーごとに考慮する必要があるが、現状のUIは共有
  const localHasHandPieces = boardType === 'custom'
    ? (p1Config.useHandPieces || p2Config.useHandPieces)
    : boardType === 'shogi'

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

  const executeMoveWithPromotion = (from: Position, to: Position, promote: boolean | PieceType) => {
    if (!gameState) return

    const piece = gameState.board[from.row][from.col]
    if (!piece) return

    const newBoard = gameState.board.map((row) => [...row])
    const capturedPiece = newBoard[to.row][to.col]

    // 駒を移動
    if (typeof promote === 'string') {
      // チェスプロモーション: 駒のtypeを変更
      newBoard[to.row][to.col] = { ...piece, type: promote as PieceType }
    } else if (promote === true) {
      // 将棋の成り: promotedフラグを設定
      newBoard[to.row][to.col] = { ...piece, promoted: true }
    } else {
      // 通常の移動
      newBoard[to.row][to.col] = piece
    }
    newBoard[from.row][from.col] = null

    const newHands = { ...gameState.hands }
    if (capturedPiece && localHasHandPieces) {
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
      promote: typeof promote === 'boolean' ? promote : true,
    }

    const nextTurn: Player = gameState.currentTurn === 1 ? 2 : 1

    // キングを取った場合は即座にゲーム終了
    const isKingCaptured = capturedPiece && (capturedPiece.type === 'king' || capturedPiece.type === 'chess_king')

    // 詰み判定（キングを取っていない場合のみチェック）
    const isGameOver = isKingCaptured || isCheckmate(newBoard, nextTurn)

    setGameState({
      board: newBoard,
      hands: newHands,
      currentTurn: nextTurn,
      moves: [...gameState.moves, move],
      status: isGameOver ? 'finished' : 'playing',
      winner: isGameOver ? gameState.currentTurn : undefined,
      promotionZones: gameState.promotionZones, // Preserve promotion zones
    })

    setSelectedHandPiece(null)
    setPromotionDialog(null)
  }

  const handleMove = (from: Position, to: Position) => {
    if (!gameState) return

    const piece = gameState.board[from.row][from.col]
    if (!piece) return

    const boardSize = gameState.board.length

    // チェスプロモーションチェック（チェス駒の場合）
    if (piece.type === 'chess_pawn') {
      const chessPromotionZone = piece.player === 1
        ? gameState.promotionZones?.player1.chess
        : gameState.promotionZones?.player2.chess

      console.log('Chess Promotion Debug:', {
        player: piece.player,
        fromRow: from.row,
        toRow: to.row,
        boardSize,
        promotionZone: chessPromotionZone,
        allPromotionZones: gameState.promotionZones
      })

      if (canPromoteChess(piece, to, chessPromotionZone, boardSize)) {
        setPromotionDialog({
          from,
          to,
          piece,
          promotionType: 'chess',
        })
        return
      }
    }

    // 将棋の成りチェック（将棋駒の場合）
    const shogiPieces: PieceType[] = ['pawn', 'lance', 'knight', 'silver', 'bishop', 'rook']
    if (shogiPieces.includes(piece.type)) {
      const shogiPromotionZone = piece.player === 1
        ? gameState.promotionZones?.player1.shogi
        : gameState.promotionZones?.player2.shogi
      const canPromoteMove = !piece.promoted && canPromoteOnMove(from, to, piece.player, piece.type, shogiPromotionZone, boardSize)
      const mustPromoteMove = !piece.promoted && mustPromote(to, piece.player, piece.type, boardSize)

      // 必ず成る場合
      if (mustPromoteMove) {
        executeMoveWithPromotion(from, to, true)
        return
      }

      // 成るか選択する場合
      if (canPromoteMove && localHasHandPieces) {
        setPromotionDialog({
          from,
          to,
          piece,
          promotionType: 'shogi',
        })
        return
      }
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
      promotionZones: gameState.promotionZones, // Preserve promotion zones
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

  const boardSize = getBoardSize(boardType, gameState?.board.length)
  const boardName =
    boardType === 'shogi' ? '将棋' : boardType === 'chess' ? 'チェス' : 'カスタム'

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
        {localHasHandPieces && (
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
          onPromotionSelect={(from, to, pieceType) => executeMoveWithPromotion(from, to, pieceType)}
        />

        {localHasHandPieces && (
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

      {/* プロモーションダイアログ */}
      {promotionDialog && promotionDialog.promotionType === 'chess' && (
        <PromotionModal
          player={promotionDialog.piece.player}
          onSelect={(pieceType) => {
            executeMoveWithPromotion(promotionDialog.from, promotionDialog.to, pieceType)
            setPromotionDialog(null)
          }}
        />
      )}

      {promotionDialog && promotionDialog.promotionType === 'shogi' && (
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
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              padding: 'var(--spacing-xl)',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
              成りますか？
            </h3>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => executeMoveWithPromotion(promotionDialog.from, promotionDialog.to, true)}
              >
                成る
              </button>
              <button
                className="btn btn-outline"
                onClick={() => executeMoveWithPromotion(promotionDialog.from, promotionDialog.to, false)}
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

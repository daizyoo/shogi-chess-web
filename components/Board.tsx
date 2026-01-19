'use client'

import { useState } from 'react'
import type { BoardState, Position, Piece as PieceType, PieceType as PieceTypeName, Player } from '@/lib/types'
import { getLegalMoves } from '@/lib/game/legalMoves'
import Piece from './Piece'
import PromotionModal from './PromotionModal'
import styles from '@/styles/board.module.css'

interface BoardProps {
  board: BoardState
  currentPlayer?: 1 | 2
  onMove?: (from: Position, to: Position) => void
  onDrop?: (row: number, col: number) => void
  dropPositions?: Position[]
  onPromotionSelect?: (from: Position, to: Position, pieceType: PieceTypeName) => void
  flipped?: boolean  // trueの場合、ボードを180度回転（Player 2用）
}

export default function Board({
  board,
  currentPlayer = 1,
  onMove,
  onDrop,
  dropPositions = [],
  onPromotionSelect,
  flipped = false
}: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null)
  const [highlightedSquares, setHighlightedSquares] = useState<Position[]>([])
  const [promotionState, setPromotionState] = useState<{
    from: Position
    to: Position
    player: Player
  } | null>(null)


  const boardSize = board.length
  const boardSizeClass = boardSize === 8 ? styles.board8x8 : styles.board9x9

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col]
    const clickedPos: Position = { row, col }

    // 持ち駒配置モード
    if (onDrop && dropPositions.length > 0) {
      const canDrop = dropPositions.some(pos => pos.row === row && pos.col === col)
      if (canDrop) {
        onDrop(row, col)
      }
      return
    }

    // 通常の移動モード
    // 既に駒を選択している場合
    if (selectedSquare) {
      // ハイライト されたマスをクリックした場合 = 移動
      const isHighlighted = highlightedSquares.some(
        (pos) => pos.row === row && pos.col === col
      )

      if (isHighlighted && onMove) {
        // 親コンポーネント（ゲームページ）で全てのpromotion判定を処理
        onMove(selectedSquare, clickedPos)
        setSelectedSquare(null)
        setHighlightedSquares([])
        return
      }

      // 自分の別の駒をクリックした場合 = 選択変更
      if (piece && piece.player === currentPlayer) {
        setSelectedSquare(clickedPos)
        const moves = getLegalMoves(board, clickedPos, piece)
        setHighlightedSquares(moves)
        return
      }

      // それ以外の場合（空マスや敵の駒）= 選択解除
      setSelectedSquare(null)
      setHighlightedSquares([])
    } else if (piece && piece.player === currentPlayer) {
      // 何も選択していない状態で自分の駒をクリック = 選択
      setSelectedSquare(clickedPos)
      const moves = getLegalMoves(board, clickedPos, piece)
      setHighlightedSquares(moves)
    }
  }

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col
  }

  const isSquareHighlighted = (row: number, col: number) => {
    return highlightedSquares.some((pos) => pos.row === row && pos.col === col)
  }

  const isSquareDroppable = (row: number, col: number) => {
    return dropPositions.some((pos) => pos.row === row && pos.col === col)
  }

  const handlePromotionSelect = (pieceType: PieceTypeName) => {
    if (promotionState) {
      if (onPromotionSelect) {
        // 親コンポーネントにプロモーション選択を通知
        onPromotionSelect(promotionState.from, promotionState.to, pieceType)
      } else if (onMove) {
        // フォールバック: 通常の移動として処理
        onMove(promotionState.from, promotionState.to)
      }
      setPromotionState(null)
    }
  }

  // ボードを反転させる場合の処理
  const displayBoard = flipped
    ? board.map(row => [...row].reverse()).reverse()
    : board

  // 座標変換関数
  const transformCoords = (row: number, col: number) => {
    if (flipped) {
      return {
        row: boardSize - 1 - row,
        col: boardSize - 1 - col
      }
    }
    return { row, col }
  }

  return (
    <>
      <div className={`${styles.board} ${boardSizeClass}`}>
        {displayBoard.map((rowPieces, displayRow) =>
          rowPieces.map((piece, displayCol) => {
            // 実際の座標に変換
            const { row: actualRow, col: actualCol } = transformCoords(displayRow, displayCol)

            const selected = isSquareSelected(actualRow, actualCol)
            const highlighted = isSquareHighlighted(actualRow, actualCol)
            const droppable = isSquareDroppable(actualRow, actualCol)

            // 敵駒がある場所かチェック
            const hasEnemyPiece = highlighted && piece && piece.player !== currentPlayer

            // 市松模様の色を決定
            const isDark = (displayRow + displayCol) % 2 === 1
            const squareColorClass = isDark ? styles.squareDark : styles.squareLight

            return (
              <div
                key={`${displayRow}-${displayCol}`}
                className={`${styles.square} ${squareColorClass} ${selected ? styles.squareSelected : ''
                  } ${hasEnemyPiece ? styles.squareCapture : highlighted ? styles.squareHighlight : ''} ${droppable ? styles.squareDroppable : ''
                  }`}
                onClick={() => handleSquareClick(actualRow, actualCol)}
              >
                {piece && <Piece piece={piece} flipped={flipped} />}
              </div>
            )
          })
        )}
      </div>

      {/* プロモーションモーダル */}
      {promotionState && (
        <PromotionModal
          player={promotionState.player}
          onSelect={handlePromotionSelect}
        />
      )}
    </>
  )
}

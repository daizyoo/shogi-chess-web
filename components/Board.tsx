'use client'

import { useState } from 'react'
import type { BoardState, Position, Piece as PieceType } from '@/lib/types'
import { getPossibleMoves } from '@/lib/game/board'
import Piece from './Piece'
import styles from '@/styles/board.module.css'

interface BoardProps {
  board: BoardState
  currentPlayer?: 1 | 2
  onMove?: (from: Position, to: Position) => void
  onDrop?: (row: number, col: number) => void
  dropPositions?: Position[]
}

export default function Board({
  board,
  currentPlayer = 1,
  onMove,
  onDrop,
  dropPositions = []
}: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null)
  const [highlightedSquares, setHighlightedSquares] = useState<Position[]>([])

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
        onMove(selectedSquare, clickedPos)
        setSelectedSquare(null)
        setHighlightedSquares([])
        return
      }

      // 自分の別の駒をクリックした場合 = 選択変更
      if (piece && piece.player === currentPlayer) {
        setSelectedSquare(clickedPos)
        const moves = getPossibleMoves(board, clickedPos, piece)
        setHighlightedSquares(moves)
        return
      }

      // それ以外の場合（空マスや敵の駒）= 選択解除
      setSelectedSquare(null)
      setHighlightedSquares([])
    } else if (piece && piece.player === currentPlayer) {
      // 何も選択していない状態で自分の駒をクリック = 選択
      setSelectedSquare(clickedPos)
      const moves = getPossibleMoves(board, clickedPos, piece)
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

  return (
    <div className={`${styles.board} ${boardSizeClass}`}>
      {board.map((rowPieces, rowIndex) =>
        rowPieces.map((piece, colIndex) => {
          const selected = isSquareSelected(rowIndex, colIndex)
          const highlighted = isSquareHighlighted(rowIndex, colIndex)
          const droppable = isSquareDroppable(rowIndex, colIndex)

          // 敵駒がある場所かチェック
          const hasEnemyPiece = highlighted && piece && piece.player !== currentPlayer

          // 市松模様の色を決定
          const isDark = (rowIndex + colIndex) % 2 === 1
          const squareColorClass = isDark ? styles.squareDark : styles.squareLight

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${styles.square} ${squareColorClass} ${selected ? styles.squareSelected : ''
                } ${hasEnemyPiece ? styles.squareCapture : highlighted ? styles.squareHighlight : ''} ${droppable ? styles.squareDroppable : ''
                }`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && <Piece piece={piece} />}
            </div>
          )
        })
      )}
    </div>
  )
}

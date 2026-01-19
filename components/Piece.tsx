'use client'

import { getPieceName } from '@/lib/game/board'
import type { Piece } from '@/lib/types'
import styles from '@/styles/pieces.module.css'

interface PieceComponentProps {
  piece: Piece
  flipped?: boolean
}

export default function PieceComponent({ piece, flipped = false }: PieceComponentProps) {
  const pieceName = getPieceName(piece.type, piece.promoted)
  // ボードが反転している場合、Player 2の駒は通常表示、Player 1の駒を回転
  // ボードが通常の場合、Player 2の駒を回転、Player 1の駒は通常表示
  const shouldRotate = flipped ? piece.player === 1 : piece.player === 2

  // 全ての成り駒は赤色で表示
  const isPromoted = piece.promoted

  return (
    <div className={`${styles.piece} ${shouldRotate ? styles.pieceRotated : ''}`}>
      <span
        className={styles.pieceText}
        style={isPromoted ? { color: '#d32f2f' } : undefined}
      >
        {pieceName}
      </span>
    </div>
  )
}

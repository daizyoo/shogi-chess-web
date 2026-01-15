'use client'

import { getPieceName } from '@/lib/game/board'
import type { Piece } from '@/lib/types'
import styles from '@/styles/pieces.module.css'

interface PieceComponentProps {
  piece: Piece
}

export default function PieceComponent({ piece }: PieceComponentProps) {
  const pieceName = getPieceName(piece.type, piece.promoted)
  const isPlayer2 = piece.player === 2

  return (
    <div className={`${styles.piece} ${isPlayer2 ? styles.pieceRotated : ''}`}>
      <span className={styles.pieceText}>{pieceName}</span>
    </div>
  )
}

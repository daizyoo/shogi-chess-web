'use client'

import { getPieceName } from '@/lib/game/board'
import type { HandPieces, PieceType } from '@/lib/types'
import styles from '@/styles/hand.module.css'

interface HandPiecesProps {
  hand: HandPieces
  playerName?: string
  onSelectPiece?: (pieceType: PieceType) => void
  selectedPiece?: PieceType | null
}

export default function HandPiecesComponent({
  hand,
  playerName = '持ち駒',
  onSelectPiece,
  selectedPiece
}: HandPiecesProps) {
  const pieces = Object.entries(hand || {}).filter(([_, count]) => count > 0)

  if (pieces.length === 0) {
    return (
      <div className={styles.handContainer}>
        <h3 className={styles.handTitle}>{playerName}</h3>
        <div className={styles.emptyHand}>
          <span className="text-muted">持ち駒なし</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.handContainer}>
      <h3 className={styles.handTitle}>{playerName}</h3>
      <div className={styles.handPieces}>
        {pieces.map(([type, count]) => {
          const isSelected = selectedPiece === type
          const isClickable = onSelectPiece !== undefined

          return (
            <div
              key={type}
              className={`${styles.handPiece} ${isSelected ? styles.handPieceSelected : ''} ${isClickable ? styles.handPieceClickable : ''
                }`}
              onClick={() => onSelectPiece && onSelectPiece(type as PieceType)}
            >
              <span className={styles.pieceName}>{getPieceName(type as PieceType)}</span>
              {count > 1 && <span className={styles.pieceCount}>×{count}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

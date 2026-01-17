'use client'

import { PieceType, Player } from '@/lib/types'
import styles from '@/styles/promotion.module.css'

interface PromotionModalProps {
  player: Player
  onSelect: (pieceType: PieceType) => void
}

export default function PromotionModal({ player, onSelect }: PromotionModalProps) {
  const promotionOptions: { type: PieceType; label: string; symbol: string }[] = [
    { type: 'chess_queen', label: 'Queen', symbol: player === 1 ? '♕' : '♛' },
    { type: 'chess_rook', label: 'Rook', symbol: player === 1 ? '♖' : '♜' },
    { type: 'chess_bishop', label: 'Bishop', symbol: player === 1 ? '♗' : '♝' },
    { type: 'chess_knight', label: 'Knight', symbol: player === 1 ? '♘' : '♞' },
  ]

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>プロモーション</h2>
        <p className={styles.subtitle}>成る駒を選択してください</p>
        <div className={styles.options}>
          {promotionOptions.map((option) => (
            <button
              key={option.type}
              className={styles.optionButton}
              onClick={() => onSelect(option.type)}
              aria-label={`${option.label}に成る`}
            >
              <span className={styles.pieceSymbol}>{option.symbol}</span>
              <span className={styles.pieceLabel}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

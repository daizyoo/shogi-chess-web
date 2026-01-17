'use client'

import { useState } from 'react'
import type { PieceSymbol } from '@/lib/board/types'
import { PIECE_NAMES, SHOGI_PIECES, CHESS_PIECES } from '@/lib/board/types'

interface BoardEditorProps {
  board: string[]
  onChange: (newBoard: string[]) => void
  player1IsShogi: boolean
  player2IsShogi: boolean
}

export default function BoardEditor({ board, onChange, player1IsShogi, player2IsShogi }: BoardEditorProps) {
  const [selectedPiece, setSelectedPiece] = useState<PieceSymbol | null>(null)
  const [isEraser, setIsEraser] = useState(false)

  const handleCellClick = (row: number, col: number) => {
    const newBoard = [...board]
    const cells = newBoard[row].split(/\s+/)

    if (isEraser) {
      cells[col] = '.'
    } else if (selectedPiece) {
      cells[col] = selectedPiece
    }

    newBoard[row] = cells.join(' ')
    onChange(newBoard)
  }

  const getCellPiece = (row: number, col: number): string => {
    return board[row]?.split(/\s+/)[col] || '.'
  }

  const getPieceDisplay = (piece: string): string => {
    if (piece === '.') return ''
    const upper = piece.toUpperCase()
    return PIECE_NAMES[upper] || piece
  }

  const isPlayer1Piece = (piece: string): boolean => {
    return piece !== '.' && piece === piece.toUpperCase()
  }

  const cols = board[0]?.split(/\s+/).length || 8
  const rows = board.length

  return (
    <div>
      {/* Piece Palette */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Piece Palette</h3>

        {/* Player 1 Pieces */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
            Player 1 (先手 / Upper case)
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
            {(player1IsShogi ? SHOGI_PIECES : CHESS_PIECES).map((piece) => (
              <button
                key={piece}
                onClick={() => {
                  setSelectedPiece(piece)
                  setIsEraser(false)
                }}
                className={`btn btn-sm ${selectedPiece === piece ? 'btn-primary' : 'btn-secondary'}`}
                style={{ minWidth: '50px' }}
              >
                {getPieceDisplay(piece)} {piece}
              </button>
            ))}
          </div>
        </div>

        {/* Player 2 Pieces */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
            Player 2 (後手 / Lower case)
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
            {(player2IsShogi ? SHOGI_PIECES : CHESS_PIECES).map((piece) => {
              const lowerPiece = piece.toLowerCase() as PieceSymbol
              return (
                <button
                  key={lowerPiece}
                  onClick={() => {
                    setSelectedPiece(lowerPiece)
                    setIsEraser(false)
                  }}
                  className={`btn btn-sm ${selectedPiece === lowerPiece ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: '50px' }}
                >
                  {getPieceDisplay(lowerPiece)} {lowerPiece}
                </button>
              )
            })}
          </div>
        </div>

        {/* Eraser */}
        <button
          onClick={() => {
            setIsEraser(true)
            setSelectedPiece(null)
          }}
          className={`btn btn-sm ${isEraser ? 'btn-primary' : 'btn-secondary'}`}
        >
          🗑️ Eraser
        </button>
      </div>

      {/* Board - Game Style */}
      <div style={{
        display: 'inline-block',
        position: 'relative',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 60px)`,
          gridTemplateRows: `repeat(${rows}, 60px)`,
          gap: '0',
          border: '3px solid #333',
          backgroundColor: '#f5deb3',
        }}>
          {Array.from({ length: rows }).map((_, row) => (
            Array.from({ length: cols }).map((_, col) => {
              const piece = getCellPiece(row, col)
              const isEmpty = piece === '.'
              const isPlayer1 = isPlayer1Piece(piece)

              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: '1px solid #999',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: isEmpty ? 'transparent' : isPlayer1 ? '#000' : '#c00',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {getPieceDisplay(piece)}
                </button>
              )
            })
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '14px', color: 'var(--text-muted)' }}>
        <p>1. Select a piece from the palette above</p>
        <p>2. Click on a cell to place the piece</p>
        <p>3. Use the eraser to remove pieces</p>
      </div>
    </div>
  )
}

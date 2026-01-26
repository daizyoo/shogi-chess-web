'use client'

import { useState } from 'react'
import type { PieceSymbol } from '@/lib/board/types'
import { PIECE_NAMES, SHOGI_PIECES, CHESS_PIECES } from '@/lib/board/types'

interface BoardEditorProps {
  board: string[]
  onChange: (newBoard: string[]) => void
  pawnInitialPositions?: Set<string>  // Set of "row-col" keys for pawns at initial positions
  onPawnInitialPositionsChange?: (positions: Set<string>) => void
}

type PieceMode = 'shogi' | 'chess' | 'both'

export default function BoardEditor({ board, onChange, pawnInitialPositions, onPawnInitialPositionsChange }: BoardEditorProps) {
  const [selectedPiece, setSelectedPiece] = useState<PieceSymbol | null>(null)
  const [isEraser, setIsEraser] = useState(false)
  const [pieceMode, setPieceMode] = useState<PieceMode>('both')

  // Local pawn initial positions if not provided from parent
  const [localPawnPositions, setLocalPawnPositions] = useState<Set<string>>(new Set())
  const effectivePawnPositions = pawnInitialPositions || localPawnPositions
  const setPawnPositions = onPawnInitialPositionsChange || setLocalPawnPositions

  // 王/Kingの数をカウント
  const countKings = (currentBoard: string[]): { p1Kings: number, p2Kings: number } => {
    let p1Kings = 0
    let p2Kings = 0

    currentBoard.forEach(row => {
      const cells = row.split(/\s+/)
      cells.forEach(cell => {
        if (cell === 'K' || cell === 'CK') p1Kings++
        if (cell === 'k' || cell === 'ck') p2Kings++
      })
    })

    return { p1Kings, p2Kings }
  }

  const handleCellClick = (row: number, col: number) => {
    const newBoard = [...board]
    const cells = newBoard[row].split(/\s+/)
    const currentPiece = cells[col]
    const posKey = `${row}-${col}`

    // チェスポーン（CP/cp）をクリックした場合のトグル処理
    // 1. 何も選択していない状態でポーンをクリック
    // 2. ポーンを選択中に、同じプレイヤーのポーンをクリック
    const isCurrentChessPawn = currentPiece === 'CP' || currentPiece === 'cp'
    const isSelectedChessPawn = selectedPiece === 'CP' || selectedPiece === 'cp'

    if (isCurrentChessPawn && (!selectedPiece || isSelectedChessPawn)) {
      const newPawnPositions = new Set(effectivePawnPositions)
      if (newPawnPositions.has(posKey)) {
        // 初期位置マーカーを解除
        newPawnPositions.delete(posKey)
      } else {
        // 初期位置マーカーを追加
        newPawnPositions.add(posKey)
      }
      setPawnPositions(newPawnPositions)
      return // トグルのみで終了
    }

    if (isEraser) {
      cells[col] = '.'
      // 消去時は初期位置マーカーも削除
      const newPawnPositions = new Set(effectivePawnPositions)
      newPawnPositions.delete(posKey)
      setPawnPositions(newPawnPositions)
    } else if (selectedPiece) {
      // 王/Kingの配置制限チェック
      if (selectedPiece === 'K' || selectedPiece === 'CK' ||
        selectedPiece === 'k' || selectedPiece === 'ck') {

        // 現在のマスの駒を除いたボードで既存のking数をカウント
        const tempBoard = newBoard.map((r, i) => {
          if (i === row) {
            const tempCells = r.split(/\s+/)
            tempCells[col] = '.'
            return tempCells.join(' ')
          }
          return r
        })

        const { p1Kings, p2Kings } = countKings(tempBoard)

        // Player 1の王/King
        if (selectedPiece === 'K' || selectedPiece === 'CK') {
          if (p1Kings > 0) return
        }

        // Player 2の王/King  
        if (selectedPiece === 'k' || selectedPiece === 'ck') {
          if (p2Kings > 0) return
        }
      }

      cells[col] = selectedPiece

      // チェスポーンを新しく配置する場合、デフォルトで初期位置としてマーク
      if (selectedPiece === 'CP' || selectedPiece === 'cp') {
        const newPawnPositions = new Set(effectivePawnPositions)
        newPawnPositions.add(posKey)
        setPawnPositions(newPawnPositions)
      } else {
        // 他の駒を配置する場合は初期位置マーカーを削除
        const newPawnPositions = new Set(effectivePawnPositions)
        newPawnPositions.delete(posKey)
        setPawnPositions(newPawnPositions)
      }
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

  // 駒タイプフィルタリング
  const getFilteredPieces = (pieces: readonly PieceSymbol[], type: 'shogi' | 'chess') => {
    if (pieceMode === 'both') return pieces
    if (pieceMode === type) return pieces
    return []
  }

  return (
    <div>
      {/* Piece Mode Selector */}
      <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
          駒タイプ選択:
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            onClick={() => setPieceMode('shogi')}
            className={`btn btn-sm ${pieceMode === 'shogi' ? 'btn-primary' : 'btn-outline'}`}
          >
            将棋のみ
          </button>
          <button
            onClick={() => setPieceMode('chess')}
            className={`btn btn-sm ${pieceMode === 'chess' ? 'btn-primary' : 'btn-outline'}`}
          >
            チェスのみ
          </button>
          <button
            onClick={() => setPieceMode('both')}
            className={`btn btn-sm ${pieceMode === 'both' ? 'btn-primary' : 'btn-outline'}`}
          >
            両方
          </button>
        </div>
      </div>

      {/* Piece Palette */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Piece Palette</h3>

        {/* Player 1 Pieces */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
            Player 1 (先手 / Upper case)
          </div>

          {/* Shogi Pieces */}
          <div style={{ marginBottom: 'var(--spacing-xs)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>将棋駒</div>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
              {getFilteredPieces(SHOGI_PIECES, 'shogi').map((piece) => (
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

          {/* Chess Pieces */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>チェス駒</div>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
              {getFilteredPieces(CHESS_PIECES, 'chess').map((piece) => (
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
        </div>

        {/* Player 2 Pieces */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
            Player 2 (後手 / Lower case)
          </div>

          {/* Shogi Pieces */}
          <div style={{ marginBottom: 'var(--spacing-xs)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>将棋駒</div>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
              {getFilteredPieces(SHOGI_PIECES, 'shogi').map((piece) => {
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

          {/* Chess Pieces */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>チェス駒</div>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
              {getFilteredPieces(CHESS_PIECES, 'chess').map((piece) => {
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
              const posKey = `${row}-${col}`
              const isInitialPawn = effectivePawnPositions.has(posKey) && (piece === 'CP' || piece === 'cp')

              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: '1px solid #999',
                    backgroundColor: isInitialPawn ? '#e3f2fd' : 'transparent',  // 初期位置ポーンは青色
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
                    if (!isInitialPawn) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isInitialPawn ? '#e3f2fd' : 'transparent'
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

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { CustomBoardData } from '@/lib/board/types'

interface CustomBoard {
  id: string
  name: string
  user_display_name: string
  board_data: any
}

interface BoardSelectorProps {
  onSelect: (data: CustomBoardData) => void
  showTitle?: boolean
}

export default function BoardSelector({ onSelect, showTitle = true }: BoardSelectorProps) {
  const [boards, setBoards] = useState<CustomBoard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicBoards()
  }, [])

  const fetchPublicBoards = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('custom_boards')
        .select('id, name, user_display_name, board_data')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBoards(data || [])
    } catch (err) {
      console.error('Error fetching public boards:', err)
    } finally {
      setLoading(false)
    }
  }

  const getBoardSize = (board: string[]) => {
    return `${board.length}x${board[0]?.split(' ').filter(s => s).length || board.length}`
  }

  const getPlayerInfo = (config: any) => {
    const pieceType = config.isShogi !== false ? '将棋駒' : 'チェス駒'
    const handPieces = config.useHandPieces ? '🎴 持ち駒あり' : '❌ 持ち駒なし'
    return { pieceType, handPieces }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="pulse" style={{ color: 'var(--color-muted)' }}>読み込み中...</div>
      </div>
    )
  }

  if (boards.length === 0) {
    return (
      <div className="card text-center py-6" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <p style={{ color: 'var(--color-muted)' }}>公開されているボードはありません</p>
      </div>
    )
  }

  return (
    <div>
      {showTitle && (
        <h3
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--color-text)',
          }}
        >
          公開されたカスタムボード
        </h3>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-md)',
          maxHeight: '500px',
          overflowY: 'auto',
          paddingRight: 'var(--spacing-sm)',
        }}
      >
        {boards.map((board) => {
          const boardData = board.board_data as CustomBoardData
          const size = getBoardSize(boardData.board)
          const p1 = getPlayerInfo(boardData.player1)
          const p2 = getPlayerInfo(boardData.player2)

          return (
            <button
              key={board.id}
              onClick={() => onSelect(boardData)}
              className="card"
              style={{
                padding: 'var(--spacing-md)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                border: '2px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
            >
              {/* ボード名 */}
              <h4
                style={{
                  fontSize: 'var(--font-size-md)',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-primary)',
                }}
              >
                {board.name}
              </h4>

              {/* 作者 */}
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-muted)',
                  marginBottom: 'var(--spacing-md)',
                }}
              >
                作者: {board.user_display_name}
              </p>

              {/* 説明 */}
              {boardData.description && (
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text)',
                    marginBottom: 'var(--spacing-md)',
                    fontStyle: 'italic',
                  }}
                >
                  {boardData.description}
                </p>
              )}

              {/* ルール情報 */}
              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 'var(--spacing-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-xs)',
                }}
              >
                {/* 盤面サイズ */}
                <div style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <span>📐</span>
                  <span style={{ fontWeight: '500' }}>{size}盤</span>
                </div>

                {/* プレイヤー1 */}
                <div style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <span>👤</span>
                  <span>P1: {p1.pieceType} {p1.handPieces}</span>
                </div>

                {/* プレイヤー2 */}
                <div style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <span>👤</span>
                  <span>P2: {p2.pieceType} {p2.handPieces}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

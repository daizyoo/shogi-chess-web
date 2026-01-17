'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BoardEditor from '@/components/BoardEditor'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import type { CustomBoardData, PieceSymbol } from '@/lib/board/types'
import {
  DEFAULT_CHESS_BOARD,
  DEFAULT_SHOGI_BOARD,
  EMPTY_8x8_BOARD,
  EMPTY_9x9_BOARD
} from '@/lib/board/types'

export default function BoardEditorPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [boardName, setBoardName] = useState('Custom Board')
  const [boardSize, setBoardSize] = useState<8 | 9>(9)
  const [board, setBoard] = useState<string[]>(EMPTY_9x9_BOARD)
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  const [player1Config, setPlayer1Config] = useState({
    isShogi: true,
    useHandPieces: true,
  })
  const [player2Config, setPlayer2Config] = useState({
    isShogi: true,
    useHandPieces: true,
  })

  const loadTemplate = (template: 'chess' | 'shogi' | 'empty') => {
    switch (template) {
      case 'chess':
        setBoardSize(8)
        setBoard(DEFAULT_CHESS_BOARD)
        setPlayer1Config({ isShogi: false, useHandPieces: false })
        setPlayer2Config({ isShogi: false, useHandPieces: false })
        break
      case 'shogi':
        setBoardSize(9)
        setBoard(DEFAULT_SHOGI_BOARD)
        setPlayer1Config({ isShogi: true, useHandPieces: true })
        setPlayer2Config({ isShogi: true, useHandPieces: true })
        break
      case 'empty':
        setBoard(boardSize === 8 ? EMPTY_8x8_BOARD : EMPTY_9x9_BOARD)
        break
    }
  }

  const handleExportJSON = () => {
    const data: CustomBoardData = {
      name: boardName,
      board,
      player1: player1Config,
      player2: player2Config,
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${boardName.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveToDB = async () => {
    if (!user) {
      alert('保存するにはログインが必要です。')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await (supabase
        .from('custom_boards') as any)
        .insert({
          user_id: user.id,
          name: boardName,
          board_data: {
            board,
            player1: player1Config,
            player2: player2Config,
          },
          is_public: isPublic,
          user_display_name: profile?.display_name || user.email,
        })
        .select()

      if (error) throw error
      alert('ボードを保存しました！')
    } catch (error: any) {
      alert(`保存に失敗しました: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data: CustomBoardData = JSON.parse(event.target?.result as string)
        setBoardName(data.name)
        setBoard(data.board)
        setPlayer1Config(data.player1)
        setPlayer2Config(data.player2)
        setBoardSize(data.board[0].split(/\s+/).length as 8 | 9)
      } catch (error) {
        alert('Failed to import JSON file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
        Custom Board Editor
      </h1>

      {/* Controls */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            Board Name:
          </label>
          <input
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="input"
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            Board Size:
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              className={`btn ${boardSize === 8 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setBoardSize(8)
                setBoard(EMPTY_8x8_BOARD)
              }}
            >
              8×8 (Chess)
            </button>
            <button
              className={`btn ${boardSize === 9 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setBoardSize(9)
                setBoard(EMPTY_9x9_BOARD)
              }}
            >
              9×9 (Shogi)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => loadTemplate('shogi')}>
            Load Shogi Template
          </button>
          <button className="btn btn-secondary" onClick={() => loadTemplate('chess')}>
            Load Chess Template
          </button>
          <button className="btn btn-secondary" onClick={() => loadTemplate('empty')}>
            Clear Board
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          {user ? (
            <>
              <button
                className="btn btn-primary"
                onClick={handleSaveToDB}
                disabled={saving}
              >
                {saving ? '保存中...' : 'クラウドに保存'}
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="text-sm">公開する</span>
              </label>
            </>
          ) : (
            <p className="text-sm text-muted">※ ログインするとボードをクラウドに保存・公開できます</p>
          )}

          <div style={{ borderLeft: '1px solid var(--border)', height: '20px', margin: '0 10px' }} />

          <button className="btn btn-outline" onClick={handleExportJSON}>
            Export JSON
          </button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Player Config */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Player 1 (Upper case)</h3>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
            <input
              type="checkbox"
              checked={player1Config.isShogi}
              onChange={(e) => setPlayer1Config({ ...player1Config, isShogi: e.target.checked })}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            Shogi pieces
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={player1Config.useHandPieces}
              onChange={(e) => setPlayer1Config({ ...player1Config, useHandPieces: e.target.checked })}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            Use hand pieces
          </label>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Player 2 (Lower case)</h3>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
            <input
              type="checkbox"
              checked={player2Config.isShogi}
              onChange={(e) => setPlayer2Config({ ...player2Config, isShogi: e.target.checked })}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            Shogi pieces
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={player2Config.useHandPieces}
              onChange={(e) => setPlayer2Config({ ...player2Config, useHandPieces: e.target.checked })}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            Use hand pieces
          </label>
        </div>
      </div>

      {/* Interactive Board Editor */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Board Editor</h3>
        <BoardEditor
          board={board}
          onChange={setBoard}
          player1IsShogi={player1Config.isShogi}
          player2IsShogi={player2Config.isShogi}
        />
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    </main>
  )
}

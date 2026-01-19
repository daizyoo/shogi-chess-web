'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BoardEditor from '@/components/BoardEditor'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import type { CustomBoardData, PieceSymbol, PromotionZoneConfig, PieceTypePromotionZones } from '@/lib/board/types'
import {
  DEFAULT_CHESS_BOARD,
  DEFAULT_SHOGI_BOARD,
  EMPTY_8x8_BOARD,
  EMPTY_9x9_BOARD
} from '@/lib/board/types'

function BoardEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const [boardId, setBoardId] = useState<string | null>(null)
  const [boardName, setBoardName] = useState('Custom Board')
  const [boardDescription, setBoardDescription] = useState('')
  const [boardSize, setBoardSize] = useState<8 | 9>(9)
  const [board, setBoard] = useState<string[]>(EMPTY_9x9_BOARD)
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const [player1Config, setPlayer1Config] = useState({
    useHandPieces: true,
  })
  const [player2Config, setPlayer2Config] = useState({
    useHandPieces: true,
  })

  const [player1PromotionZones, setPlayer1PromotionZones] = useState<PieceTypePromotionZones>({
    shogi: { rows: 3, fromTop: true },
    chess: { rows: 1, fromTop: true },
  })
  const [player2PromotionZones, setPlayer2PromotionZones] = useState<PieceTypePromotionZones>({
    shogi: { rows: 3, fromTop: false },
    chess: { rows: 1, fromTop: false },
  })

  // URLパラメータからボードIDを取得して既存ボードをロード
  useEffect(() => {
    const id = searchParams?.get('id')
    if (id && user) {
      loadExistingBoard(id)
    }
  }, [searchParams, user])

  const loadExistingBoard = async (id: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('custom_boards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single()

      if (error) throw error

      if (data) {
        const boardRecord = data as any
        setBoardId(boardRecord.id)
        setBoardName(boardRecord.name)
        setIsPublic(boardRecord.is_public)

        const boardData = boardRecord.board_data
        setBoardDescription(boardData.description || '')
        setBoard(boardData.board)
        setPlayer1Config(boardData.player1)
        setPlayer2Config(boardData.player2)
        setBoardSize(boardData.board[0].split(/\s+/).length as 8 | 9)

        // 後方互換性を持たせてpromotionZonesを読み込み
        if (boardData.promotionZones) {
          const p1Zone = boardData.promotionZones.player1
          const p2Zone = boardData.promotionZones.player2

          // 新形式（PieceTypePromotionZones）かチェック
          if (p1Zone && 'shogi' in p1Zone && 'chess' in p1Zone) {
            setPlayer1PromotionZones(p1Zone as PieceTypePromotionZones)
          } else {
            // 旧形式を新形式に変換
            const zone = p1Zone as PromotionZoneConfig
            setPlayer1PromotionZones({
              shogi: zone,
              chess: zone,  // 同じ設定を使用
            })
          }

          if (p2Zone && 'shogi' in p2Zone && 'chess' in p2Zone) {
            setPlayer2PromotionZones(p2Zone as PieceTypePromotionZones)
          } else {
            const zone = p2Zone as PromotionZoneConfig
            setPlayer2PromotionZones({
              shogi: zone,
              chess: zone,
            })
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to load board:', error)
      alert('ボードの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = (template: 'chess' | 'shogi' | 'empty') => {
    switch (template) {
      case 'chess':
        setBoardSize(8)
        setBoard(DEFAULT_CHESS_BOARD)
        setPlayer1Config({ useHandPieces: false })
        setPlayer2Config({ useHandPieces: false })
        setPlayer1PromotionZones({
          shogi: { rows: 0, fromTop: true },      // 将棋駒は成れない
          chess: { rows: 1, fromTop: true },      // 最終行のみ
        })
        setPlayer2PromotionZones({
          shogi: { rows: 0, fromTop: false },
          chess: { rows: 1, fromTop: false },
        })
        break
      case 'shogi':
        setBoardSize(9)
        setBoard(DEFAULT_SHOGI_BOARD)
        setPlayer1Config({ useHandPieces: true })
        setPlayer2Config({ useHandPieces: true })
        setPlayer1PromotionZones({
          shogi: { rows: 3, fromTop: true },      // 敵陣3段
          chess: { rows: 0, fromTop: true },      // チェス駒は成れない
        })
        setPlayer2PromotionZones({
          shogi: { rows: 3, fromTop: false },
          chess: { rows: 0, fromTop: false },
        })
        break
      case 'empty':
        setBoard(boardSize === 8 ? EMPTY_8x8_BOARD : EMPTY_9x9_BOARD)
        setPlayer1PromotionZones({
          shogi: { rows: 3, fromTop: true },
          chess: { rows: 1, fromTop: true },
        })
        setPlayer2PromotionZones({
          shogi: { rows: 3, fromTop: false },
          chess: { rows: 1, fromTop: false },
        })
        break
    }
  }

  const handleExportJSON = () => {
    const data: CustomBoardData = {
      name: boardName,
      description: boardDescription || undefined,
      board,
      player1: player1Config,
      player2: player2Config,
      promotionZones: {
        player1: player1PromotionZones,
        player2: player2PromotionZones,
      },
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
      const boardData = {
        name: boardName,
        description: boardDescription || undefined,
        board,
        player1: player1Config,
        player2: player2Config,
        promotionZones: {
          player1: player1PromotionZones,
          player2: player2PromotionZones,
        },
      }

      if (boardId) {
        // 更新
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          throw new Error('Authentication required')
        }

        const response = await fetch(`/api/boards/${boardId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({
            name: boardName,
            board_data: boardData,
            is_public: isPublic,
          }),
        })

        if (!response.ok) throw new Error('Failed to update board')
        alert('ボードを更新しました！')
      } else {
        // 新規作成
        const { data, error } = await (supabase
          .from('custom_boards') as any)
          .insert({
            user_id: user.id,
            name: boardName,
            board_data: boardData,
            is_public: isPublic,
            user_display_name: profile?.display_name || user.email,
          })
          .select()

        if (error) throw error

        if (data && data[0]) {
          setBoardId(data[0].id)
          router.push(`/editor?id=${data[0].id}`)
        }

        alert('ボードを保存しました！')
      }
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
        setBoardDescription(data.description || '')
        setBoard(data.board)
        setPlayer1Config(data.player1)
        setPlayer2Config(data.player2)
        setBoardSize(data.board[0].split(/\s+/).length as 8 | 9)

        //  Load promotion zones with defaults for backward compatibility
        if (data.promotionZones) {
          const p1Zone = data.promotionZones.player1
          const p2Zone = data.promotionZones.player2

          // Check if new format
          if (p1Zone && 'shogi' in p1Zone && 'chess' in p1Zone) {
            setPlayer1PromotionZones(p1Zone as PieceTypePromotionZones)
          } else {
            const zone = p1Zone as PromotionZoneConfig
            setPlayer1PromotionZones({
              shogi: zone,
              chess: zone,
            })
          }

          if (p2Zone && 'shogi' in p2Zone && 'chess' in p2Zone) {
            setPlayer2PromotionZones(p2Zone as PieceTypePromotionZones)
          } else {
            const zone = p2Zone as PromotionZoneConfig
            setPlayer2PromotionZones({
              shogi: zone,
              chess: zone,
            })
          }
        } else {
          // Use defaults if not specified
          setPlayer1PromotionZones({
            shogi: { rows: 3, fromTop: true },
            chess: { rows: 1, fromTop: true },
          })
          setPlayer2PromotionZones({
            shogi: { rows: 3, fromTop: false },
            chess: { rows: 1, fromTop: false },
          })
        }
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
            Description (Optional):
          </label>
          <textarea
            value={boardDescription}
            onChange={(e) => setBoardDescription(e.target.value)}
            className="input"
            placeholder="このボードの説明を入力..."
            rows={3}
            style={{ width: '100%', maxWidth: '600px', resize: 'vertical' }}
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

      {/* Promotion Zone Config */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        {/* Player 1 Promotion Zones */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Player 1 Promotion Zones</h3>

          {/* 将棋駒用 */}
          <div style={{ marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '14px', fontWeight: '600' }}>将棋駒 (Shogi Pieces)</h4>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                行数 (Rows):
              </label>
              <input
                type="number"
                min="0"
                max={boardSize}
                value={player1PromotionZones.shogi.rows}
                onChange={(e) => setPlayer1PromotionZones({
                  ...player1PromotionZones,
                  shogi: { ...player1PromotionZones.shogi, rows: parseInt(e.target.value) || 0 }
                })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                方向 (Direction):
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                <input
                  type="radio"
                  name="p1ShogiDirection"
                  checked={player1PromotionZones.shogi.fromTop}
                  onChange={() => setPlayer1PromotionZones({
                    ...player1PromotionZones,
                    shogi: { ...player1PromotionZones.shogi, fromTop: true }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                上から (From Top)
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="p1ShogiDirection"
                  checked={!player1PromotionZones.shogi.fromTop}
                  onChange={() => setPlayer1PromotionZones({
                    ...player1PromotionZones,
                    shogi: { ...player1PromotionZones.shogi, fromTop: false }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                下から (From Bottom)
              </label>
            </div>
          </div>

          {/* チェス駒用 */}
          <div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '14px', fontWeight: '600' }}>チェス駒 (Chess Pieces)</h4>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                行数 (Rows):
              </label>
              <input
                type="number"
                min="0"
                max={boardSize}
                value={player1PromotionZones.chess.rows}
                onChange={(e) => setPlayer1PromotionZones({
                  ...player1PromotionZones,
                  chess: { ...player1PromotionZones.chess, rows: parseInt(e.target.value) || 0 }
                })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                方向 (Direction):
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                <input
                  type="radio"
                  name="p1ChessDirection"
                  checked={player1PromotionZones.chess.fromTop}
                  onChange={() => setPlayer1PromotionZones({
                    ...player1PromotionZones,
                    chess: { ...player1PromotionZones.chess, fromTop: true }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                上から (From Top)
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="p1ChessDirection"
                  checked={!player1PromotionZones.chess.fromTop}
                  onChange={() => setPlayer1PromotionZones({
                    ...player1PromotionZones,
                    chess: { ...player1PromotionZones.chess, fromTop: false }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                下から (From Bottom)
              </label>
            </div>
          </div>
        </div>

        {/* Player 2 Promotion Zones */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Player 2 Promotion Zones</h3>

          {/* 将棋駒用 */}
          <div style={{ marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '14px', fontWeight: '600' }}>将棋駒 (Shogi Pieces)</h4>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                行数 (Rows):
              </label>
              <input
                type="number"
                min="0"
                max={boardSize}
                value={player2PromotionZones.shogi.rows}
                onChange={(e) => setPlayer2PromotionZones({
                  ...player2PromotionZones,
                  shogi: { ...player2PromotionZones.shogi, rows: parseInt(e.target.value) || 0 }
                })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                方向 (Direction):
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                <input
                  type="radio"
                  name="p2ShogiDirection"
                  checked={player2PromotionZones.shogi.fromTop}
                  onChange={() => setPlayer2PromotionZones({
                    ...player2PromotionZones,
                    shogi: { ...player2PromotionZones.shogi, fromTop: true }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                上から (From Top)
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="p2ShogiDirection"
                  checked={!player2PromotionZones.shogi.fromTop}
                  onChange={() => setPlayer2PromotionZones({
                    ...player2PromotionZones,
                    shogi: { ...player2PromotionZones.shogi, fromTop: false }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                下から (From Bottom)
              </label>
            </div>
          </div>

          {/* チェス駒用 */}
          <div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '14px', fontWeight: '600' }}>チェス駒 (Chess Pieces)</h4>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                行数 (Rows):
              </label>
              <input
                type="number"
                min="0"
                max={boardSize}
                value={player2PromotionZones.chess.rows}
                onChange={(e) => setPlayer2PromotionZones({
                  ...player2PromotionZones,
                  chess: { ...player2PromotionZones.chess, rows: parseInt(e.target.value) || 0 }
                })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '14px' }}>
                方向 (Direction):
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                <input
                  type="radio"
                  name="p2ChessDirection"
                  checked={player2PromotionZones.chess.fromTop}
                  onChange={() => setPlayer2PromotionZones({
                    ...player2PromotionZones,
                    chess: { ...player2PromotionZones.chess, fromTop: true }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                上から (From Top)
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="p2ChessDirection"
                  checked={!player2PromotionZones.chess.fromTop}
                  onChange={() => setPlayer2PromotionZones({
                    ...player2PromotionZones,
                    chess: { ...player2PromotionZones.chess, fromTop: false }
                  })}
                  style={{ marginRight: 'var(--spacing-xs)' }}
                />
                下から (From Bottom)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Board Editor */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Board Editor</h3>
        <BoardEditor
          board={board}
          onChange={setBoard}
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

export default function BoardEditorPage() {
  return (
    <Suspense fallback={<div className="container text-center" style={{ paddingTop: '2rem' }}>読み込み中...</div>}>
      <BoardEditorContent />
    </Suspense>
  )
}

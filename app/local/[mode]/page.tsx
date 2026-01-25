'use client'


import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import BoardSelector from '@/components/BoardSelector'
import AILevelSelector from '@/components/AILevelSelector'
import type { CustomBoardData } from '@/lib/board/types'

export default function SelectBoardPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  if (!params) {
    return null
  }

  const mode = params.mode as string

  // Read AI settings from URL parameters
  const urlAiType = searchParams?.get('aiType') as 'simple' | 'advanced' | null
  const urlAiLevel = searchParams?.get('aiLevel')

  const [aiLevel, setAILevel] = useState<number>(
    urlAiLevel ? parseInt(urlAiLevel) : 3
  ) // Default: Level 3 (Normal)

  const boardTypes = [
    { id: 'shogi', name: '将棋', description: '9x9 盤面、持ち駒あり' },
    { id: 'chess', name: 'チェス', description: '8x8 盤面、持ち駒なし' },
  ]

  const handleSelectBoard = (boardType: string) => {
    // Pass AI settings for PvA mode
    if (mode === 'pva') {
      const params = new URLSearchParams()
      if (urlAiType) {
        params.append('aiType', urlAiType)
      }
      if (urlAiType === 'advanced') {
        params.append('aiLevel', aiLevel.toString())
      }
      router.push(`/local/${mode}/${boardType}?${params.toString()}`)
    } else {
      router.push(`/local/${mode}/${boardType}`)
    }
  }

  const handleCustomBoardSelect = (data: CustomBoardData) => {
    // カスタムボードデータをURLパラメータやlocalStorage経由で渡す必要がある
    // ここでは簡単にlocalStorageを使用する
    localStorage.setItem('customBoard', JSON.stringify(data))

    // Pass AI settings for PvA mode
    if (mode === 'pva') {
      const params = new URLSearchParams()
      if (urlAiType) {
        params.append('aiType', urlAiType)
      }
      if (urlAiType === 'advanced') {
        params.append('aiLevel', aiLevel.toString())
      }
      router.push(`/local/${mode}/custom?${params.toString()}`)
    } else {
      router.push(`/local/${mode}/custom`)
    }
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1
        style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-lg)',
          textAlign: 'center',
        }}
      >
        {mode === 'pva' ? 'AIの強さと盤の種類を選択' : '盤の種類を選択'}
      </h1>

      <p className="text-center text-muted mb-xl">
        {mode === 'pva' ? 'AI と対戦する' : '2人で対戦する'}盤の種類を選んでください
      </p>

      {/* AI Level Selector for PvA mode */}
      {mode === 'pva' && (
        <div style={{ maxWidth: '600px', margin: '0 auto var(--spacing-2xl) auto' }}>
          <AILevelSelector selectedLevel={aiLevel} onSelect={setAILevel} />
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(250px, 300px))',
          gap: 'var(--spacing-lg)',
          margin: '0 auto mb-xl',
          justifyContent: 'center',
        }}
      >
        {boardTypes.map((board) => (
          <div
            key={board.id}
            className="card"
            style={{
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
            }}
            onClick={() => handleSelectBoard(board.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '600',
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-primary)',
              }}
            >
              {board.name}
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
              {board.description}
            </p>
            <button
              className="btn btn-primary mt-md"
              style={{ width: '100%' }}
              onClick={(e) => {
                e.stopPropagation()
                handleSelectBoard(board.id)
              }}
            >
              選択
            </button>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '900px', margin: '3rem auto 0' }}>
        <BoardSelector onSelect={handleCustomBoardSelect} />
      </div>

      <div className="text-center mt-xl">
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>
    </main>
  )
}

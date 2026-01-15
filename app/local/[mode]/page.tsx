'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function SelectBoardPage() {
  const params = useParams()
  const router = useRouter()
  const mode = params.mode as string

  const boardTypes = [
    { id: 'shogi', name: '将棋', description: '9x9 盤面、持ち駒あり' },
    { id: 'chess', name: 'チェス', description: '8x8 盤面、持ち駒なし' },
    { id: 'hybrid', name: 'ハイブリッド', description: '9x9 盤面、将棋 vs チェス' },
  ]

  const handleSelectBoard = (boardType: string) => {
    router.push(`/local/${mode}/${boardType}`)
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
        盤の種類を選択
      </h1>

      <p className="text-center text-muted mb-xl">
        {mode === 'pva' ? 'AI と対戦する' : '2人で対戦する'}盤の種類を選んでください
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)',
          maxWidth: '900px',
          margin: '0 auto',
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

      <div className="text-center mt-xl">
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>
    </main>
  )
}

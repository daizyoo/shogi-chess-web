'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BoardType } from '@/lib/types'

export default function LocalSetupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'pvp' | 'pva'>('pva')
  const [boardType, setBoardType] = useState<BoardType>('shogi')
  const [aiType, setAIType] = useState<'simple' | 'advanced'>('simple')
  const [aiDifficulty, setAIDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const handleStart = () => {
    // URLパラメータでAI設定を渡す
    const params = new URLSearchParams({
      aiType,
      aiDifficulty,
    })

    router.push(`/local/${mode}/${boardType}?${params.toString()}`)
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'bold',
        marginBottom: 'var(--spacing-xl)',
        textAlign: 'center',
      }}>
        ローカルゲーム設定
      </h1>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* モード選択 */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
            ゲームモード
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button
              className={mode === 'pvp' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setMode('pvp')}
              style={{ flex: 1 }}
            >
              👥 2人で対戦
            </button>
            <button
              className={mode === 'pva' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setMode('pva')}
              style={{ flex: 1 }}
            >
              🤖 AI と対戦
            </button>
          </div>
        </div>

        {/* 盤タイプ選択 */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
            盤タイプ
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button
              className={boardType === 'shogi' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setBoardType('shogi')}
              style={{ flex: 1 }}
            >
              将棋 (9x9)
            </button>
            <button
              className={boardType === 'chess' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setBoardType('chess')}
              style={{ flex: 1 }}
            >
              チェス (8x8)
            </button>
            <button
              className={boardType === 'custom' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setBoardType('custom')}
              style={{ flex: 1 }}
            >
              カスタム
            </button>
          </div>
        </div>

        {/* AI設定（PvAモードのみ表示） */}
        {mode === 'pva' && (
          <>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
                AI タイプ
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button
                  className={aiType === 'simple' ? 'btn btn-primary' : 'btn btn-outline'}
                  onClick={() => setAIType('simple')}
                  style={{ flex: 1 }}
                >
                  ⚡ Simple AI (高速)
                </button>
                <button
                  className={aiType === 'advanced' ? 'btn btn-primary' : 'btn btn-outline'}
                  onClick={() => setAIType('advanced')}
                  style={{ flex: 1 }}
                >
                  🧠 Advanced AI (WASM)
                </button>
              </div>
              <p className="text-muted mt-xs" style={{ fontSize: 'var(--font-size-sm)' }}>
                {aiType === 'simple'
                  ? 'JavaScript実装の軽量AI。即座に応答します。'
                  : 'Rust + WASM実装の高度なAI。より強力ですが初回読み込みに時間がかかります。'
                }
              </p>
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
                難易度
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button
                  className={aiDifficulty === 'easy' ? 'btn btn-primary' : 'btn btn-outline'}
                  onClick={() => setAIDifficulty('easy')}
                  style={{ flex: 1 }}
                >
                  😊 Easy
                </button>
                <button
                  className={aiDifficulty === 'medium' ? 'btn btn-primary' : 'btn btn-outline'}
                  onClick={() => setAIDifficulty('medium')}
                  style={{ flex: 1 }}
                >
                  😐 Medium
                </button>
                <button
                  className={aiDifficulty === 'hard' ? 'btn btn-primary' : 'btn btn-outline'}
                  onClick={() => setAIDifficulty('hard')}
                  style={{ flex: 1 }}
                >
                  😤 Hard
                </button>
              </div>
            </div>
          </>
        )}

        {/* スタートボタン */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
          <button
            className="btn btn-outline"
            onClick={() => router.back()}
            style={{ flex: 1 }}
          >
            ← 戻る
          </button>
          <button
            className="btn btn-primary"
            onClick={handleStart}
            style={{ flex: 2 }}
          >
            ゲーム開始 →
          </button>
        </div>
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AILevelSelector from '@/components/AILevelSelector'

export default function LocalSetupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'pvp' | 'pva'>('pva')
  const [aiType, setAIType] = useState<'simple' | 'advanced'>('advanced') // Changed default to advanced
  const [aiLevel, setAILevel] = useState<number>(3) // NEW: AI level (1-6)

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
                  : 'Rust + WASM実装の高度なAI。6段階のレベルから選択できます。'
                }
              </p>
            </div>

            {/* AI Level Selector - Advanced AIの場合のみ表示 */}
            {aiType === 'advanced' && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <AILevelSelector selectedLevel={aiLevel} onSelect={setAILevel} />
              </div>
            )}
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
            onClick={() => {
              // Navigate to board selection page
              const params = new URLSearchParams()
              if (mode === 'pva') {
                params.append('aiType', aiType)
                if (aiType === 'advanced') {
                  params.append('aiLevel', aiLevel.toString())
                }
              }
              const queryString = params.toString()
              const url = queryString ? `/local/${mode}?${queryString}` : `/local/${mode}`
              router.push(url)
            }}
            style={{ flex: 2 }}
          >
            盤を選択 →
          </button>
        </div>
      </div>
    </main>
  )
}

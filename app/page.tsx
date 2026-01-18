'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/Auth/AuthProvider'
import RoomList from '@/components/RoomList'

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1
        style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'center',
          color: 'var(--color-primary)',
        }}
      >
        将棋-チェス ハイブリッドゲーム
      </h1>

      {/* ローカルゲームセクション */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          ローカルゲーム（オフライン）
        </h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/local/pva')}
            style={{ flex: 1, minWidth: '200px' }}
          >
            🤖 AI と対戦
          </button>
          <button
            className="btn btn-outline"
            onClick={() => router.push('/local/pvp')}
            style={{ flex: 1, minWidth: '200px' }}
          >
            👥 2人で対戦
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => router.push('/editor')}
            style={{ flex: 1, minWidth: '200px' }}
          >
            ⚙️ カスタムボード作成
          </button>
        </div>
        <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
          インターネット接続不要で、このデバイス上で直接プレイできます
        </p>
      </div>

      {/* オンラインゲーム
セクション */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--spacing-lg)' }}>
          ルーム一覧
        </h2>

        <RoomList />
      </div>

      <div className="text-center text-muted">
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          将棋とチェスの駒を組み合わせた新しいゲーム体験
        </p>
      </div>
    </main>
  )
}

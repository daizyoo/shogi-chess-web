'use client'

import Link from 'next/link'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      padding: 'var(--spacing-md) 0',
      backgroundColor: 'var(--surface)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link href="/" style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'bold',
          color: 'var(--primary)',
          textDecoration: 'none',
        }}>
          将棋-チェス ハイブリッド
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Link href="/editor" className="text-sm font-medium hover:text-primary transition-colors">
            ボードエディタ
          </Link>

          <Link href="/feedback" className="text-sm font-medium hover:text-primary transition-colors">
            フィードバック
          </Link>

          {!loading && (
            <>
              {user ? (
                <Link href="/settings" className="btn btn-sm btn-outline">
                  アカウントページ
                </Link>
              ) : (
                <Link href="/login" className="btn btn-sm btn-primary">
                  ログイン
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

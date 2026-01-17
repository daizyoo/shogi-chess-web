'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        })
        if (signUpError) throw signUpError
        alert('確認メールを送信しました。メールを確認してください。')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container flex flex-col items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'ユーザー登録' : 'ログイン'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1">表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input w-full"
                placeholder="将棋太郎"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="example@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full py-2"
            disabled={loading}
          >
            {loading ? '処理中...' : isSignUp ? '登録する' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isSignUp ? (
            <p>
              すでにアカウントをお持ちですか？{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-primary font-semibold hover:underline"
              >
                ログイン
              </button>
            </p>
          ) : (
            <p>
              アカウントをお持ちではありませんか？{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-primary font-semibold hover:underline"
              >
                新規登録
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

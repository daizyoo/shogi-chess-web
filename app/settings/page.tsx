'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (profile) {
      setDisplayName(profile.display_name || '')
    }
  }, [user, profile, router])

  const handleUpdateDisplayName = async () => {
    if (!user || !displayName.trim()) return

    setSaving(true)
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ display_name: displayName })
        .eq('id', user.id)

      if (error) throw error
      alert('表示名を更新しました')
    } catch (error: any) {
      alert(`更新に失敗しました: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('パスワードを入力してください')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('パスワードが一致しません')
      return
    }

    if (newPassword.length < 6) {
      alert('パスワードは6文字以上にしてください')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      alert('パスワードを変更しました')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      alert(`パスワード変更に失敗しました: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('有効なメールアドレスを入力してください')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error
      alert('確認メールを送信しました。メールを確認して変更を完了してください。')
      setNewEmail('')
    } catch (error: any) {
      alert(`メールアドレス変更に失敗しました: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--spacing-lg)' }}>
        アカウントページ
      </h1>

      {/* 表示名変更 */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          表示名
        </h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="表示名を入力"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button
            className="btn btn-primary"
            onClick={handleUpdateDisplayName}
            disabled={saving || !displayName.trim()}
          >
            {saving ? '更新中...' : '変更'}
          </button>
        </div>
        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
          他のユーザーに表示される名前です
        </p>
      </div>

      {/* 現在のメールアドレス */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          現在のメールアドレス
        </h2>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
          {user.email}
        </p>
      </div>

      {/* メールアドレス変更 */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          メールアドレス変更
        </h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="input"
            placeholder="新しいメールアドレス"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button
            className="btn btn-secondary"
            onClick={handleUpdateEmail}
            disabled={saving || !newEmail}
          >
            {saving ? '送信中...' : '変更'}
          </button>
        </div>
        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
          確認メールが送信されます
        </p>
      </div>

      {/* パスワード変更 */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          パスワード変更
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
            placeholder="新しいパスワード（6文字以上）"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            placeholder="パスワード確認"
          />
          <button
            className="btn btn-primary"
            onClick={handleUpdatePassword}
            disabled={saving || !newPassword || !confirmPassword}
            style={{ alignSelf: 'flex-start' }}
          >
            {saving ? '変更中...' : 'パスワード変更'}
          </button>
        </div>
      </div>

      {/* ログアウト */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          ログアウト
        </h2>
        <button
          className="btn btn-outline"
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
          style={{ color: 'var(--color-danger)' }}
        >
          ログアウト
        </button>
      </div>

      {/* 戻るボタン */}
      <div className="text-center">
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>
    </main>
  )
}

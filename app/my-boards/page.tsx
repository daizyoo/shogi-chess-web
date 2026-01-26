'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/Auth/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase/client'

interface SavedBoard {
  id: string
  name: string
  board_data: any
  is_public: boolean
  created_at: string
}

export default function MyBoardsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [boards, setBoards] = useState<SavedBoard[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchMyBoards()
  }, [user])

  const fetchMyBoards = async () => {
    if (!user) return

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('custom_boards')
        .select('id, name, board_data, is_public, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBoards(data || [])
    } catch (error) {
      console.error('Failed to fetch boards:', error)
      alert('ボード一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseClient()
    const session = await supabase.auth.getSession()
    if (!session.data.session) {
      alert('認証エラーが発生しました')
      return
    }

    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete board')
      }

      alert('ボードを削除しました')
      setDeleteConfirm(null)
      fetchMyBoards()
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  const handleTogglePublic = async (id: string, currentPublic: boolean) => {
    const supabase = getSupabaseClient()
    const session = await supabase.auth.getSession()
    if (!session.data.session) {
      alert('認証エラーが発生しました')
      return
    }

    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({ is_public: !currentPublic }),
      })

      if (!response.ok) {
        throw new Error('Failed to update board')
      }

      alert(`ボードを${!currentPublic ? '公開' : '非公開'}にしました`)
      fetchMyBoards()
    } catch (error) {
      console.error('Toggle error:', error)
      alert('更新に失敗しました')
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/editor?id=${id}`)
  }

  if (!user) {
    return null
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--spacing-lg)' }}>
        マイカスタムボード
      </h1>

      {loading ? (
        <div className="text-center py-6">
          <div className="pulse">読み込み中...</div>
        </div>
      ) : boards.length === 0 ? (
        <div className="card text-center py-6">
          <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }}>
            保存されたボードはありません
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/editor')}>
            新しいボードを作成
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <button className="btn btn-primary" onClick={() => router.push('/editor')}>
              + 新しいボードを作成
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 'var(--spacing-md)',
            }}
          >
            {boards.map((board) => (
              <div
                key={board.id}
                className="card"
                style={{
                  padding: 'var(--spacing-md)',
                  border: '2px solid var(--color-border)',
                }}
              >
                {/* ボード情報 */}
                <h3
                  style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '600',
                    marginBottom: 'var(--spacing-sm)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {board.name}
                </h3>

                {board.board_data?.description && (
                  <p
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text)',
                      marginBottom: 'var(--spacing-sm)',
                      fontStyle: 'italic',
                    }}
                  >
                    {board.board_data.description}
                  </p>
                )}

                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }}>
                  <div>公開: {board.is_public ? '✅ 公開中' : '❌ 非公開'}</div>
                  <div>作成: {new Date(board.created_at).toLocaleDateString('ja-JP')}</div>
                </div>

                {/* 操作ボタン */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEdit(board.id)}
                  >
                    📝 編集
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleTogglePublic(board.id, board.is_public)}
                  >
                    {board.is_public ? '🔒 非公開にする' : '🌐 公開する'}
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setDeleteConfirm(board.id)}
                    style={{ color: 'var(--color-danger)' }}
                  >
                    🗑️ 削除
                  </button>
                </div>

                {/* 削除確認ダイアログ */}
                {deleteConfirm === board.id && (
                  <div
                    style={{
                      marginTop: 'var(--spacing-md)',
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--color-surface-alt)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-danger)',
                    }}
                  >
                    <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>
                      本当に削除しますか？この操作は取り消せません。
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(board.id)}
                        style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                      >
                        削除する
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-center" style={{ marginTop: 'var(--spacing-xl)' }}>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>
    </main>
  )
}

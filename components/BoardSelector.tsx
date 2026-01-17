'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { CustomBoardData } from '@/lib/board/types'

interface CustomBoard {
  id: string
  name: string
  user_display_name: string
  board_data: any
}

interface BoardSelectorProps {
  onSelect: (data: CustomBoardData) => void
  showTitle?: boolean
}

export default function BoardSelector({ onSelect, showTitle = true }: BoardSelectorProps) {
  const [boards, setBoards] = useState<CustomBoard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicBoards()
  }, [])

  const fetchPublicBoards = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('custom_boards')
        .select('id, name, user_display_name, board_data')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBoards(data || [])
    } catch (err) {
      console.error('Error fetching public boards:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-sm text-muted">読み込み中...</div>

  if (boards.length === 0) {
    return <div className="text-sm text-muted">公開されているボードはありません</div>
  }

  return (
    <div>
      {showTitle && <h3 className="text-lg font-semibold mb-3">公開されたカスタムボード</h3>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => onSelect(board.board_data as CustomBoardData)}
            className="flex flex-col items-start p-3 border border-border rounded-lg hover:bg-surface-alt hover:border-primary transition-all text-left"
          >
            <span className="font-bold text-sm mb-1">{board.name}</span>
            <span className="text-xs text-muted">作者: {board.user_display_name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

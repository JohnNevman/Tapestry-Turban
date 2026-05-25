'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/components/ui/toaster'
import { Comment } from '@/types'
import { useRouter } from 'next/navigation'

interface Props {
  postId: number
  comments: Comment[]
}

export function CommentSection({ postId, comments }: Props) {
  const [text, setText] = useState('')
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!user) { toast('请先登录'); return }
    if (!text.trim()) return

    const supabase = createClient()
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, text: text.trim() })

    if (error) { toast('评论失败'); return }
    setText('')
    toast('评论成功')
    router.refresh()
  }

  return (
    <div className="mt-3 flex-1 overflow-y-auto">
      <h4 className="text-sm font-medium mb-2.5">评论 ({comments.length})</h4>

      {comments.map((c) => (
        <div key={c.id} className="flex gap-2 mb-3">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 inline-flex items-center justify-center text-white text-[8px] shrink-0 mt-0.5">
            {c.profiles?.username?.[0] || '?'}
          </span>
          <div className="flex-1">
            <div className="text-xs font-semibold mb-0.5">{c.profiles?.username || '匿名'}</div>
            <div className="text-xs text-gray-600 leading-relaxed">{c.text}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {new Date(c.created_at).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-gray-200">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={user ? '写评论...' : '登录后评论'}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-xs outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-400 text-white px-3.5 py-1.5 rounded-full text-xs"
        >
          发送
        </button>
      </div>
    </div>
  )
}
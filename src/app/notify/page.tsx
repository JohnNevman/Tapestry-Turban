'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'

export default function NotifyPage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<'likes' | 'comments'>('likes')
  const [likes, setLikes] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => { if (user) loadNotifications() }, [user])

  const loadNotifications = async () => {
    const supabase = createClient()

    // 获取别人对我帖子的点赞
    const { data: myPosts } = await supabase.from('posts').select('id, title').eq('user_id', user!.id)
    const postIds = myPosts?.map((p) => p.id) || []

    if (postIds.length) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('*, profiles(*), posts(title)')
        .in('post_id', postIds)
        .neq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setLikes(likeData || [])

      const { data: commentData } = await supabase
        .from('comments')
        .select('*, profiles(*), posts(title)')
        .in('post_id', postIds)
        .neq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setComments(commentData || [])
    }
  }

  if (!user) return <div className="text-center py-16 text-gray-400">请先登录查看通知</div>

  return (
    <div className="max-w-[600px] mx-auto">
      <h2 className="text-lg font-bold text-center mb-4">通知</h2>

      <div className="flex gap-6 mb-4 border-b border-gray-200 pb-2.5 justify-center">
        <button
          onClick={() => setTab('likes')}
          className={`pb-1 text-sm relative ${tab === 'likes' ? 'font-bold text-gray-900' : 'text-gray-400'}`}
        >
          点赞 ({likes.length})
          {tab === 'likes' && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-400 rounded" />}
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`pb-1 text-sm relative ${tab === 'comments' ? 'font-bold text-gray-900' : 'text-gray-400'}`}
        >
          评论 ({comments.length})
          {tab === 'comments' && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-400 rounded" />}
        </button>
      </div>

      <div className="space-y-2">
        {tab === 'likes' && (
          likes.length ? likes.map((l, i) => (
            <Link key={i} href={`/post/${l.post_id}`} className="flex items-center gap-3 bg-white rounded-lg p-3.5 hover:shadow-sm transition">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {l.profiles?.username?.[0] || '?'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{l.profiles?.username}</span>
                  <span className="text-gray-400"> 赞了你的 </span>
                  <span className="font-medium">「{l.posts?.title}」</span>
                </p>
                <p className="text-[10px] text-gray-300 mt-0.5">{new Date(l.created_at).toLocaleString('zh-CN')}</p>
              </div>
            </Link>
          )) : <div className="text-center py-10 text-gray-400 text-sm">暂无点赞通知</div>
        )}

        {tab === 'comments' && (
          comments.length ? comments.map((c) => (
            <Link key={c.id} href={`/post/${c.post_id}`} className="flex items-center gap-3 bg-white rounded-lg p-3.5 hover:shadow-sm transition">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {c.profiles?.username?.[0] || '?'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{c.profiles?.username}</span>
                  <span className="text-gray-400"> 评论了你的 </span>
                  <span className="font-medium">「{c.posts?.title}」</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.text}</p>
                <p className="text-[10px] text-gray-300 mt-0.5">{new Date(c.created_at).toLocaleString('zh-CN')}</p>
              </div>
            </Link>
          )) : <div className="text-center py-10 text-gray-400 text-sm">暂无评论通知</div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from '@/components/post/post-card'

const supabase = createClient()

// 把业务逻辑单独拆成一个组件，在这里使用 useSearchParams
function SearchContent() {
  const params = useSearchParams()
  const query = params.get('q') || ''

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)

      if (!query) {
        setPosts([])
        setLoading(false)
        return
      }

      // 1. 搜索匹配的用户名
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', `%${query}%`)

      const userIds = profilesData?.map((p) => p.id) || []

      // 2. 搜索条件
      const conditions = [
        `title.ilike.%${query}%`,
        `content.ilike.%${query}%`,
      ]

      if (userIds.length > 0) {
        const uuidList = userIds.map((id) => `'${id}'`).join(',')
        conditions.push(`user_id.in.(${uuidList})`)
      }

      // 3. 执行搜索（注意解构 error）
      const { data: postData, error } = await supabase
        .from('posts')
        .select('*, profiles!posts_user_id_fkey(*)')
        .or(conditions.join(','))
        .order('created_at', { ascending: false })

      console.log('搜索条件:', conditions.join(','))
      console.log('搜索结果:', postData)
      console.log('搜索错误:', error)

      setPosts(postData || [])
      setLoading(false)
    }

    fetchResults()
  }, [query])

  if (loading) return <div className="text-center py-10">搜索中...</div>

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-sm font-bold text-center mb-4">
        {query ? `搜索「${query}」的结果` : '搜索'}
      </h2>

      {posts.length ? (
        <div className="columns-2 gap-3 sm:columns-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 text-sm">
          {query ? '没有找到相关内容' : '输入关键词搜索'}
        </div>
      )}
    </div>
  )
}

// 页面根组件只做一件事：用 Suspense 包裹逻辑组件
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">加载中...</div>}>
      <SearchContent />
    </Suspense>
  )
}
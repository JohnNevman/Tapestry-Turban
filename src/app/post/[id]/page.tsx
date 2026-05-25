import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PostDetail } from './post-detail'

export default async function PostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    // ✅ 注意这里的关键语法：profiles!posts_user_id_fkey(*)
    .select('*, profiles!posts_user_id_fkey(*), likes(*), comments(*, profiles(*))')
    .eq('id', id)
    .single()

  // 如果查询出错（比如 ID 格式不对）或者没查到数据，直接走 404
  if (error || !post) {
    return notFound()
  }

  return <PostDetail post={post} />
}
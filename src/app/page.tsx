import { createClient } from '@/lib/supabase/server'
import { PostGrid } from '@/components/post/post-grid'

export const dynamic = 'force-dynamic'   // ← 加这一行

export default async function HomePage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(*), likes(*), comments(count)')
    .order('created_at', { ascending: false })

  return <PostGrid posts={posts || []} />
}
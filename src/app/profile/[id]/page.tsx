import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/post/post-card'

export default async function ProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params          // ← 关键改动
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(*), likes(*), comments(count)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const totalLikes = (posts || []).reduce(
    (sum, p) => sum + (p.likes?.length || 0), 0
  )

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-center gap-5 bg-white p-6 rounded-lg mb-5">
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
          {profile.username?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1">{profile.username}</h2>
          <p className="text-sm text-gray-400">
            {profile.bio || '这个人很懒，什么都没写'}
          </p>
          <div className="flex gap-5 mt-2.5">
            <div className="text-center">
              <div className="text-lg font-bold">{posts?.length || 0}</div>
              <div className="text-xs text-gray-400">笔记</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{totalLikes}</div>
              <div className="text-xs text-gray-400">获赞</div>
            </div>
          </div>
        </div>
      </div>

      <div className="columns-3 gap-3 max-md:columns-2 max-sm:columns-1">
        {posts?.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
      {!posts?.length && (
        <div className="text-center py-16 text-gray-400 text-sm">
          还没有发布内容
        </div>
      )}
    </div>
  )
}
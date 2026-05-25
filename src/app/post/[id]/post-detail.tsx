'use client'

import { Post } from '@/types'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/components/ui/toaster'
import { createClient } from '@/lib/supabase/client'
import { CommentSection } from '@/components/post/comment-section'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function PostDetail({ post }: { post: Post }) {
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()
  const router = useRouter()

  const liked = user && post.likes?.some((l) => l.user_id === user.id)

  const handleLike = async () => {
    if (!user) { toast('请先登录'); return }
    const supabase = createClient()

    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      toast('已取消点赞')
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
      toast('已点赞')
    }
    router.refresh()
  }

  const media = post.media?.[0]

  return (
    <div className="grid grid-cols-2 max-w-[960px] mx-auto bg-white rounded-lg overflow-hidden min-h-[480px] max-md:grid-cols-1">
      <div className="bg-black flex items-center justify-center min-h-[360px]">
        {media && (
          media.type === 'video'
            ? <video src={media.url} controls className="max-w-full max-h-[560px] object-contain" />
            : <img src={media.url} alt="" className="max-w-full max-h-[560px] object-contain" />
        )}
      </div>

      <div className="p-5 flex flex-col">
        <Link href={`/profile/${post.user_id}`} className="flex items-center gap-2 pb-3 border-b border-gray-200">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
            {post.profiles?.username?.[0] || '?'}
          </span>
          <span className="font-semibold text-sm">{post.profiles?.username || '未知'}</span>
        </Link>

        <div className="flex-1 py-3 overflow-y-auto">
          <h1 className="text-base font-semibold mb-2.5">{post.title}</h1>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          <div className="mt-2">
            {post.tags?.map((t) => (
              <span key={t} className="inline-block px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500 mr-1.5 mt-2">{t}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-3.5 py-2.5 border-t border-b border-gray-200">
          <button onClick={handleLike} className={`text-sm ${liked ? 'text-blue-400' : 'text-gray-400'} hover:text-blue-400`}>
            {liked ? '♥' : '♡'} {post.likes?.length || 0}
          </button>
          <span className="text-sm text-gray-400">评论 {post.comments?.length || 0}</span>
        </div>

        <CommentSection postId={post.id} comments={post.comments || []} />
      </div>
    </div>
  )
}
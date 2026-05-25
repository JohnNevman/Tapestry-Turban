'use client'

import Link from 'next/link'
import { Post } from '@/types'

export function PostCard({ post }: { post: Post }) {
  const author = post.profiles
  const img = post.media?.[0]

  return (
    <Link href={`/post/${post.id}`} className="block break-inside-avoid mb-3 bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {img && (
        img.type === 'video'
          ? <video src={img.url} muted preload="metadata" className="w-full block" />
          : <img src={img.url} alt="" loading="lazy" className="w-full block" />
      )}
      <div className="p-2 px-2.5">
        <div className="text-[13px] font-medium leading-snug mb-1 line-clamp-2">{post.title}</div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 inline-flex items-center justify-center text-white text-[7px]">
              {author?.username?.[0] || '?'}
            </span>
            <span className="truncate max-w-[60px]">{author?.username || '未知'}</span>
          </span>
          <span className="text-[11px] text-gray-400">♡ {post.likes?.length || 0}</span>
        </div>
      </div>
    </Link>
  )
}
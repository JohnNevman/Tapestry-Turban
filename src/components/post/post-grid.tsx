'use client'

import { useState } from 'react'
import { Post } from '@/types'
import { PostCard } from './post-card'

interface Props {
  posts: Post[]
}

export function PostGrid({ posts }: Props) {
  const tags = [...new Set(posts.flatMap((p) => p.tags || []))]
  const [activeTag, setActiveTag] = useState('')

  const filtered = activeTag
    ? posts.filter((p) => p.tags?.includes(activeTag))
    : posts

  return (
    <div>
      <div className="flex gap-6 mb-4 border-b border-gray-200 pb-2.5">
        <button
          onClick={() => setActiveTag('')}
          className={`pb-1 text-lg relative ${!activeTag ? 'font-bold text-gray-900' : 'text-gray-400'}`}
        >
          推荐
          {!activeTag && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-400 rounded" />}
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`pb-1 text-sm relative ${activeTag === tag ? 'font-bold text-gray-900' : 'text-gray-400'}`}
          >
            {tag}
            {activeTag === tag && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-400 rounded" />}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {!filtered.length && (
        <div className="text-center py-16 text-gray-400 text-sm">
          暂无内容
        </div>
      )}
    </div>
  )
}
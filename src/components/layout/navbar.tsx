'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function Navbar() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center">
      <div className="flex-1" />

      <div className="flex-[2] flex justify-center">
        <div className="relative w-full max-w-[400px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索内容..."
            className="w-full px-4 py-2 pr-9 border border-gray-200 rounded-full text-sm outline-none focus:border-gray-300"
          />
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-2.5">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold"
            >
              {user.username[0]}
            </button>
            {showDropdown && (
              <div className="absolute top-full right-0 mt-1.5 bg-white rounded-lg shadow-lg min-w-[120px] overflow-hidden z-50">
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setShowDropdown(false)}
                  className="block px-3.5 py-2.5 text-sm hover:bg-gray-50"
                >
                  我的主页
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3.5 py-2.5 text-sm hover:bg-gray-50"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="px-3.5 py-1.5 rounded-full text-sm border border-gray-200 hover:border-blue-400 hover:text-blue-400 transition">
              登录
            </Link>
            <Link href="/register" className="px-3.5 py-1.5 rounded-full text-sm bg-blue-400 text-white hover:opacity-90 transition">
              注册
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
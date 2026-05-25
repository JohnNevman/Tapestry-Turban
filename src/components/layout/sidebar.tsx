'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

const navItems = [
  { href: '/', label: '发现' },
  { href: '/publish', label: '发布' },
  { href: '/notify', label: '通知' },
  { href: '/skill', label: 'skill' },
  { href: '/diary', label: '日记' },
  { href: '/diary-square', label: '日记广场' },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  return (
    <aside className="fixed top-0 left-0 w-40 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-5 z-50">
      <Link href="/" className="pb-6">
        <span className="inline-block bg-blue-400 text-white text-sm font-bold px-4 py-1.5 rounded-xl">
          猫眼螺
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5 w-full px-3 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block text-center py-2.5 rounded-lg text-sm transition-colors hover:bg-gray-100 ${
              pathname === item.href ? 'font-bold text-gray-900' : 'text-gray-600'
            }`}
          >
            {item.label}
          </Link>
        ))}

        {/* 分割线 + 元素设置 */}
        <div className="my-2 border-t border-gray-100" />
        <Link
          href="/settings/elements"
          className={`block text-center py-2.5 rounded-lg text-sm transition-colors hover:bg-gray-100 ${
            pathname === '/settings/elements' ? 'font-bold text-gray-900' : 'text-gray-600'
          }`}
        >
          元素设置
        </Link>
      </nav>

      <div className="border-t border-gray-200 w-full px-3 pt-2.5 mt-auto">
        {user ? (
          <Link
            href={`/profile/${user.id}`}
            className="block text-center py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            {user.username}
          </Link>
        ) : (
          <Link
            href="/login"
            className="block text-center py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            登录
          </Link>
        )}
      </div>
    </aside>
  )
}
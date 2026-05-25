'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('请填写完整')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (err) {
      setError(err.message || '邮箱或密码错误')
      setLoading(false)
      return
    }

    // 登录成功 → onAuthStateChange 会自动触发 → AuthProvider 会自动更新 store
    router.push('/')
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="bg-white rounded-xl p-7 shadow-sm">
        <h2 className="text-xl font-semibold text-center mb-1">欢迎回来</h2>
        <p className="text-center text-gray-400 text-sm mb-6">登录你的账号</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入邮箱"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-400 text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          没有账号？<Link href="/register" className="text-blue-400">去注册</Link>
        </p>
      </div>
    </div>
  )
}
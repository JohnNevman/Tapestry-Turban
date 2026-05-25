'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !password) { setError('请填写所有必填项'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, bio } }
    })

    if (err) {
      setError(err.message.includes('already') ? '该邮箱已注册' : err.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="bg-white rounded-xl p-7 shadow-sm">
        <h2 className="text-xl font-semibold text-center mb-1">创建账号</h2>
        <p className="text-center text-gray-400 text-sm mb-6">加入AI创作社区</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">用户名</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="起个名字" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="设置密码" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">简介</label>
            <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="一句话介绍自己" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400" />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-400 text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          已有账号？<Link href="/login" className="text-blue-400">去登录</Link>
        </p>
      </div>
    </div>
  )
}
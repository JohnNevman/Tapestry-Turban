'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const supabase = createClient()

    // 定义：拿到 auth user 后，去 profiles 表查完整信息
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setUser(data ?? null)
    }

    // ① 页面首次加载：检查当前是否已登录
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchProfile(user.id)
      } else {
        setUser(null)
      }
    })

    // ② 监听登录/登出事件（登录页成功后会触发 SIGNED_IN）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          fetchProfile(session.user.id)
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser])

  return <>{children}</>
}
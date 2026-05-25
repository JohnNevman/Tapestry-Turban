'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/components/ui/toaster'
import { Diary } from '@/types'

export default function DiaryPage() {
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [privacy, setPrivacy] = useState<'private' | 'public'>('private')
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { if (user) loadDiaries() }, [user])

  const loadDiaries = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setDiaries(data || [])
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { toast('请填写标题和内容'); return }
    const supabase = createClient()

    if (editingId) {
      await supabase.from('diaries').update({ title, content, privacy }).eq('id', editingId)
      toast('日记已更新')
    } else {
      await supabase.from('diaries').insert({ user_id: user!.id, title, content, privacy })
      toast('日记已保存')
    }

    setTitle(''); setContent(''); setPrivacy('private'); setEditingId(null)
    loadDiaries()
  }

  const handleEdit = (d: Diary) => {
    setEditingId(d.id); setTitle(d.title); setContent(d.content); setPrivacy(d.privacy)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return
    const supabase = createClient()
    await supabase.from('diaries').delete().eq('id', id)
    toast('已删除')
    loadDiaries()
  }

  if (!user) return <div className="text-center py-16 text-gray-400">请先登录</div>

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <section>
        <h2 className="text-lg font-bold text-center mb-3">我的日记</h2>
        <div className="border-2 border-gray-200 rounded-lg p-3 min-h-[200px] max-h-[240px] overflow-y-auto bg-gray-50">
          {diaries.length ? diaries.map((d) => (
            <div key={d.id} className="bg-white rounded-md p-3 mb-2 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{d.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${d.privacy === 'public' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {d.privacy === 'public' ? '公开' : '私密'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{d.content}</p>
                <p className="text-[10px] text-gray-300 mt-1">{new Date(d.created_at).toLocaleString('zh-CN')}</p>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button onClick={() => handleEdit(d)} className="text-xs text-gray-400 hover:text-blue-400">编辑</button>
                <button onClick={() => handleDelete(d.id)} className="text-xs text-gray-400 hover:text-red-400">删除</button>
              </div>
            </div>
          )) : <div className="text-center py-10 text-gray-400 text-sm">还没有写过日记</div>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-center mb-3">{editingId ? '编辑日记' : '写日记'}</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3.5">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="日记标题" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="今天发生了什么..." className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 min-h-[160px] resize-none" />
          <div className="flex gap-7 justify-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="privacy" value="private" checked={privacy === 'private'} onChange={() => setPrivacy('private')} className="accent-blue-400" />
              🔒 私密
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="privacy" value="public" checked={privacy === 'public'} onChange={() => setPrivacy('public')} className="accent-blue-400" />
              🌐 公开
            </label>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={handleSave} className="px-12 py-3 bg-blue-400 text-white rounded-full text-sm font-semibold hover:opacity-90">
              {editingId ? '更新日记' : '保存日记'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setTitle(''); setContent(''); }} className="px-8 py-3 border border-gray-200 rounded-full text-sm hover:border-blue-400">
                取消
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
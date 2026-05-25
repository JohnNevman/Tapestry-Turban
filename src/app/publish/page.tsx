'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/components/ui/toaster'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
}

export default function PublishPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast((state) => state.toast)
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'publish' | 'manager' | 'drafts'>('publish')

  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  const [drafts, setDrafts] = useState<Post[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsStr, setTagsStr] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'manager' && user) {
      fetchMyPosts()
    }
    if (activeTab === 'drafts' && user) {
      fetchDrafts()
    }
  }, [activeTab, user])

  const fetchMyPosts = async () => {
    if (!user) return
    setLoadingPosts(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      toast('加载列表失败')
    } else {
      setMyPosts(data || [])
    }
    setLoadingPosts(false)
  }

  const fetchDrafts = async () => {
    if (!user) return
    setLoadingDrafts(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })

    if (error) {
      toast('加载草稿失败')
    } else {
      setDrafts(data || [])
    }
    setLoadingDrafts(false)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return

    const { error } = await supabase.from('posts').delete().eq('id', id)

    if (error) {
      toast('删除失败')
    } else {
      toast('删除成功')
      setMyPosts((prev) => prev.filter((post) => post.id !== id))
    }
  }

  const handleDeleteDraft = async (id: string) => {
    if (!confirm('确定删除此草稿？')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      toast('删除失败')
    } else {
      toast('已删除')
      setDrafts((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const handlePublishDraft = async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ status: 'published' })
      .eq('id', id)

    if (error) {
      toast('发布失败')
    } else {
      toast('发布成功')
      setDrafts((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selected])
    selected.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handlePublish = async (asDraft = false) => {
    if (!user) {
      toast('请先登录')
      return
    }
    if (!title.trim()) {
      toast('请填写标题')
      return
    }
    setLoading(true)

    const media: { type: string; url: string }[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
        media.push({ type: file.type.startsWith('video') ? 'video' : 'image', url: publicUrl })
      }
    }

    const tags = tagsStr ? tagsStr.split(/[,，]/).map((t) => t.trim()).filter(Boolean) : []

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        tags,
        media,
        status: asDraft ? 'draft' : 'published',
      })
      .select()
      .single()

    setLoading(false)
    if (error) {
      toast(asDraft ? '保存失败' : '发布失败')
      return
    }

    toast(asDraft ? '已保存到草稿箱' : '发布成功 🎉')
    setTitle('')
    setContent('')
    setTagsStr('')
    setFiles([])
    setPreviews([])

    if (asDraft) {
      setActiveTab('drafts')
    } else {
      router.push(`/post/${data.id}`)
    }
  }

  if (!user) return <div className="text-center py-16 text-gray-400">请先登录</div>

  return (
    <div className="max-w-[560px] mx-auto">
      <div className="flex justify-center border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('manager')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'manager' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          发布管理
          {activeTab === 'manager' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
        </button>

        <button
          onClick={() => setActiveTab('publish')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'publish' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          发布内容
          {activeTab === 'publish' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'drafts' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          草稿箱
          {activeTab === 'drafts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'publish' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            onClick={() => document.getElementById('file-input')?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition mb-4"
          >
            <p className="text-2xl text-gray-400 mb-1">+</p>
            <p className="text-sm text-gray-400">拖拽文件到此或点击上传</p>
            <p className="text-xs text-gray-300 mt-1">支持图片和视频</p>
            <input id="file-input" type="file" hidden multiple accept="image/*,video/*" onChange={handleFiles} />
          </div>

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {previews.map((p, i) => (
                <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeFile(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">标题</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给作品起个标题" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">内容</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="分享你的创作过程、提示词、心得..." className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400 min-h-[80px] resize-y" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">标签（逗号分隔）</label>
              <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="AI绘画, Midjourney" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400" />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => handlePublish(true)}
              disabled={loading}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              存为草稿
            </button>
            <button
              onClick={() => handlePublish(false)}
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-400 text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      ) : activeTab === 'manager' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-medium mb-4">我的作品 ({myPosts.length})</h3>

          {loadingPosts ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : myPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <p>暂无发布内容</p>
              <button onClick={() => setActiveTab('publish')} className="mt-2 text-blue-500 text-sm underline">
                去发布一篇
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {myPosts.map((post) => (
                <li key={post.id} className="group border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/post/${post.id}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                      {post.title || '无标题'}
                    </Link>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                    {post.content || '无内容摘要'}
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                    <Link
                      href={`/publish/edit/${post.id}`}
                      className="text-xs text-gray-600 hover:text-blue-600 px-3 py-1 hover:bg-gray-50 rounded"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={(e) => handleDelete(post.id, e)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-medium mb-4">草稿箱 ({drafts.length})</h3>

          {loadingDrafts ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <p>暂无草稿</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {drafts.map((draft) => (
                <li key={draft.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 line-clamp-1">
                      {draft.title || '无标题'}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                    {draft.content || '无内容'}
                  </p>
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handlePublishDraft(draft.id)}
                      className="text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                    >
                      发布
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
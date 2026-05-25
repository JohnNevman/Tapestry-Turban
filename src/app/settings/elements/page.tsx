'use client'

import { useState, useRef } from 'react'
import { useVideoBgStore } from '@/stores/video-bg-store'

const pages = [
  { path: '/', label: '发现' },
  { path: '/publish', label: '发布' },
  { path: '/notify', label: '通知' },
  { path: '/skill', label: 'skill' },
  { path: '/diary', label: '日记' },
  { path: '/diary-square', label: '日记广场' },
  { path: '*', label: '全局默认' },
]

export default function ElementSettingsPage() {
  const { videoMap, setVideo, removeVideo } = useVideoBgStore()
  const [editingPath, setEditingPath] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 👇 只预览、不修改、不压缩、不改时长！
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(file)) // 只生成预览，不动视频！
    }
  }

  // 👇 直接上传原文件！不做任何处理！
  const upload = async () => {
    if (editingPath === null) return
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file) // 直接上传原视频！

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (data.url) {
        setVideo(editingPath, data.url)
      }
    } finally {
      setUploading(false)
      closeModal()
    }
  }

  const closeModal = () => {
    setEditingPath(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-lg font-bold mb-2">元素设置</h1>
      <p className="text-sm text-gray-400 mb-6">为每个页面设置底层背景视频</p>

      <div className="space-y-3">
        {pages.map(({ path, label }) => (
          <div
            key={path}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              {videoMap[path] ? (
                <p className="text-xs text-gray-400 truncate mt-0.5">{videoMap[path]}</p>
              ) : (
                <p className="text-xs text-gray-300 mt-0.5">未设置</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setEditingPath(path)}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-500"
              >
                {videoMap[path] ? '修改' : '设置'}
              </button>
              {videoMap[path] && (
                <button
                  onClick={() => removeVideo(path)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-400"
                >
                  移除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingPath !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl w-96 p-6 shadow-xl">
            <h3 className="font-bold text-sm mb-1">设置背景视频</h3>
            <p className="text-xs text-gray-400 mb-4">
              {pages.find((p) => p.path === editingPath)?.label} 页面
            </p>

            {preview && (
              <video
                src={preview}
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-lg mb-3 max-h-40 object-cover"
              />
            )}

            <input
              ref={fileRef}
              type="file"
              accept="video/mp4"
              onChange={handleFileChange}
              className="w-full text-sm"
            />

            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 py-2 border rounded-lg">
                取消
              </button>
              <button
                onClick={upload}
                disabled={uploading || !preview}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                {uploading ? '上传中...' : '上传并保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'

const DEFAULT_LABELS = [
  '核心技能', '副技能', '天赋特长', '隐藏属性', '被动光环', '终极大招',
]

interface Skill {
  name: string
  description: string
}

export default function SkillPage() {
  const [skills, setSkills] = useState<(Skill | null)[]>(
    Array(6).fill(null)
  )
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [form, setForm] = useState<Skill>({ name: '', description: '' })

  const openAdd = () => {
    setSkills([...skills, null])
    setForm({ name: '', description: '' })
    setEditingIndex(skills.length)
  }

  const openEdit = (index: number) => {
    setForm(skills[index] || { name: '', description: '' })
    setEditingIndex(index)
  }

  const save = () => {
    if (editingIndex === null) return
    if (!form.name.trim()) return
    const next = [...skills]
    next[editingIndex] = { ...form }
    setSkills(next)
    setEditingIndex(null)
  }

  const remove = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const getLabel = (index: number) =>
    index < DEFAULT_LABELS.length ? DEFAULT_LABELS[index] : `技能 ${index + 1}`

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-6">
        ✨ 我的技能面板
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {skills.map((skill, i) => (
          <div
            key={i}
            onClick={() => !skill && openEdit(i)}
            className={`
              relative rounded-2xl border-2 border-dashed p-5 min-h-[160px]
              flex flex-col items-center justify-center text-center
              transition-all duration-200
              ${skill
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
              }
            `}
          >
            {skill ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(i) }}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  ✕
                </button>
                <p className="text-xs text-gray-400 mb-1">{getLabel(i)}</p>
                <p className="font-bold text-sm text-gray-800">{skill.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                  {skill.description}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(i) }}
                  className="mt-2 text-xs text-blue-400 hover:underline"
                >
                  编辑
                </button>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <span className="text-xl text-gray-300">+</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{getLabel(i)}</p>
                <p className="text-[11px] text-gray-300 mt-0.5">点击填入</p>
              </>
            )}
          </div>
        ))}

        {/* 添加更多 */}
        <div
          onClick={openAdd}
          className="rounded-2xl border-2 border-dashed border-gray-200 bg-white
            hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer
            p-5 min-h-[160px] flex flex-col items-center justify-center text-center
            transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <span className="text-xl text-gray-300">+</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">添加更多</p>
        </div>
      </div>

      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-80 p-6">
            <h3 className="font-bold text-sm mb-4">
              {getLabel(editingIndex)}
            </h3>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="技能名称"
              maxLength={20}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-blue-400"
            />

            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="简单描述一下这个技能..."
              maxLength={100}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-blue-400"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditingIndex(null)}
                className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={save}
                disabled={!form.name.trim()}
                className="flex-1 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'

export default async function DiarySquarePage() {
  const supabase = await createClient()
  const { data: diaries } = await supabase
    .from('diaries')
    .select('*, profiles(*)')
    .eq('privacy', 'public')
    .order('created_at', { ascending: false })

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-center mb-4">日记广场</h2>
      {diaries?.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {diaries.map((d) => (
            <div key={d.id} className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 inline-flex items-center justify-center text-white text-[8px]">
                  {d.profiles?.username?.[0] || '?'}
                </span>
                <span className="text-sm font-semibold">{d.profiles?.username || '匿名'}</span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {new Date(d.created_at).toLocaleString('zh-CN')}
                </span>
              </div>
              <h3 className="text-base font-semibold mb-2">{d.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{d.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 text-sm">暂无公开日记</div>
      )}
    </div>
  )
}
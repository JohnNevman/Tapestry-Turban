import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: '没有文件' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dir = path.join(process.cwd(), 'public', 'videos')
  await mkdir(dir, { recursive: true })

  const filename = `bg-${Date.now()}.mp4`
  await writeFile(path.join(dir, filename), buffer)

  return NextResponse.json({ url: `/videos/${filename}` })
}
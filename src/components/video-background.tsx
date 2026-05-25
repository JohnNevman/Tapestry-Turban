'use client'

import { usePathname } from 'next/navigation'
import { useVideoBgStore } from '@/stores/video-bg-store'

export function VideoBackground() {
  const pathname = usePathname()
  const videoMap = useVideoBgStore((s) => s.videoMap)

  const videoUrl = videoMap[pathname] || videoMap['*']
  if (!videoUrl) return null

  return (
    <video
      key={videoUrl}
      autoPlay
      loop
      muted
      playsInline
      className="fixed inset-0 w-full h-full object-cover -z-10 pointer-events-none"
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  )
}
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VideoBgState {
  videoMap: Record<string, string> // pathname -> video URL
  setVideo: (path: string, url: string) => void
  removeVideo: (path: string) => void
}

export const useVideoBgStore = create<VideoBgState>()(
  persist(
    (set) => ({
      videoMap: {},
      setVideo: (path, url) =>
        set((s) => ({ videoMap: { ...s.videoMap, [path]: url } })),
      removeVideo: (path) =>
        set((s) => {
          const next = { ...s.videoMap }
          delete next[path]
          return { videoMap: next }
        }),
    }),
    { name: 'video-bg' }
  )
)
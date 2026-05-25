'use client'

import { create } from 'zustand'
import { useEffect, useState } from 'react'

interface ToastState {
  message: string
  show: boolean
  toast: (msg: string) => void
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  show: false,
  toast: (msg) => {
    set({ message: msg, show: true })
    setTimeout(() => set({ show: false }), 2000)
  },
}))

export function Toaster() {
  const { message, show } = useToast()

  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white px-7 py-3.5 rounded-lg text-sm z-[9999] pointer-events-none transition-all duration-300 ${
        show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
    >
      {message}
    </div>
  )
}
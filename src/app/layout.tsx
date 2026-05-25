import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { VideoBackground } from '@/components/video-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '猫眼螺 - AI创作社区',
  description: 'AI创作分享社区',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-transparent`}>
        <AuthProvider>
          <VideoBackground />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-40 flex flex-col">
              <Navbar />
              <main className="flex-1 max-w-[1100px] w-full mx-auto p-4">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
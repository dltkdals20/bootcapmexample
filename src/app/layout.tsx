import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: '부트캠프 교육생 관리',
  description: '데이터분석 부트캠프 5기 교육생 상태 관리 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-60 min-h-screen bg-slate-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

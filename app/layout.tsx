import type { Metadata } from 'next'
import { AuthProvider } from '@/components/Auth/AuthProvider'
import Navbar from '@/components/Layout/Navbar'
import './globals.css'
import '../styles/indicators.css'

export const metadata: Metadata = {
  title: '将棋-チェス ハイブリッドゲーム',
  description: '将棋とチェスを組み合わせたオンライン対戦ゲーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}

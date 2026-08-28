import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '一条魚代購',
  description: '即時現場連線・LINE 認證搶單系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )
}

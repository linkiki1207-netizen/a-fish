'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function GoRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const to = searchParams.get('to') || '/'

  useEffect(() => {
    // 檢查是否為 LINE 內建瀏覽器，若是則加上強制外開參數重新導向
    const ua = navigator.userAgent || ''
    const isLine = ua.indexOf('Line') > -1

    const targetUrl = to.startsWith('http') ? to : `${window.location.origin}${to}`

    if (isLine) {
      // 透過 location.href 帶上 ?openExternalBrowser=1 強制外部開啟
      const separator = targetUrl.includes('?') ? '&' : '?'
      window.location.href = `${targetUrl}${separator}openExternalBrowser=1`
    } else {
      router.replace(to)
    }
  }, [to, router])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">
      正在為您開啟專屬瀏覽器...
    </div>
  )
}

export default function GoRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-500 flex items-center justify-center text-xs">載入中...</div>}>
      <GoRedirectContent />
    </Suspense>
  )
}
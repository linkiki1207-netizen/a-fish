import React from 'react'
import Link from 'next/link'
import { Zap, Package } from 'lucide-react'

export default function AdminIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">歡迎回來，管理員！</h1>
        <p className="text-xs text-slate-400 mt-1">請從左側導覽列選擇管理功能，或點選下方快捷入口：</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Link
          href="/admin/orders"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl transition space-y-2 block"
        >
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">📦 訂單管理與 7-11 整單</h2>
          <p className="text-xs text-slate-400">核對買家門市、確認匯款與列印出貨單。</p>
        </Link>

        <Link
          href="/admin/quick-add"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl transition space-y-2 block"
        >
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">⚡️ 一鍵快速上架</h2>
          <p className="text-xs text-slate-400">快速建立連線專案並發布商品。</p>
        </Link>
      </div>
    </div>
  )
}

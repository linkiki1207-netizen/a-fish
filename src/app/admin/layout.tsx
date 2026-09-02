'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Package, Tag, ShoppingBag, LayoutDashboard, Layers, DollarSign, Settings } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/quick-add', label: '⚡️ 一鍵快速上架', icon: Zap, isSpecial: true },
    { href: '/admin/orders', label: '訂單管理', icon: Package },
    { href: '/admin/products', label: '商品管理', icon: Tag },
    { href: '/admin/batches', label: '批次管理', icon: Layers },
    { href: '/admin/purchasing', label: '採購彙總', icon: ShoppingBag },
    { href: '/admin/revenue', label: '營收與毛利戰情室', icon: DollarSign },
    { href: '/admin/settings', label: '全站設定與運費', icon: Settings }, // 🟢 新增全站設定導覽
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between md:sticky md:top-0 md:h-screen">
        <div className="space-y-6">
          <div>
            <Link href="/admin" className="block group">
              <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-2 group-hover:text-emerald-400 transition">
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                一条魚後台管理
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">即時現場連線搶單系統</p>
            </Link>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                      : item.isSpecial
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive || item.isSpecial ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Admin Control Center
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  MessageSquare, ShieldCheck, ArrowLeft, 
  Package, User, Phone, MapPin, LogOut 
} from 'lucide-react'
import Link from 'next/link'

interface LineUser {
  userId: string
  displayName: string
  pictureUrl?: string
}

interface UserProfile {
  buyer_name: string
  phone: string
  store_name: string
}

function LoginCenterContent() {
  const [lineUser, setLineUser] = useState<LineUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [manualInput, setManualInput] = useState('')
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    buyer_name: '',
    phone: '',
    store_name: ''
  })
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    handleAuthCheck()
  }, [])

  const handleAuthCheck = async () => {
    setLoading(true)
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const userParam = urlParams.get('line_user')

        if (userParam) {
          try {
            const userData: LineUser = JSON.parse(decodeURIComponent(userParam))
            saveSession(userData)
            window.history.replaceState(null, '', window.location.pathname)
            return
          } catch (e) {
            console.error('Parse user param error:', e)
          }
        }
      }

      const saved = localStorage.getItem('fish_line_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        setLineUser(parsed)
        loadProfile(parsed.userId, parsed.displayName)
        fetchOrders(parsed.displayName)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveSession = (user: LineUser) => {
    localStorage.setItem('fish_line_user', JSON.stringify(user))
    setLineUser(user)
    loadProfile(user.userId, user.displayName)
    fetchOrders(user.displayName)
  }

  const loadProfile = (userId: string, defaultName: string) => {
    const saved = localStorage.getItem(`fish_profile_${userId}`)
    if (saved) {
      setUserProfile(JSON.parse(saved))
    } else {
      setUserProfile((prev) => ({ ...prev, buyer_name: defaultName }))
    }
  }

  // 🟢 點擊按鈕直接觸發跳轉 LINE
  const handleLineRedirect = () => {
    const channelId = '2011277163'
    const redirectUri = encodeURIComponent('https://a-fish.vercel.app/api/auth/line/callback')
    const state = Math.random().toString(36).substring(2, 15)
    
    const targetUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid`
    
    window.location.href = targetUrl
  }

  const handleManualBind = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    const mockUser: LineUser = {
      userId: `user_${Date.now()}`,
      displayName: manualInput.trim(),
    }
    saveSession(mockUser)
    setManualInput('')
  }

  const handleLogout = () => {
    localStorage.removeItem('fish_line_user')
    setLineUser(null)
    setOrders([])
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineUser) return
    setSaving(true)
    localStorage.setItem(`fish_profile_${lineUser.userId}`, JSON.stringify(userProfile))
    setSavedMsg(true)
    setSaving(false)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  const fetchOrders = async (lineName: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('line_name', lineName)
      .order('created_at', { ascending: false })

    if (data) setOrders(data)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm">
        載入登入中心中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> 返回連線商場
          </Link>
          <span className="text-xs text-slate-500">一条魚代購・會員登入中心</span>
        </div>

        {!lineUser ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-[#06C755]/10 border border-[#06C755]/20 rounded-3xl flex items-center justify-center mx-auto text-[#06C755]">
              <MessageSquare className="w-8 h-8 fill-[#06C755]" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-white">登入 / 綁定 LINE 帳號</h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                綁定 LINE 後，系統將自動歸戶您的連線搶單紀錄，並在採買完成後第一時間向您通知！
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleLineRedirect}
                className="w-full py-3.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-white inline mr-1" />
                使用 LINE 帳號一鍵綁定登入
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-xs text-slate-500 font-medium">或輸入 LINE 暱稱直接綁定</span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <form onSubmit={handleManualBind} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="請輸入您的 LINE 暱稱 (例如: 星妤)"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition border border-slate-700"
                >
                  確認綁定此暱稱
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                {lineUser.pictureUrl ? (
                  <img
                    src={lineUser.pictureUrl}
                    alt={lineUser.displayName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">
                    {lineUser.displayName[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{lineUser.displayName}</h2>
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> LINE 已綁定
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">🎉 歡迎回來！您的帳號已就緒，可隨時前往商場搶單。</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-400 p-2 rounded-xl border border-slate-800 hover:border-rose-500/30 transition"
                title="解除綁定 / 登出"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="w-4 h-4 text-emerald-400" />
                常用收件資料設定（喊單結帳時自動帶入）
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">真實姓名</label>
                  <input
                    type="text"
                    required
                    placeholder="例：陳小明"
                    value={userProfile.buyer_name}
                    onChange={(e) => setUserProfile({ ...userProfile, buyer_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">聯絡手機</label>
                  <input
                    type="tel"
                    required
                    placeholder="例：0912345678"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">常用 7-11 門市與店號</label>
                  <input
                    type="text"
                    required
                    placeholder="例：7-11 欣漢門市 (123456)"
                    value={userProfile.store_name}
                    onChange={(e) => setUserProfile({ ...userProfile, store_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs shadow-lg shadow-emerald-900/30 mt-2"
                >
                  {saving ? '儲存中...' : savedMsg ? '✓ 常用資料已儲存！' : '儲存常用收件資料'}
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Package className="w-4 h-4 text-emerald-400" />
                我的連線喊單明細 ({orders.length})
              </h3>

              {orders.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">目前尚未有任何連線喊單紀錄</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">{new Date(ord.created_at).toLocaleString('zh-TW', { hour12: false })}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.status === 'bought' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ord.status === 'bought' ? '✓ 已採買到' : '⚡ 現場搶單中'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {ord.items?.map((it: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span>{it.name} {it.selectedVariant ? `(${it.selectedVariant})` : ''}</span>
                            <span className="font-mono text-emerald-400">NT$ {it.price} × {it.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                        <span className="text-slate-400">總金額</span>
                        <span className="text-emerald-400 font-mono">
                          NT$ {ord.total_amount?.toLocaleString() || ord.total_price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/"
              className="block w-full text-center py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl text-xs transition border border-slate-700"
            >
              ← 前往連線商場搶單
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-500 flex items-center justify-center text-sm">載入中...</div>}>
      <LoginCenterContent />
    </Suspense>
  )
}

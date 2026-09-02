'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Save, Check, Truck, Megaphone, Ticket, Plus, Trash2 } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  discount_amount: number
  min_spend: number
  is_active: boolean
}

export default function AdminSettingsPage() {
  const [shippingFee, setShippingFee] = useState('60')
  const [threshold, setThreshold] = useState('2000')
  const [isFreeShippingAll, setIsFreeShippingAll] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  
  // 優惠券狀態
  const [couponList, setCouponList] = useState<Coupon[]>([])
  const [newCode, setNewCode] = useState('')
  const [newDiscount, setNewDiscount] = useState('')
  const [newMinSpend, setNewMinSpend] = useState('0')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchSettingsAndCoupons()
  }, [])

  const fetchSettingsAndCoupons = async () => {
    setLoading(true)
    try {
      // 1. 抓取全站設定
      const { data: settingData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (settingData) {
        setShippingFee(String(settingData.shipping_fee ?? 60))
        setThreshold(String(settingData.free_shipping_threshold ?? 2000))
        setIsFreeShippingAll(Boolean(settingData.is_free_shipping_all))
        setAnnouncement(settingData.announcement || '')
      }

      // 2. 抓取優惠券列表
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (couponData) setCouponList(couponData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          shipping_fee: Number(shippingFee) || 0,
          free_shipping_threshold: Number(threshold) || 0,
          is_free_shipping_all: isFreeShippingAll,
          announcement: announcement.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)

      if (error) throw error

      setSuccessMsg('🎉 全站設定已成功儲存！')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      alert(`儲存失敗：${err.message || '未知錯誤'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode.trim() || !newDiscount) {
      alert('請填寫優惠碼與折抵金額')
      return
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert([{
          code: newCode.trim().toUpperCase(),
          discount_amount: Number(newDiscount) || 0,
          min_spend: Number(newMinSpend) || 0,
          is_active: true
        }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setCouponList([data[0], ...couponList])
        setNewCode('')
        setNewDiscount('')
        setNewMinSpend('0')
        setSuccessMsg('🎟️ 成功新增優惠券！')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err: any) {
      console.error(err)
      alert(`新增優惠券失敗：${err.message || '代碼可能已重複'}`)
    }
  }

  const handleToggleCouponActive = async (coupon: Coupon) => {
    try {
      const nextActive = !coupon.is_active
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: nextActive })
        .eq('id', coupon.id)

      if (error) throw error

      setCouponList(couponList.map(c => c.id === coupon.id ? { ...c, is_active: nextActive } : c))
    } catch (err) {
      console.error(err)
      alert('更新優惠券狀態失敗')
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('確定要刪除這張優惠券嗎？')) return
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error
      setCouponList(couponList.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
      alert('刪除失敗')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-emerald-400" />
          全站設定、運費與優惠券管理
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          在此控制運費門檻、全站免運活動、公告，以及隨時發放與管理折扣優惠券。
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">載入設定中...</div>
      ) : (
        <div className="space-y-6">
          {/* 運費與公告設定表單 */}
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Truck className="w-4 h-4 text-emerald-400" /> 運費與滿額免運邏輯
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">固定運費金額 (NT$)</label>
                  <input
                    type="number"
                    required
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">滿額免運門檻 (NT$)</label>
                  <input
                    type="number"
                    required
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={isFreeShippingAll}
                    onChange={(e) => setIsFreeShippingAll(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">🔥 開啟「全站限時免運」活動</span>
                    <span className="text-[11px] text-slate-400">勾選後，不管買家買多少金額，結帳時全部直接免運費！</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Megaphone className="w-4 h-4 text-emerald-400" /> 首頁公告與橫幅宣傳
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">全站置頂公告文字</label>
                <textarea
                  rows={2}
                  placeholder="例如：🎉 歡慶開團，全館滿 2000 免運中！"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Save className="w-4 h-4" />
                {saving ? '儲存中...' : '儲存運費與公告設定'}
              </button>
            </div>
          </form>

          {/* 優惠券管理區塊 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Ticket className="w-4 h-4 text-emerald-400" /> 優惠券 / 折扣碼管理
            </h2>

            {/* 新增優惠券表單 */}
            <form onSubmit={handleAddCoupon} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-emerald-400">➕ 發行新優惠券</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="優惠代碼 (例: FISH88)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 uppercase focus:outline-none focus:border-emerald-400 font-mono"
                />
                <input
                  type="number"
                  required
                  placeholder="折抵金額 (例: 100)"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="number"
                  placeholder="最低消費門檻 (預設0)"
                  value={newMinSpend}
                  onChange={(e) => setNewMinSpend(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> 建立並發行優惠券
              </button>
            </form>

            {/* 現有優惠券列表 */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-300">🎟️ 目前發行的優惠券 ({couponList.length})</div>
              {couponList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">目前沒有任何優惠券</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {couponList.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                          {c.code}
                        </span>
                        <div>
                          <div className="text-emerald-400 font-bold">折抵 NT$ {c.discount_amount}</div>
                          <div className="text-[11px] text-slate-500">滿 NT$ {c.min_spend} 可使用</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCouponActive(c)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-[11px] ${
                            c.is_active
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {c.is_active ? '啟用中' : '已停用'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
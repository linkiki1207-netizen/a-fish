'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Layers, Plus, Calendar, Check, AlertCircle, RotateCcw, CheckCircle2, Eye, X, Package, ShoppingCart, Search, Edit3 } from 'lucide-react'

interface Batch {
  id: string
  name: string
  status?: 'active' | 'ended'
  created_at: string
}

interface ProductItem {
  id: string
  name: string
  price: number
  stock?: number
  image_url?: string | null
  category?: string
  is_active?: boolean
  batch_id?: string | null
  batch_name?: string
}

export default function AdminBatchesPage() {
  const router = useRouter()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [newBatchName, setNewBatchName] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'ended'>('active')
  
  const [searchQuery, setSearchQuery] = useState('')

  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null)
  const [batchProducts, setBatchProducts] = useState<ProductItem[]>([])
  const [batchOrders, setBatchOrders] = useState<any[]>([])
  const [loadingBatchData, setLoadingBatchData] = useState(false)
  const [modalTab, setModalTab] = useState<'products' | 'orders'>('products')

  // 編輯批次的 Modal 狀態
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [editBatchName, setEditBatchName] = useState('')
  const [updatingBatch, setUpdatingBatch] = useState(false)

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setBatches(data)
    } catch (err) {
      console.error(err)
      alert('載入批次失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatchName.trim()) {
      alert('請輸入批次名稱')
      return
    }

    try {
      const { data, error } = await supabase
        .from('batches')
        .insert([{ name: newBatchName.trim(), status: 'active' }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setBatches([data[0], ...batches])
        setNewBatchName('')
        setSuccessMsg('🎉 成功建立新批次！')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      console.error(err)
      alert('建立批次失敗')
    }
  }

  const handleOpenEditBatch = (batch: Batch) => {
    setEditingBatch(batch)
    setEditBatchName(batch.name || '')
  }

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBatch || !editBatchName.trim()) return

    setUpdatingBatch(true)
    try {
      const newName = editBatchName.trim()
      const oldName = editingBatch.name

      const { error: batchErr } = await supabase
        .from('batches')
        .update({ name: newName })
        .eq('id', editingBatch.id)

      if (batchErr) throw batchErr

      await supabase
        .from('products')
        .update({ batch_name: newName })
        .eq('batch_id', editingBatch.id)

      await supabase
        .from('products')
        .update({ batch_name: newName })
        .eq('batch_name', oldName)

      setBatches(batches.map(b => b.id === editingBatch.id ? { ...b, name: newName } : b))
      setSuccessMsg('🎉 批次名稱修改成功！')
      setTimeout(() => setSuccessMsg(''), 3000)
      setEditingBatch(null)
    } catch (err: any) {
      console.error(err)
      alert(`修改失敗：${err.message || '未知錯誤'}`)
    } finally {
      setUpdatingBatch(false)
    }
  }

  const handleEndBatch = async (batchId: string, batchName: string) => {
    if (!confirm(`確定要結束批次「${batchName}」嗎？\n系統將自動把此批次結束，並將該批次所有商品全數下架！`)) return

    try {
      const { error: batchErr } = await supabase
        .from('batches')
        .update({ status: 'ended' })
        .eq('id', batchId)

      if (batchErr) throw batchErr

      await supabase
        .from('products')
        .update({ is_active: false })
        .eq('batch_id', batchId)

      await supabase
        .from('products')
        .update({ is_active: false })
        .eq('batch_name', batchName)

      setBatches(batches.map(b => b.id === batchId ? { ...b, status: 'ended' } : b))
      setSuccessMsg(`🏁 批次「${batchName}」已結束，相關商品已全數下架！`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error(err)
      alert('結束批次失敗')
    }
  }

  const handleRestartBatch = async (batchId: string, batchName: string) => {
    if (!confirm(`確定要重新啟用批次「${batchName}」嗎？\n系統將自動重新啟用此批次，並將該批次所有商品恢復至連線批次！`)) return

    try {
      const { error } = await supabase
        .from('batches')
        .update({ status: 'active' })
        .eq('id', batchId)

      if (error) throw error

      await supabase
        .from('products')
        .update({ is_active: true, category: 'batch' })
        .eq('batch_id', batchId)

      await supabase
        .from('products')
        .update({ is_active: true, category: 'batch' })
        .eq('batch_name', batchName)

      setBatches(batches.map(b => b.id === batchId ? { ...b, status: 'active' } : b))
      setSuccessMsg(`🚀 批次「${batchName}」已重新啟用，相關商品已全數回到連線批次！`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error(err)
      alert('重新啟用失敗')
    }
  }

  const handleOpenBatchOverview = async (batch: Batch) => {
    setViewingBatch(batch)
    setLoadingBatchData(true)
    setModalTab('products')
    try {
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .or(`batch_id.eq.${batch.id},batch_name.eq.${batch.name}`)
        .order('created_at', { ascending: false })

      setBatchProducts(prodData || [])

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .or(`batch_id.eq.${batch.id},note.ilike.%${batch.name}%`)
        .order('created_at', { ascending: false })

      setBatchOrders(orderData || [])
    } catch (err) {
      console.error(err)
      alert('載入批次統整資料失敗')
    } finally {
      setLoadingBatchData(false)
    }
  }

  const filteredBatches = batches.filter(b => {
    const matchesTab = activeTab === 'active' ? (!b.status || b.status === 'active') : (b.status === 'ended')
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const activeBatchesCount = batches.filter(b => !b.status || b.status === 'active').length
  const endedBatchesCount = batches.filter(b => b.status === 'ended').length

  const totalBatchRevenue = batchOrders
    .filter(ord => ord.status !== 'archived')
    .reduce((sum, ord) => sum + (ord.total_amount || 0), 0)

  const getProductStats = (productName: string) => {
    let buyerCount = 0
    let totalQty = 0
    let boughtQty = 0
    let failedQty = 0
    const uniqueBuyers = new Set()

    batchOrders.forEach(ord => {
      if (ord.items && Array.isArray(ord.items)) {
        ord.items.forEach((it: any) => {
          if (it.name === productName) {
            uniqueBuyers.add(ord.line_name || ord.buyer_name)
            const qty = it.quantity || 1
            totalQty += qty
            if (it.status === 'bought') boughtQty += qty
            else if (it.status === 'failed') failedQty += qty
          }
        })
      }
    })

    buyerCount = uniqueBuyers.size
    return { buyerCount, totalQty, boughtQty, failedQty }
  }

  const groupedBatchOrders = () => {
    const grouped: Record<string, {
      key: string
      line_name: string
      order_ids: string[]
      latest_time: string
      total_amount: number
      pay_status: string
      status: string
      items: any[]
    }> = {}

    batchOrders.forEach((ord) => {
      const lineName = ord.line_name || ord.buyer_name || '買家'
      const batchKey = viewingBatch ? viewingBatch.id : 'BATCH'
      const groupKey = `${lineName}_${batchKey}`

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          key: groupKey,
          line_name: lineName,
          order_ids: [ord.id],
          latest_time: ord.created_at,
          total_amount: 0,
          pay_status: ord.pay_status || 'unpaid',
          status: ord.status || 'pending_buy',
          items: []
        }
      } else {
        if (!grouped[groupKey].order_ids.includes(ord.id)) {
          grouped[groupKey].order_ids.push(ord.id)
        }
      }

      if (ord.items && Array.isArray(ord.items)) {
        ord.items.forEach((it: any) => {
          grouped[groupKey].items.push(it)
          if (it.status !== 'failed') {
            grouped[groupKey].total_amount += (it.price || 0) * (it.quantity || 1)
          }
        })
      }
    })

    return Object.values(grouped)
  }

  const currentGroupedOrders = groupedBatchOrders()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-emerald-400" />
          連線批次管理中心
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          管理進行中的代購批次或檢視過去式存檔，點擊批次總覽可同步查看該批次所有商品與訂單。
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* 新增批次表單 */}
      <form onSubmit={handleCreateBatch} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-400" /> 建立新連線批次
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="例如：2026/09 東京連線團、9/1-9/10 英國連線..."
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 建立批次
          </button>
        </div>
      </form>

      {/* 分類切換標籤 */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'active'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          🔥 進行中的批次 ({activeBatchesCount})
        </button>
        <button
          onClick={() => setActiveTab('ended')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'ended'
              ? 'bg-slate-800 border-slate-600 text-slate-200 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          📦 過去式 / 已結束批次 ({endedBatchesCount})
        </button>
      </div>

      {/* 批次列表區塊 */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" /> 
            {activeTab === 'active' ? '進行中批次列表' : '過去式批次存檔'}
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋批次名稱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 placeholder:text-slate-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">載入批次中...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-600 mx-auto" />
            <div className="text-xs text-slate-500">
              {searchQuery ? `找不到符合「${searchQuery}」的批次紀錄。` : '目前沒有相關的批次。'}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredBatches.map((b) => (
              <div key={b.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    ✈️ {b.name}
                    {b.status === 'ended' && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">已結束</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 建立時間：{new Date(b.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditBatch(b)}
                    className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> 編輯
                  </button>

                  {activeTab === 'active' ? (
                    <button
                      onClick={() => handleEndBatch(b.id, b.name)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> 結束批次
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestartBatch(b.id, b.name)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 重新啟用
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenBatchOverview(b)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> 批次總覽
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 編輯批次名稱彈窗 */}
      {editingBatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateBatch} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                編輯批次名稱
              </h3>
              <button type="button" onClick={() => setEditingBatch(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">批次名稱</label>
              <input
                type="text"
                required
                value={editBatchName}
                onChange={(e) => setEditBatchName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBatch(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={updatingBatch}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                {updatingBatch ? '儲存中...' : '儲存修改'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 批次總覽戰情室彈窗 */}
      {viewingBatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  批次「{viewingBatch.name}」營運統整
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  收錄商品共 <span className="text-emerald-400 font-bold">{batchProducts.length}</span> 項 ｜ 相關訂單共 <span className="text-emerald-400 font-bold">{batchOrders.length}</span> 筆 ｜ 總營收：<span className="text-emerald-400 font-bold font-mono">NT$ {totalBatchRevenue.toLocaleString()}</span>
                </p>
              </div>
              <button onClick={() => setViewingBatch(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setModalTab('products')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalTab === 'products'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> 商品明細 ({batchProducts.length})
              </button>
              <button
                onClick={() => setModalTab('orders')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalTab === 'orders'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" /> 相關訂單 ({currentGroupedOrders.length})
              </button>
            </div>

            {loadingBatchData ? (
              <div className="text-center py-16 text-xs text-slate-500">統整資料讀取中...</div>
            ) : modalTab === 'products' ? (
              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {batchProducts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500">此批次目前沒有建立任何商品。</div>
                ) : (
                  batchProducts.map((p) => {
                    const stats = getProductStats(p.name)

                    return (
                      <div key={p.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-[10px]">
                              無圖
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white">{p.name}</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-emerald-400 font-mono font-bold">NT$ {p.price}</span>
                              <span className="text-slate-400">｜</span>
                              <span className="text-slate-300">訂購人數：<strong className="text-white">{stats.buyerCount} 人</strong></span>
                              <span className="text-slate-400">｜</span>
                              <span className="text-slate-300">總喊單：<strong className="text-emerald-400">{stats.totalQty} 件</strong></span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>✓ 已買到：<strong className="text-emerald-400">{stats.boughtQty}</strong></span>
                              <span>✕ 缺貨：<strong className="text-rose-400">{stats.failedQty}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                            p.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {p.is_active ? '上架中' : '已下架'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {currentGroupedOrders.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500">此批次目前沒有任何買家訂單紀錄。</div>
                ) : (
                  currentGroupedOrders.map((ord) => {
                    const isPaid = ord.pay_status === 'paid'

                    return (
                      <div key={ord.key} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                          <div>
                            <span className="font-bold text-white text-sm">{ord.line_name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">最後下單：{new Date(ord.latest_time).toLocaleString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-mono font-black text-sm">NT$ {ord.total_amount?.toLocaleString()}</span>
                            <span className={`block text-[10px] font-bold mt-0.5 ${
                              isPaid ? 'text-blue-400' : 'text-amber-400'
                            }`}>
                              {isPaid ? '✓ 已付款' : '未付款'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {ord.items.map((it: any, iIdx: number) => {
                            const isBought = it.status === 'bought'
                            const isFailed = it.status === 'failed'

                            return (
                              <div key={iIdx} className="flex justify-between items-center text-slate-300 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${isFailed ? 'line-through text-slate-500' : ''}`}>
                                    • {it.name} {it.selectedVariant ? `(${it.selectedVariant})` : ''} × {it.quantity || 1}
                                  </span>
                                  {isBought && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-bold">✓ 買到</span>}
                                  {isFailed && <span className="bg-rose-500/20 text-rose-400 text-[10px] px-1.5 py-0.2 rounded font-bold">✕ 缺貨</span>}
                                </div>
                                <span className={`font-mono ${isFailed ? 'line-through text-slate-500' : 'text-emerald-400 font-bold'}`}>
                                  NT$ {(it.price || 0) * (it.quantity || 1)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
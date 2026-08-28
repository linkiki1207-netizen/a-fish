'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  ShoppingBag, CheckCircle, Search, RefreshCw, 
  UserCheck, XCircle, CheckCheck, RotateCcw, Archive, SlidersHorizontal
} from 'lucide-react'

interface ItemBuyer {
  orderId: string
  buyerName: string
  lineName: string
  quantity: number
  status: 'pending' | 'bought' | 'failed'
  createdAt: string
}

interface AggregatedItem {
  key: string
  productId: string
  name: string
  variant: string
  batch_id: string
  batch_name: string
  totalQty: number
  buyers: ItemBuyer[]
  overallStatus: 'pending' | 'all_bought' | 'all_failed' | 'mixed'
}

interface Batch {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  batch_id?: string
}

export default function PurchaseSummaryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL')
  
  const [viewTab, setViewTab] = useState<'need_buy' | 'purchased_history'>('need_buy')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)

  // 🟢 控制「部分採買數量調整」的彈窗或輸入狀態：key -> 實際買到數量
  const [customQtyMap, setCustomQtyMap] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: batchData } = await supabase
        .from('batches')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (batchData) setBatches(batchData)

      const { data: productData } = await supabase
        .from('products')
        .select('id, name, batch_id')

      if (productData) setProducts(productData)

      // 🟢 確保訂單依照 created_at 升序或降序抓取，我們後續會嚴格依下單時間排序
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true }) // 先搶先贏：由舊到新排序

      if (error) throw error
      if (orderData) setOrders(orderData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resolveBatchName = (ord: any, item?: any): string => {
    if (ord.note) {
      const cleanNote = ord.note.split(' (')[0]
      const found = batches.find(b => b.name === cleanNote)
      if (found) return found.name
      if (cleanNote && cleanNote !== '連線訂單') return cleanNote
    }
    if (item?.batch_name && item.batch_name !== 'DEFAULT' && item.batch_name !== '一般專區') {
      return item.batch_name
    }
    if (ord.batch_id) {
      const found = batches.find(b => b.id === ord.batch_id)
      if (found) return found.name
    }
    return '現貨專區'
  }

  const aggregatedMap: Record<string, AggregatedItem> = {}

  orders.forEach((ord) => {
    if (ord.status === 'completed') return

    if (ord.items && Array.isArray(ord.items)) {
      ord.items.forEach((item: any) => {
        const itemBatchName = resolveBatchName(ord, item)
        const variant = item.selectedVariant || '單一規格'
        const key = `${itemBatchName}_${item.name}_${variant}`
        const itemStatus = item.status || 'pending'

        if (!aggregatedMap[key]) {
          aggregatedMap[key] = {
            key,
            productId: item.id || '',
            name: item.name,
            variant,
            batch_id: item.batch_id || ord.batch_id || 'DEFAULT',
            batch_name: itemBatchName,
            totalQty: 0,
            buyers: [],
            overallStatus: 'pending'
          }
        }

        aggregatedMap[key].totalQty += item.quantity || 1
        aggregatedMap[key].buyers.push({
          orderId: ord.id,
          buyerName: ord.buyer_name || ord.line_name || '買家',
          lineName: ord.line_name || '',
          quantity: item.quantity || 1,
          status: itemStatus,
          createdAt: ord.created_at
        })
      })
    }
  })

  // 🟢 關鍵核心：讓每項商品的買家名單嚴格依照下單時間（created_at）由先到後排序（先搶先贏）
  Object.values(aggregatedMap).forEach((item) => {
    item.buyers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const allBought = item.buyers.every(b => b.status === 'bought')
    const allFailed = item.buyers.every(b => b.status === 'failed')
    const hasPending = item.buyers.some(b => b.status === 'pending')

    if (allBought) item.overallStatus = 'all_bought'
    else if (allFailed) item.overallStatus = 'all_failed'
    else if (!hasPending) item.overallStatus = 'mixed'
    else item.overallStatus = 'pending'
  })

  const aggregatedList = Object.values(aggregatedMap)

  const scopedList = aggregatedList.filter(item => {
    if (viewTab === 'need_buy') {
      return item.overallStatus === 'pending' || item.buyers.some(b => b.status === 'pending')
    } else {
      return item.overallStatus !== 'pending' && !item.buyers.some(b => b.status === 'pending')
    }
  })

  const filteredList = scopedList.filter((item) => {
    const matchBatch = 
      selectedBatch === 'ALL' || 
      item.batch_name.includes(selectedBatch)

    const matchSearch = 
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.variant.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.buyers.some(b => b.lineName.toLowerCase().includes(searchKeyword.toLowerCase()))

    return matchBatch && matchSearch
  })

  // 🟢 支援部分採買數量分配（先搶先贏分配邏輯）
  const handleAllocateQuantity = async (targetItem: AggregatedItem, availableQty: number) => {
    setUpdatingKey(targetItem.key)
    try {
      let remainingQty = availableQty

      // 追蹤每個訂單中該品項的新狀態
      const orderUpdates: Record<string, { items: any[] }> = {}

      // 依照先搶先贏順序配置數量
      targetItem.buyers.forEach((b) => {
        let newBuyerStatus: 'bought' | 'failed' = 'failed'

        if (remainingQty >= b.quantity) {
          newBuyerStatus = 'bought'
          remainingQty -= b.quantity
        } else {
          newBuyerStatus = 'failed' // 數量不足，後面的人分配不到顯示缺貨
        }

        const order = orders.find(o => o.id === b.orderId)
        if (!order || !order.items) return

        if (!orderUpdates[b.orderId]) {
          orderUpdates[b.orderId] = { items: [...order.items] }
        }

        orderUpdates[b.orderId].items = orderUpdates[b.orderId].items.map((it: any) => {
          const itVariant = it.selectedVariant || '單一規格'
          if (it.name === targetItem.name && itVariant === targetItem.variant) {
            return { ...it, status: newBuyerStatus }
          }
          return it
        })
      })

      // 寫回 Supabase 資料庫
      for (const [orderId, data] of Object.entries(orderUpdates)) {
        const order = orders.find(o => o.id === orderId)
        if (!order) continue

        let hasPendingInOrder = false
        let hasValidItemInOrder = false

        data.items.forEach((it: any) => {
          const st = it.status || 'pending'
          if (st === 'pending') hasPendingInOrder = true
          if (st !== 'failed') hasValidItemInOrder = true
        })

        let newOrderStatus = order.status
        if (!hasPendingInOrder) {
          newOrderStatus = hasValidItemInOrder ? 'bought' : 'failed'
        }

        const validTotalAmount = data.items
          .filter((it: any) => it.status !== 'failed')
          .reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1), 0)

        await supabase
          .from('orders')
          .update({
            items: data.items,
            status: newOrderStatus,
            total_amount: validTotalAmount,
            total_price: validTotalAmount
          })
          .eq('id', orderId)
      }

      await fetchData()
    } catch (err) {
      console.error('分配數量失敗:', err)
      alert('操作失敗，請重試')
    } finally {
      setUpdatingKey(null)
    }
  }

  // 傳統整張卡片一鍵更新（全部買到 / 全部缺貨 / 復原）
  const handleBatchUpdateCardStatus = async (targetItem: AggregatedItem, newStatus: 'bought' | 'failed' | 'pending') => {
    setUpdatingKey(targetItem.key)
    try {
      const affectedOrderIds = Array.from(new Set(targetItem.buyers.map(b => b.orderId)))

      for (const orderId of affectedOrderIds) {
        const order = orders.find(o => o.id === orderId)
        if (!order || !order.items) continue

        const updatedItems = order.items.map((it: any) => {
          const itVariant = it.selectedVariant || '單一規格'
          if (it.name === targetItem.name && itVariant === targetItem.variant) {
            return { ...it, status: newStatus }
          }
          return it
        })

        let hasPendingInOrder = false
        let hasValidItemInOrder = false

        updatedItems.forEach((it: any) => {
          const st = it.status || 'pending'
          if (st === 'pending') hasPendingInOrder = true
          if (st !== 'failed') hasValidItemInOrder = true
        })

        let newOrderStatus = order.status
        if (newStatus === 'pending') {
          newOrderStatus = 'pending_buy'
        } else if (!hasPendingInOrder) {
          newOrderStatus = hasValidItemInOrder ? 'bought' : 'failed'
        }

        const validTotalAmount = updatedItems
          .filter((it: any) => it.status !== 'failed')
          .reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1), 0)

        await supabase
          .from('orders')
          .update({
            items: updatedItems,
            status: newOrderStatus,
            total_amount: validTotalAmount,
            total_price: validTotalAmount
          })
          .eq('id', orderId)
      }

      await fetchData()
    } catch (err) {
      console.error('批次更新失敗:', err)
      alert('操作失敗，請重試')
    } finally {
      setUpdatingKey(null)
    }
  }

  const totalRequiredPieces = aggregatedList.reduce((sum, item) => sum + item.totalQty, 0)
  const totalCompletedPieces = aggregatedList
    .filter(i => i.overallStatus !== 'pending' && !i.buyers.some(b => b.status === 'pending'))
    .reduce((sum, item) => sum + item.totalQty, 0)

  const needBuyList = aggregatedList.filter(item => item.overallStatus === 'pending' || item.buyers.some(b => b.status === 'pending'))
  const purchasedHistoryList = aggregatedList.filter(item => item.overallStatus !== 'pending' && !item.buyers.some(b => b.status === 'pending'))

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            現場採購彙總清單 (先搶先贏自動分配)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            買家名單已依下單時間先後排序。若數量不足，可輸入實際買到數量自動分配得標者！
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xs text-slate-400">已採買進度</span>
            <span className="text-emerald-400 font-mono font-bold text-base">
              {totalCompletedPieces} / {totalRequiredPieces} 件
            </span>
          </div>
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            重新整理
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => { setViewTab('need_buy'); setSelectedBatch('ALL'); }}
          className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            viewTab === 'need_buy'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> 尚需採買 ({needBuyList.length})
        </button>

        <button
          onClick={() => { setViewTab('purchased_history'); setSelectedBatch('ALL'); }}
          className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            viewTab === 'purchased_history'
              ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" /> 已採買紀錄 ({purchasedHistoryList.length})
        </button>
      </div>

      <div className="flex gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setSelectedBatch('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedBatch === 'ALL'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          全部 ({scopedList.length})
        </button>
        {batches.map((b) => {
          const count = scopedList.filter(i => i.batch_name.includes(b.name) || b.name.includes(i.batch_name)).length
          if (count === 0) return null
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBatch(b.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedBatch === b.name
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {b.name} ({count})
            </button>
          )
        })}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="搜尋品項名稱、規格或買家姓名..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">載入採買清單中...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-500 text-xs">
          {viewTab === 'need_buy' ? '🎉 太棒了！當前分頁所有品項都已經採買完畢！' : '目前沒有已採買的紀錄'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((item) => {
            const isBought = item.overallStatus === 'all_bought'
            const isFailed = item.overallStatus === 'all_failed'
            const isCompleted = item.overallStatus !== 'pending'
            const isUpdating = updatingKey === item.key
            const currentCustomQty = customQtyMap[item.key] !== undefined ? customQtyMap[item.key] : item.totalQty

            return (
              <div
                key={item.key}
                className={`border rounded-3xl p-5 space-y-4 shadow-xl transition relative overflow-hidden ${
                  isBought
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isFailed
                    ? 'bg-rose-950/20 border-rose-500/40 opacity-75'
                    : isCompleted
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-bold block w-fit mb-1">
                      {item.batch_name}
                    </span>
                    <h3 className={`text-base font-black ${isFailed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.name}
                    </h3>
                    <span className="text-xs text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 mt-1 inline-block font-mono">
                      規格: {item.variant}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] text-slate-400">總喊單數</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                      {item.totalQty}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      訂購買家名單 (依下單時間排序)
                    </span>
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {item.buyers.map((b, bIdx) => (
                      <div
                        key={bIdx}
                        className="bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800/60 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-500 font-mono text-[10px]">#{bIdx + 1}</span>
                          <span className="text-slate-300 truncate max-w-[120px]">{b.lineName}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-emerald-400 font-bold">× {b.quantity}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                            b.status === 'bought'
                              ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                              : b.status === 'failed'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'text-amber-400'
                          }`}>
                            {b.status === 'bought' ? '✓ 買到' : b.status === 'failed' ? '✕ 缺貨' : '搶單中'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🟢 部分採買數量分配設定區 */}
                {viewTab === 'need_buy' && (
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">實買數量:</span>
                    <input
                      type="number"
                      min={0}
                      max={item.totalQty}
                      value={currentCustomQty}
                      onChange={(e) => setCustomQtyMap({
                        ...customQtyMap,
                        [item.key]: Number(e.target.value)
                      })}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-center text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      disabled={isUpdating}
                      onClick={() => handleAllocateQuantity(item, currentCustomQty)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" /> 依序分配
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  {viewTab === 'need_buy' ? (
                    <>
                      <button
                        disabled={isUpdating}
                        onClick={() => handleBatchUpdateCardStatus(item, 'bought')}
                        className="flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer bg-slate-950 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> 全部買到
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() => handleBatchUpdateCardStatus(item, 'failed')}
                        className="flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer bg-slate-950 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30"
                      >
                        <XCircle className="w-3.5 h-3.5" /> 全部缺貨
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleBatchUpdateCardStatus(item, 'pending')}
                      className="w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 返回尚需採買 (復原)
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

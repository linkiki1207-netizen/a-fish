'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  DollarSign, TrendingUp, Package, RefreshCw, Ticket, Truck
} from 'lucide-react'

interface OrderItem {
  id: string
  price: number
  cost?: number
  quantity: number
  status?: string
}

interface Order {
  id: string
  order_no: string
  batch_id?: string
  line_name: string
  note?: string
  total_amount: number
  status: string
  pay_status: string
  items: OrderItem[]
  created_at: string
}

interface Batch {
  id: string
  name: string
}

export default function AdminRevenuePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  const [shippingFeeSetting, setShippingFeeSetting] = useState(60)
  const [thresholdSetting, setThresholdSetting] = useState(2000)
  const [isFreeShippingAllSetting, setIsFreeShippingAllSetting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: settingData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (settingData) {
        setShippingFeeSetting(Number(settingData.shipping_fee) || 60)
        setThresholdSetting(Number(settingData.free_shipping_threshold) || 2000)
        setIsFreeShippingAllSetting(Boolean(settingData.is_free_shipping_all))
      }

      const { data: batchData } = await supabase
        .from('batches')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (batchData) setBatches(batchData)

      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const { data: prodData } = await supabase
        .from('products')
        .select('id, cost')

      const costMap: Record<string, number> = {}
      if (prodData) {
        prodData.forEach((p: any) => {
          costMap[p.id] = Number(p.cost) || 0
        })
      }

      if (orderData) {
        const enrichedOrders = orderData.map((ord: any) => {
          if (ord.items && Array.isArray(ord.items)) {
            ord.items = ord.items.map((it: any) => ({
              ...it,
              cost: it.cost !== undefined ? Number(it.cost) : (costMap[it.id] || 0)
            }))
          }
          return ord
        })
        setOrders(enrichedOrders)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resolveBatchName = (ord: Order): string => {
    if (ord.batch_id) {
      const found = batches.find(b => b.id === ord.batch_id)
      if (found) return found.name
    }
    if (ord.note) {
      const cleanNote = ord.note.split(' (')[0].trim()
      const found = batches.find(b => b.name === cleanNote)
      if (found) return found.name
      if (cleanNote) return cleanNote
    }
    return '各國連線'
  }

  // 處理並彙整訂單資料（計算小計、毛利、優惠折扣、免運吸收成本）
  const processedOrders = orders.map(ord => {
    let discount = 0
    let couponCode = ''
    if (ord.note && ord.note.includes('折抵:')) {
      try {
        const matchCode = ord.note.match(/優惠券:\s*([^,]+)/)
        const matchDisc = ord.note.match(/折抵:\s*([0-9]+)/)
        if (matchCode) couponCode = matchCode[1].trim()
        if (matchDisc) discount = Number(matchDisc[1]) || 0
      } catch (e) {
        console.error(e)
      }
    }

    let subtotal = 0
    let profit = 0
    if (ord.items && Array.isArray(ord.items)) {
      ord.items.forEach(it => {
        if (it.status !== 'failed') {
          const p = it.price || 0
          const c = it.cost || 0
          const q = it.quantity || 1
          subtotal += p * q
          profit += (p - c) * q
        }
      })
    }

    // 計算免運吸收成本：如果商品小計大於0，且符合免運條件，代表這單的 60 元運費是由賣家吸收
    let absorbedShipping = 0
    if (subtotal > 0) {
      if (isFreeShippingAllSetting || subtotal >= thresholdSetting) {
        absorbedShipping = shippingFeeSetting
      }
    }

    const batchName = resolveBatchName(ord)
    return {
      ...ord,
      batch_name: batchName,
      items_subtotal: subtotal,
      discount_amount: discount,
      coupon_code: couponCode,
      absorbed_shipping: absorbedShipping,
      calculated_profit: profit - discount - absorbedShipping // 淨利扣除優惠讓利與免運成本
    }
  })

  const filteredOrders = selectedBatchId === 'ALL' 
    ? processedOrders 
    : processedOrders.filter(ord => ord.batch_id === selectedBatchId || resolveBatchName(ord) === selectedBatchId)

  const totalRevenue = filteredOrders.reduce((sum, ord) => sum + (ord.total_amount || 0), 0)
  const totalProfit = filteredOrders.reduce((sum, ord) => sum + ord.calculated_profit, 0)
  const totalDiscount = filteredOrders.reduce((sum, ord) => sum + ord.discount_amount, 0)
  const totalAbsorbedShipping = filteredOrders.reduce((sum, ord) => sum + ord.absorbed_shipping, 0)
  const totalOrderCount = filteredOrders.length

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            營收與毛利戰情室
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            即時追蹤各個連線批次的總營收、實際淨賺（已扣除優惠讓利與自行吸收之免運成本）。
          </p>
        </div>

        <button onClick={fetchData} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 transition flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 重新整理數據
        </button>
      </div>

      <div className="space-y-3">
        <span className="text-xs text-slate-300 font-bold">選擇要分析的批次：</span>
        <div className="flex gap-2.5 pb-1 overflow-x-auto">
          <button onClick={() => setSelectedBatchId('ALL')} className={`px-4.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer ${selectedBatchId === 'ALL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}>
            全部批次總覽 ({processedOrders.length} 筆)
          </button>
          {batches.map((b) => {
            const count = processedOrders.filter(ord => ord.batch_id === b.id || resolveBatchName(ord) === b.name).length
            return (
              <button key={b.id} onClick={() => setSelectedBatchId(b.id)} className={`px-4.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${selectedBatchId === b.id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}>
                {b.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-slate-400 block">總營收 (實收金額)</span>
          <div className="text-xl md:text-2xl font-black text-white font-mono">NT$ {totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-emerald-400 block font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> 實估淨賺 (毛利-折扣-免運)
          </span>
          <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">NT$ {totalProfit.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-rose-400 block font-bold flex items-center gap-1">
            <Ticket className="w-4 h-4" /> 優惠讓利總額
          </span>
          <div className="text-xl md:text-2xl font-black text-rose-400 font-mono">NT$ {totalDiscount.toLocaleString()}</div>
        </div>

        {/* 🟢 新增：自行吸收的免運成本統計 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-amber-400 block font-bold flex items-center gap-1">
            <Truck className="w-4 h-4" /> 免運吸收成本
          </span>
          <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">NT$ {totalAbsorbedShipping.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs text-slate-400 block">有效訂單數</span>
          <div className="text-xl md:text-2xl font-black text-white font-mono">{totalOrderCount} 筆</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" /> 營收明細紀錄
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">載入營收明細中...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">此批次目前沒有任何營收紀錄</div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs md:text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white text-base">{ord.line_name}</span>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded text-xs font-bold">{ord.batch_name}</span>
                    <span className="text-slate-400 text-xs font-mono">🕒 {new Date(ord.created_at).toLocaleString('zh-TW', { hour12: false })}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    訂單編號：{ord.order_no || ord.id.slice(0, 8)}
                  </div>
                </div>

                <div className="flex items-center gap-5 font-mono self-end sm:self-auto flex-wrap">
                  {ord.discount_amount > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-rose-400 block">優惠折扣</span>
                      <span className="text-rose-400 font-bold">-NT$ {ord.discount_amount}</span>
                    </div>
                  )}
                  {ord.absorbed_shipping > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 block">免運成本</span>
                      <span className="text-amber-400 font-bold">-NT$ {ord.absorbed_shipping}</span>
                    </div>
                  )}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">實收營收</span>
                    <span className="text-white font-bold">NT$ {(ord.total_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-right pl-3 border-l border-slate-800">
                    <span className="text-[10px] text-emerald-400 block font-bold">真實淨賺</span>
                    <span className="text-emerald-400 font-black text-base">NT$ {ord.calculated_profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
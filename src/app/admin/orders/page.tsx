'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Package, Search, RefreshCw, 
  Copy, MessageSquare, CheckCircle, Truck, Clock, MapPin, Phone, User, RotateCcw, Archive, Printer, ClipboardCheck, AlertCircle, DollarSign
} from 'lucide-react'

interface OrderItem {
  id: string
  batch_id?: string
  batch_name?: string
  name: string
  price: number
  cost?: number
  quantity: number
  selectedVariant?: string
  status?: string
  type?: string
}

interface Order {
  id: string
  order_no: string
  batch_id?: string
  line_name: string
  buyer_name?: string
  buyer_phone?: string
  store_name?: string
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL')
  const [orderTab, setOrderTab] = useState<'active' | 'reported' | 'shipping' | 'shipped' | 'completed'>('active')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null)
  const [copyShipId, setCopyShipId] = useState<string | null>(null)

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

  const getBatchBadgeWithFlag = (batchName: string) => {
    if (/[\u{1F1E6}-\u{1F1FF}]{2}/u.test(batchName)) return batchName
    if (batchName.includes('美國') || batchName.includes('美')) return `🇺🇸 ${batchName}`
    if (batchName.includes('韓國') || batchName.includes('韓')) return `🇰🇷 ${batchName}`
    if (batchName.includes('日本') || batchName.includes('日')) return `🇯🇵 ${batchName}`
    if (batchName.includes('香港') || batchName.includes('港')) return `🇭🇰 ${batchName}`
    if (batchName.includes('英國') || batchName.includes('英')) return `🇬🇧 ${batchName}`
    if (batchName.includes('泰國') || batchName.includes('泰')) return `🇹🇭 ${batchName}`
    if (batchName.includes('現貨')) return `🇹🇼 ${batchName}`
    return `🌍 ${batchName}`
  }

  const groupedOrders: Record<string, {
    key: string
    line_name: string
    buyer_name: string
    buyer_phone: string
    store_name: string
    batch_name: string
    batch_id?: string
    order_ids: string[]
    note: string
    items: OrderItem[]
    items_subtotal: number
    shipping_fee: number
    discount_amount: number
    coupon_code: string
    total_amount: number
    total_profit: number
    latest_time: string
    status: string
    pay_status: string
  }> = {}

  orders.forEach((ord) => {
    const bName = resolveBatchName(ord)
    const groupKey = `${ord.line_name}_${ord.batch_id || bName}`

    let parsedCouponCode = ''
    let parsedDiscount = 0
    // 🟢 關鍵修正：只有當訂單已經不是 unpaid (也就是進入待入帳、已付款等已送出資料階段) 且備註有包含折抵時，才解析優惠券
    if (ord.pay_status !== 'unpaid' && ord.note && ord.note.includes('折抵:')) {
      try {
        const matchCode = ord.note.match(/優惠券:\s*([^,]+)/)
        const matchDisc = ord.note.match(/折抵:\s*([0-9]+)/)
        if (matchCode) parsedCouponCode = matchCode[1].trim()
        if (matchDisc) parsedDiscount = Number(matchDisc[1]) || 0
      } catch (e) {
        console.error(e)
      }
    }

    if (!groupedOrders[groupKey]) {
      groupedOrders[groupKey] = {
        key: groupKey,
        line_name: ord.line_name || '未登入買家',
        buyer_name: ord.buyer_name || '',
        buyer_phone: ord.buyer_phone || '',
        store_name: ord.store_name || '',
        batch_name: bName,
        batch_id: ord.batch_id,
        order_ids: [ord.id],
        note: bName,
        items: [],
        items_subtotal: 0,
        shipping_fee: 0,
        discount_amount: parsedDiscount,
        coupon_code: parsedCouponCode,
        total_amount: 0,
        total_profit: 0,
        latest_time: ord.created_at,
        status: ord.status || 'pending_buy',
        pay_status: ord.pay_status || 'unpaid'
      }
    } else {
      if (!groupedOrders[groupKey].order_ids.includes(ord.id)) {
        groupedOrders[groupKey].order_ids.push(ord.id)
      }
      if (parsedDiscount > groupedOrders[groupKey].discount_amount) {
        groupedOrders[groupKey].discount_amount = parsedDiscount
        groupedOrders[groupKey].coupon_code = parsedCouponCode
      }
    }

    if (ord.items && Array.isArray(ord.items)) {
      ord.items.forEach((item) => {
        groupedOrders[groupKey].items.push(item)
        if (item.status !== 'failed') {
          const itemPrice = item.price || 0
          const itemCost = item.cost || 0
          const itemQty = item.quantity || 1

          groupedOrders[groupKey].items_subtotal += itemPrice * itemQty
          groupedOrders[groupKey].total_profit += (itemPrice - itemCost) * itemQty
        }
      })
    }
  })

  Object.values(groupedOrders).forEach(g => {
    let currentShipping = 0
    if (g.items_subtotal > 0) {
      if (!isFreeShippingAllSetting && g.items_subtotal < thresholdSetting) {
        currentShipping = shippingFeeSetting
      }
    }
    g.shipping_fee = currentShipping
    g.total_amount = Math.max(0, g.items_subtotal + currentShipping - g.discount_amount)
  })

  const groupList = Object.values(groupedOrders)

  const activeList = groupList.filter(g => g.status !== 'completed' && g.status !== 'shipped' && g.status !== 'archived' && g.pay_status === 'unpaid')
  const reportedList = groupList.filter(g => g.status !== 'completed' && g.status !== 'shipped' && g.status !== 'archived' && g.pay_status === 'reported')
  const shippingList = groupList.filter(g => g.status !== 'completed' && g.status !== 'shipped' && g.status !== 'archived' && g.pay_status === 'paid')
  const shippedList = groupList.filter(g => g.status === 'shipped')
  const completedList = groupList.filter(g => g.status === 'completed')

  const getCurrentScopeList = () => {
    if (orderTab === 'active') return activeList
    if (orderTab === 'reported') return reportedList
    if (orderTab === 'shipping') return shippingList
    if (orderTab === 'shipped') return shippedList
    return completedList
  }

  const currentScopeList = getCurrentScopeList()

  const availableBatches = batches.filter((b) => {
    const count = currentScopeList.filter(g => g.batch_name === b.name || g.batch_id === b.id).length
    return count > 0
  })

  const filteredList = currentScopeList.filter((g) => {
    const matchBatch = selectedBatch === 'ALL' || g.batch_name === selectedBatch
    const matchSearch = 
      g.line_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      g.buyer_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      g.store_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      g.items.some(i => i.name.toLowerCase().includes(searchKeyword.toLowerCase()))

    return matchBatch && matchSearch
  })

  const totalCalculatedRevenue = filteredList.reduce((sum, g) => sum + g.total_amount, 0)
  const totalCalculatedProfit = filteredList.reduce((sum, g) => sum + g.total_profit, 0)

  const handleArchiveOrder = async (orderIds: string[]) => {
    if (!confirm('確定要封存此訂單嗎？')) return
    const { error } = await supabase.from('orders').update({ status: 'archived' }).in('id', orderIds)
    if (!error) fetchData()
  }

  const handleRevertToActive = async (orderIds: string[]) => {
    if (!confirm('確定要將此訂單退回「進行中」嗎？')) return
    const { error } = await supabase.from('orders').update({ pay_status: 'unpaid' }).in('id', orderIds)
    if (!error) fetchData()
  }

  const copy711ShippingInfo = (g: typeof groupList[0]) => {
    const text = `【7-11 交貨便 0元純取貨】\n收件人：${g.buyer_name || g.line_name}\n手機：${g.buyer_phone || '未提供'}\n門市：${g.store_name || '未提供'}`
    navigator.clipboard.writeText(text)
    setCopyShipId(g.key)
    setTimeout(() => setCopyShipId(null), 2000)
  }

  const copyPaymentNotice = (g: typeof groupList[0]) => {
    let text = `【一条魚代購・${g.batch_name} 採買完成與匯款通知】\n`
    text += `買家暱稱：${g.line_name}\n`
    text += `連線專案：${g.batch_name}\n`
    text += `------------------------\n`
    g.items.forEach((it, idx) => {
      const isFailed = it.status === 'failed'
      text += `${idx + 1}. ${it.name} ${it.selectedVariant ? `(${it.selectedVariant})` : ''} × ${it.quantity} = ${isFailed ? '【✕ 缺貨未買到】' : `NT$ ${(it.price * it.quantity).toLocaleString()}`}\n`
    })
    text += `------------------------\n`
    text += `商品小計：NT$ ${g.items_subtotal.toLocaleString()}\n`
    text += `運費：${g.shipping_fee === 0 ? '免運費' : `NT$ ${g.shipping_fee}`}\n`
    if (g.discount_amount > 0) {
      text += `優惠券 (${g.coupon_code}) 折抵：-NT$ ${g.discount_amount}\n`
    }
    text += `應匯總額：NT$ ${g.total_amount.toLocaleString()}\n\n`
    text += `🏦 匯款轉帳資訊：\n銀行：822 中國信託\n帳號：1234-5678-9012\n戶名：林星妤\n\n`
    text += `匯款完成後，請點開前台「會員中心」填寫您的「帳號後五碼」與「7-11 寄件門市」，謝謝您！`

    navigator.clipboard.writeText(text)
    setCopySuccessId(g.key)
    setTimeout(() => setCopySuccessId(null), 2000)
  }

  const printShippingLabel = (g: typeof groupList[0]) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return alert('請允許瀏覽器彈出視窗')

    const itemsHtml = g.items
      .filter(i => i.status !== 'failed')
      .map(i => `<li>${i.name} ${i.selectedVariant ? `(${i.selectedVariant})` : ''} × ${i.quantity}</li>`)
      .join('')

    printWindow.document.write(`
      <html>
        <head><title>出貨核對單 - ${g.buyer_name || g.line_name}</title></head>
        <body style="font-family:sans-serif; padding:24px;">
          <h2>一条魚代購・出貨核對單</h2>
          <p><strong>門市：</strong>${g.store_name || '未提供'}</p>
          <p><strong>收件人：</strong>${g.buyer_name || g.line_name} (${g.buyer_phone || '未提供'})</p>
          <ul>${itemsHtml}</ul>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleConfirmPaid = async (orderIds: string[]) => {
    const { error } = await supabase.from('orders').update({ pay_status: 'paid' }).in('id', orderIds)
    if (!error) fetchData()
  }

  const handleRevertPayment = async (orderIds: string[]) => {
    if (!confirm('確定移回待入帳？')) return
    const { error } = await supabase.from('orders').update({ pay_status: 'reported' }).in('id', orderIds)
    if (!error) fetchData()
  }

  const handleMarkAsShipped = async (orderIds: string[]) => {
    const { error } = await supabase.from('orders').update({ status: 'shipped', pay_status: 'paid' }).in('id', orderIds)
    if (!error) fetchData()
  }

  const handleMarkAsCompleted = async (orderIds: string[]) => {
    const { error } = await supabase.from('orders').update({ status: 'completed', pay_status: 'paid' }).in('id', orderIds)
    if (!error) fetchData()
  }

  const handleRevertToShipping = async (orderIds: string[]) => {
    if (!confirm('確定移回準備出貨？')) return
    const { error } = await supabase.from('orders').update({ status: 'bought' }).in('id', orderIds)
    if (!error) fetchData()
  }

  const handleRevertToShipped = async (orderIds: string[]) => {
    if (!confirm('確定移回已出貨？')) return
    const { error } = await supabase.from('orders').update({ status: 'shipped' }).in('id', orderIds)
    if (!error) fetchData()
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            買家整單與結帳中樞 (7-11 交貨便)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            出貨寄出後訂單將自動歸檔，運費規則已同步套用全站設定（滿 NT$ {thresholdSetting} 免運，運費 NT$ {shippingFeeSetting}）。
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl flex items-center gap-4">
            <div>
              <span className="text-xs text-slate-400 block">{orderTab === 'completed' ? '已完成訂單總額' : '分頁應收總額'}</span>
              <span className="text-white font-mono font-bold text-base">NT$ {totalCalculatedRevenue.toLocaleString()}</span>
            </div>
            <div className="pl-4 border-l border-slate-800">
              <span className="text-xs text-emerald-400 block font-bold flex items-center gap-0.5">
                <DollarSign className="w-3.5 h-3.5" /> 實估淨賺 (毛利)
              </span>
              <span className="text-emerald-400 font-mono font-black text-lg">NT$ {totalCalculatedProfit.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={fetchData} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 transition flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 重新整理
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl">
        <button onClick={() => { setOrderTab('active'); setSelectedBatch('ALL'); }} className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${orderTab === 'active' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'}`}>
          <Clock className="w-3.5 h-3.5" /> 進行中 ({activeList.length})
        </button>
        <button onClick={() => { setOrderTab('reported'); setSelectedBatch('ALL'); }} className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${orderTab === 'reported' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'}`}>
          <AlertCircle className="w-3.5 h-3.5" /> 待入帳 ({reportedList.length})
        </button>
        <button onClick={() => { setOrderTab('shipping'); setSelectedBatch('ALL'); }} className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${orderTab === 'shipping' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
          <Truck className="w-3.5 h-3.5" /> 準備出貨 ({shippingList.length})
        </button>
        <button onClick={() => { setOrderTab('shipped'); setSelectedBatch('ALL'); }} className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${orderTab === 'shipped' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
          <Package className="w-3.5 h-3.5" /> 已出貨 ({shippedList.length})
        </button>
        <button onClick={() => { setOrderTab('completed'); setSelectedBatch('ALL'); }} className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${orderTab === 'completed' ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700' : 'text-slate-300 hover:text-white'}`}>
          <Archive className="w-3.5 h-3.5" /> 已完成訂單 ({completedList.length})
        </button>
      </div>

      {availableBatches.length > 0 && (
        <div className="flex gap-2.5 pb-1 overflow-x-auto">
          <button onClick={() => setSelectedBatch('ALL')} className={`px-4.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer ${selectedBatch === 'ALL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}>
            全部 ({currentScopeList.length})
          </button>
          {availableBatches.map((b) => {
            const count = currentScopeList.filter(g => g.batch_name === b.name || g.batch_id === b.id).length
            return (
              <button key={b.id} onClick={() => setSelectedBatch(b.name)} className={`px-4.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${selectedBatch === b.name ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}>
                {getBatchBadgeWithFlag(b.name)} ({count})
              </button>
            )
          })}
        </div>
      )}

      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
        <input
          type="text"
          placeholder="搜尋買家 LINE 暱稱、真實姓名、手機或 7-11 門市..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">載入整單資料中...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-400 text-sm">目前此分頁沒有任何訂單</div>
      ) : (
        <div className="space-y-5">
          {filteredList.map((g) => {
            const isCompleted = g.status === 'completed'
            const isShipped = g.status === 'shipped'
            const isPaid = g.pay_status === 'paid'
            const isReported = g.pay_status === 'reported'

            return (
              <div key={g.key} className={`bg-slate-900 border rounded-3xl p-6 space-y-4 shadow-xl transition ${isCompleted ? 'border-slate-800/50 bg-slate-950/60 opacity-80' : isShipped ? 'border-purple-500/40 bg-slate-900/90' : isReported ? 'border-amber-500/50 bg-slate-900/90' : isPaid ? 'border-blue-500/40' : 'border-slate-800 hover:border-slate-700'}`}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#06C755]/10 border border-[#06C755]/20 text-[#06C755] rounded-2xl flex items-center justify-center font-bold">
                      <MessageSquare className="w-6 h-6 fill-[#06C755]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-lg font-black text-white">{g.line_name}</h2>
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold">{getBatchBadgeWithFlag(g.batch_name)}</span>
                        <span className="text-xs text-slate-300 font-mono">🕒 {new Date(g.latest_time).toLocaleString('zh-TW', { hour12: false })}</span>
                        {isCompleted ? <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-bold">✓ 已完成訂單</span> : isShipped ? <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md font-bold flex items-center gap-1"><Package className="w-3.5 h-3.5" /> 已寄出交貨便</span> : isPaid ? <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-md font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> 已入帳・準備出貨</span> : isReported ? <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md font-bold animate-pulse flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 已回報匯款與門市</span> : <span className="text-xs bg-slate-950 text-slate-300 px-2.5 py-1 rounded-md">待處理 (未填資料)</span>}
                      </div>

                      {g.store_name && (
                        <div className="mt-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs md:text-sm text-slate-200 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><User className="w-4 h-4" /> {g.buyer_name || g.line_name}</span>
                          <span className="text-slate-200 font-mono flex items-center gap-1"><Phone className="w-4 h-4 text-slate-400" /> {g.buyer_phone}</span>
                          <span className="text-amber-400 font-medium flex items-center gap-1"><MapPin className="w-4 h-4" /> {g.store_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap justify-end">
                    {orderTab === 'active' && (
                      <button onClick={() => copyPaymentNotice(g)} className="px-4 py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer">
                        <Copy className="w-4 h-4" /> {copySuccessId === g.key ? '已複製！' : '複製匯款通知'}
                      </button>
                    )}

                    {orderTab === 'reported' && (
                      <>
                        <button onClick={() => handleRevertToActive(g.order_ids)} className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-700">
                          <RotateCcw className="w-4 h-4 text-amber-400" /> 退回進行中
                        </button>
                        <button onClick={() => copyPaymentNotice(g)} className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer">
                          <Copy className="w-4 h-4" /> 複製匯款通知
                        </button>
                        <button onClick={() => handleConfirmPaid(g.order_ids)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer animate-pulse">
                          <CheckCircle className="w-4 h-4" /> 確認入帳
                        </button>
                      </>
                    )}

                    {orderTab === 'shipping' && (
                      <>
                        <button onClick={() => handleRevertPayment(g.order_ids)} className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-700">
                          <RotateCcw className="w-4 h-4 text-amber-400" /> 移回待入帳
                        </button>
                        <button onClick={() => printShippingLabel(g)} className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 border border-slate-700 cursor-pointer">
                          <Printer className="w-4 h-4 text-emerald-400" /> 列印核對單
                        </button>
                        <button onClick={() => copy711ShippingInfo(g)} className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer">
                          <ClipboardCheck className="w-4 h-4" /> {copyShipId === g.key ? '已複製 7-11 格式！' : '複製 7-11 寄件資料'}
                        </button>
                        <button onClick={() => handleMarkAsShipped(g.order_ids)} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs md:text-sm font-bold transition shadow-md cursor-pointer">
                          標記已出貨
                        </button>
                      </>
                    )}

                    {orderTab === 'shipped' && (
                      <>
                        <button onClick={() => handleRevertToShipping(g.order_ids)} className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-slate-700 cursor-pointer">
                          <RotateCcw className="w-4 h-4 text-amber-400" /> 移回準備出貨
                        </button>
                        <button onClick={() => handleMarkAsCompleted(g.order_ids)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs md:text-sm font-bold transition shadow-md cursor-pointer">
                          移至已完成訂單
                        </button>
                      </>
                    )}

                    {orderTab === 'completed' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRevertToShipped(g.order_ids)} className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-slate-700 cursor-pointer">
                          <RotateCcw className="w-4 h-4 text-amber-400" /> 移回已出貨
                        </button>
                        <button onClick={() => handleArchiveOrder(g.order_ids)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs md:text-sm font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer">
                          <Archive className="w-4 h-4" /> 封存訂單
                        </button>
                      </div>
                    )}

                    {/* 🟢 嚴格檢查：只有當訂單非 unpaid 時，才在後台顯示折扣 */}
                    <div className="text-right pl-3 border-l border-slate-800 space-y-0.5 font-mono">
                      <div className="text-[11px] text-slate-400">
                        小計 NT$ {g.items_subtotal.toLocaleString()} + 運費 <span className="text-amber-400">{g.shipping_fee === 0 ? '免運' : `NT$ ${g.shipping_fee}`}</span>
                        {g.pay_status !== 'unpaid' && g.discount_amount > 0 && <span className="text-rose-400"> - 優惠 NT$ {g.discount_amount}</span>}
                      </div>
                      <div>
                        <span className="text-xs text-slate-300 font-bold">應收：</span>
                        <span className="text-white font-black text-sm">NT$ {g.total_amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-xs text-emerald-400 font-bold">淨賺：</span>
                        <span className="text-emerald-400 font-black text-base">NT$ {g.total_profit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs text-slate-300 font-semibold">📦 本線商品明細：</span>
                  <div className="space-y-2">
                    {g.items.map((it, idx) => {
                      const isFailed = it.status === 'failed'
                      const isBought = it.status === 'bought'
                      const itemPrice = it.price || 0
                      const itemCost = it.cost || 0
                      const itemProfit = (itemPrice - itemCost) * (it.quantity || 1)

                      return (
                        <div key={idx} className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs md:text-sm ${isFailed ? 'bg-slate-950/40 border-slate-800/40 opacity-50' : 'bg-slate-950 border-slate-800/80'}`}>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`font-medium ${isFailed ? 'line-through text-slate-400' : 'text-slate-100'}`}>{it.name}</span>
                            {it.selectedVariant && <span className="bg-slate-900 border border-slate-700 text-emerald-400 text-xs px-2 py-0.5 rounded">規格: {it.selectedVariant}</span>}
                            {isBought && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-bold">✓ 已買到</span>}
                            {isFailed && <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded font-bold">✕ 缺貨</span>}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto">
                            <span className="text-slate-400">售價 NT$ {itemPrice} (成本 NT$ {itemCost})</span>
                            <span className={`${isFailed ? 'line-through text-slate-500' : 'text-emerald-400'} font-bold`}>淨賺 NT$ {itemProfit.toLocaleString()}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
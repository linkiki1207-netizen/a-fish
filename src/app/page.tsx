'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircle, Truck, X, ShoppingCart, 
  Radio, Tag, MessageSquare, LogOut, Lock, 
  Package, ShieldCheck, Sparkles, Clock, CreditCard, Send, MapPin, ExternalLink, Archive, Boxes, Globe, User, Phone, Save, Info, ZoomIn, FileText, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react'

interface ProductVariant {
  name: string
}

interface Product {
  id: string
  batch_id?: string
  batch_name?: string
  name: string
  price: number
  stock?: number
  image_url?: string | null
  image_urls?: string[] | null
  description?: string | null
  variants?: (ProductVariant | string)[]
  spec?: string | null
  category?: string | null
  status?: string
  created_at?: string
  is_active?: boolean
}

interface CartItem {
  id: string
  productId: string
  batch_id?: string
  batch_name?: string
  name: string
  price: number
  selectedVariant?: string
  quantity: number
  image_url?: string | null
  isLive?: boolean
}

interface Batch {
  id: string
  name: string
  status?: string
}

interface LineUser {
  userId: string
  displayName: string
  pictureUrl?: string
}

function StoreContent() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<'live' | 'ongoing' | 'spot'>('live')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null)

  const [orderSuccess, setOrderSuccess] = useState<{
    lineName: string
    total: number
    count: number
    batchCount: number
  } | null>(null)

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [addedItemModal, setAddedItemModal] = useState<{
    name: string
    variant?: string
    price: number
    isLive: boolean
  } | null>(null)

  const [lineUser, setLineUser] = useState<LineUser | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [memberTab, setMemberTab] = useState<'profile' | 'contact'>('profile')
  
  const [ordersModalOpen, setOrdersModalOpen] = useState(false)
  const [buyerOrderTab, setBuyerOrderTab] = useState<'active' | 'shipping' | 'shipped' | 'completed'>('active')
  const [myOrders, setMyOrders] = useState<any[]>([])

  const [savedName, setSavedName] = useState('')
  const [savedPhone, setSavedPhone] = useState('')
  const [savedStore, setSavedStore] = useState('')
  const [profileSavedMsg, setProfileSavedMsg] = useState('')

  const [payModalBatch, setPayModalBatch] = useState<{
    batch_name: string
    amount: number
    orderIds: string[]
  } | null>(null)
  
  const [bankLast5, setBankLast5] = useState('')
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingStore, setShippingStore] = useState('')
  const [reportingPay, setReportingPay] = useState(false)

  useEffect(() => {
    fetchBatchesAndProducts()
    checkUserSession()
    loadSavedProfile()

    const handleEmapMessage = (event: MessageEvent) => {
      if (event.data && (event.data.fullStoreInfo || event.data.storeName)) {
        const rawName = event.data.storeName || ''
        const cleanName = rawName.endsWith('門市') ? rawName : `${rawName}門市`
        const storeId = event.data.storeId || ''
        const storeInfoStr = `7-11 ${cleanName} (${storeId})`
        setShippingStore(storeInfoStr)
        setSavedStore(storeInfoStr)
      }
    }
    window.addEventListener('message', handleEmapMessage)
    return () => window.removeEventListener('message', handleEmapMessage)
  }, [])

  useEffect(() => {
    if (lineUser) {
      fetchCloudCart(lineUser.userId)
    } else {
      setCart([])
    }
  }, [lineUser])

  // 讀取雲端購物車，並自動過濾/清除已結束批次的商品
  const fetchCloudCart = async (userId: string) => {
    try {
      const { data: batchData } = await supabase
        .from('batches')
        .select('id, status')
      
      const activeBatchIds = (batchData || [])
        .filter(b => !b.status || b.status === 'active')
        .map(b => b.id)

      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      if (data) {
        const validItems = []
        for (const ci of data) {
          if (ci.batch_id && !activeBatchIds.includes(ci.batch_id)) {
            await supabase.from('cart_items').delete().eq('id', ci.id)
          } else {
            validItems.push(ci)
          }
        }

        const mappedCart: CartItem[] = validItems.map((ci: any) => ({
          id: ci.id,
          productId: ci.product_id,
          batch_id: ci.batch_id,
          batch_name: ci.batch_name,
          name: ci.product_name,
          price: ci.price,
          selectedVariant: ci.selected_variant || undefined,
          quantity: ci.quantity,
          image_url: ci.image_url,
          isLive: false
        }))
        setCart(mappedCart)
      }
    } catch (err) {
      console.error('讀取雲端購物車失敗', err)
    }
  }

  const loadSavedProfile = () => {
    try {
      const localProfile = localStorage.getItem('fish_buyer_profile')
      if (localProfile) {
        const p = JSON.parse(localProfile)
        setSavedName(p.name || '')
        setSavedPhone(p.phone || '')
        setSavedStore(p.store || '')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (savedPhone.trim().length !== 10 || !savedPhone.trim().startsWith('09')) {
      alert('手機號碼格式錯誤！必須為 10 碼且以 09 開頭。')
      return
    }
    const profileData = { name: savedName, phone: savedPhone, store: savedStore }
    localStorage.setItem('fish_buyer_profile', JSON.stringify(profileData))
    setProfileSavedMsg('🎉 常用寄件資料已成功儲存！下次結帳將自動帶入。')
    setTimeout(() => setProfileSavedMsg(''), 4000)
  }

  const checkUserSession = () => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const userParam = urlParams.get('line_user')

        if (userParam) {
          const parsedUser = JSON.parse(decodeURIComponent(userParam))
          saveUserSession(parsedUser)
          window.history.replaceState(null, '', window.location.pathname)
          return
        }
      }

      const saved = localStorage.getItem('fish_line_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        setLineUser(parsed)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const saveUserSession = (user: LineUser) => {
    localStorage.setItem('fish_line_user', JSON.stringify(user))
    setLineUser(user)
  }

  const handleLineLogin = () => {
    const channelId = '2011277163'
    const redirectUri = encodeURIComponent('https://a-fish.vercel.app/api/auth/line/callback')
    const state = Math.random().toString(36).substring(2, 15)
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid`
  }

  const handleLineLogout = () => {
    localStorage.removeItem('fish_line_user')
    setLineUser(null)
    setCart([])
    setMemberModalOpen(false)
    setOrdersModalOpen(false)
  }

  const fetchMyOrders = async (buyerLine: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('line_name', buyerLine)
      .order('created_at', { ascending: false })

    if (data) {
      setMyOrders(data)
    }
  }

  const openMemberCenter = () => {
    setMemberTab('profile')
    setMemberModalOpen(true)
  }

  const openMyOrdersModal = () => {
    if (lineUser) {
      fetchMyOrders(lineUser.displayName)
    }
    setOrdersModalOpen(true)
  }

  const fetchBatchesAndProducts = async () => {
    setLoading(true)
    try {
      const { data: batchData } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false })

      let activeBatchIds: string[] = []
      if (batchData && batchData.length > 0) {
        setBatches(batchData)
        activeBatchIds = batchData
          .filter(b => !b.status || b.status === 'active')
          .map(b => b.id)
      }

      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (productData) {
        const validProducts = productData.filter(p => {
          if (!p.batch_id) return true
          return activeBatchIds.includes(p.batch_id)
        })
        setProducts(validProducts)
      }
    } catch (err) {
      console.error('抓取資料失敗:', err)
    } finally {
      setLoading(false)
    }
  }

  // 🟢 修正：完全依據資料庫真實儲存的 category 決定分類，不再強制用 batch_id 覆寫
  const getItemType = (p: Product) => {
    if (p.category === 'flash' || p.category === 'LIVE') return 'live'
    if (p.category === 'spot' || p.category === 'SPOT') return 'spot'
    if (p.category === 'batch' || p.category === 'GENERAL') return 'ongoing'
    return 'live'
  }

  const getBatchBadgeWithFlag = (batchId?: string) => {
    const batch = batches.find(b => b.id === batchId)
    const name = batch ? batch.name : '各國連線'

    if (/[\u{1F1E6}-\u{1F1FF}]{2}/u.test(name)) {
      return name
    }

    if (name.includes('美國') || name.includes('美')) return `🇺🇸 ${name}`
    if (name.includes('韓國') || name.includes('韓')) return `🇰🇷 ${name}`
    if (name.includes('日本') || name.includes('日')) return `🇯🇵 ${name}`
    if (name.includes('香港') || name.includes('港')) return `🇭🇰 ${name}`
    if (name.includes('英國') || name.includes('英')) return `🇬🇧 ${name}`
    if (name.includes('泰國') || name.includes('泰')) return `🇹🇭 ${name}`
    return `🌍 ${name}`
  }

  const isSoldOut = (p: Product) => {
    return p.status === 'sold_out' || p.status === 'SOLDOUT' || p.stock === 0
  }

  const extractVariants = (product: Product): string[] => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants
        .map((v) => (typeof v === 'string' ? v : v.name))
        .filter(Boolean)
    }
    if (product.spec && !product.spec.includes('_ITEM')) {
      return product.spec.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
    }
    return []
  }

  const getProductImages = (p: Product): string[] => {
    if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
      return p.image_urls.filter(Boolean)
    }
    if (p.image_url) {
      return [p.image_url]
    }
    return []
  }

  const availableProducts = products.filter(p => !isSoldOut(p))

  const tabProducts = availableProducts.filter((p) => {
    const type = getItemType(p)
    if (activeTab === 'live') return type === 'live'
    if (activeTab === 'ongoing') return type === 'ongoing'
    if (activeTab === 'spot') return type === 'spot'
    return false
  })

  const displayedProducts =
    selectedBatchId === 'ALL'
      ? tabProducts
      : tabProducts.filter((p) => p.batch_id === selectedBatchId)

  const availableBatches = batches.filter((b) => {
    if (b.status === 'ended') return false
    const count = tabProducts.filter((p) => p.batch_id === b.id).length
    return count > 0
  })

  const addToCart = async (product: Product) => {
    if (!lineUser) {
      setShowLoginPrompt(true)
      return
    }

    const variants = extractVariants(product)
    const selectedVariant =
      selectedVariants[product.id] || (variants.length > 0 ? variants[0] : '')
    const isLive = activeTab === 'live'
    const batch = batches.find((b) => b.id === product.batch_id)
    const images = getProductImages(product)
    const batchIdVal = product.batch_id || null
    const batchNameVal = batch ? batch.name : (activeTab === 'spot' ? '現貨專區' : '各國連線')
    const imgUrlVal = images.length > 0 ? images[0] : null

    try {
      let query = supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', lineUser.userId)
        .eq('product_id', product.id)

      if (selectedVariant) {
        query = query.eq('selected_variant', selectedVariant)
      } else {
        query = query.is('selected_variant', null)
      }

      const { data: existing } = await query

      if (existing && existing.length > 0) {
        const target = existing[0]
        const newQty = target.quantity + 1
        await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', target.id)
      } else {
        await supabase.from('cart_items').insert([{
          user_id: lineUser.userId,
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          selected_variant: selectedVariant || null,
          image_url: imgUrlVal,
          batch_id: batchIdVal,
          batch_name: batchNameVal
        }])
      }

      fetchCloudCart(lineUser.userId)
    } catch (err) {
      console.error('加入購物車失敗', err)
      alert('加入購物車失敗，請稍後再試')
    }

    setActiveDetailProduct(null)
    setAddedItemModal({
      name: product.name,
      variant: selectedVariant,
      price: product.price,
      isLive
    })
  }

  const updateQuantity = async (cartItemId: string, delta: number) => {
    const targetItem = cart.find(i => i.id === cartItemId)
    if (!targetItem || !lineUser) return

    const newQty = targetItem.quantity + delta
    try {
      if (newQty <= 0) {
        await supabase.from('cart_items').delete().eq('id', cartItemId)
      } else {
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', cartItemId)
      }
      fetchCloudCart(lineUser.userId)
    } catch (err) {
      console.error('更新數量失敗', err)
    }
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineUser) {
      setShowLoginPrompt(true)
      return
    }
    if (cart.length === 0) return alert('購物車是空的！')

    const currentLineName = lineUser.displayName
    setSubmitting(true)

    try {
      const groupedByBatch: Record<string, CartItem[]> = {}
      cart.forEach((item) => {
        const bId = item.batch_id || 'DEFAULT'
        if (!groupedByBatch[bId]) {
          groupedByBatch[bId] = []
        }
        groupedByBatch[bId].push(item)
      })

      const batchKeys = Object.keys(groupedByBatch)

      for (const bId of batchKeys) {
        const batchItems = groupedByBatch[bId]
        const batchName = batchItems[0].batch_name || '連線訂單'

        let query = supabase
          .from('orders')
          .select('*')
          .eq('line_name', currentLineName)
          .eq('status', 'pending_buy')

        if (bId !== 'DEFAULT') {
          query = query.eq('batch_id', bId)
        } else {
          query = query.is('batch_id', null)
        }

        const { data: existingOrders } = await query

        if (existingOrders && existingOrders.length > 0) {
          const targetOrder = existingOrders[0]
          const existingItems = Array.isArray(targetOrder.items) ? targetOrder.items : []

          batchItems.forEach((newItem) => {
            const foundIndex = existingItems.findIndex(
              (ei: any) => ei.id === newItem.productId && ei.selectedVariant === (newItem.selectedVariant || '')
            )
            if (foundIndex > -1) {
              existingItems[foundIndex].quantity = (existingItems[foundIndex].quantity || 1) + newItem.quantity
            } else {
              existingItems.push({
                id: newItem.productId,
                batch_id: newItem.batch_id || '',
                batch_name: newItem.batch_name || '',
                name: newItem.name,
                selectedVariant: newItem.selectedVariant || '',
                price: newItem.price,
                quantity: newItem.quantity,
                status: 'pending',
                type: newItem.isLive ? '限時下單' : '商品品項'
              })
            }
          })

          const newTotalAmount = existingItems
            .filter((it: any) => it.status !== 'failed')
            .reduce((sum: number, it: any) => sum + (it.price * (it.quantity || 1)), 0)

          const { error: updateError } = await supabase
            .from('orders')
            .update({
              items: existingItems,
              total_amount: newTotalAmount,
              total_price: newTotalAmount
            })
            .eq('id', targetOrder.id)

          if (updateError) throw updateError

        } else {
          const batchTotal = batchItems.reduce((s, it) => s + it.price * it.quantity, 0)
          const formattedItems = batchItems.map((item) => ({
            id: item.productId,
            batch_id: item.batch_id || '',
            batch_name: item.batch_name || '',
            name: item.name,
            selectedVariant: item.selectedVariant || '',
            price: item.price,
            quantity: item.quantity,
            status: 'pending',
            type: item.isLive ? '限時下單' : '商品品項'
          }))

          const orderNo = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

          const { error: orderError } = await supabase.from('orders').insert([
            {
              order_no: orderNo,
              batch_id: bId !== 'DEFAULT' ? bId : null,
              line_name: currentLineName,
              buyer_name: currentLineName,
              customer_name: currentLineName,
              note: `${batchName}`,
              buyer_phone: '待結帳確認',
              customer_phone: '待結帳確認',
              store_name: '待結帳確認',
              store_info: '待結帳確認',
              total_amount: batchTotal,
              total_price: batchTotal,
              status: 'pending_buy',
              pay_status: 'unpaid',
              ship_status: 'preparing',
              items: formattedItems
            }
          ])

          if (orderError) throw orderError
        }
      }

      await supabase.from('cart_items').delete().eq('user_id', lineUser.userId)
      setCart([])

      setIsCartOpen(false)
      setOrderSuccess({
        lineName: currentLineName,
        total: totalPrice,
        count: totalCount,
        batchCount: batchKeys.length
      })
    } catch (err: any) {
      console.error(err)
      alert('登記失敗：' + (err.message || '請稍後再試'))
    } finally {
      setSubmitting(false)
    }
  }

  const open711Map = () => {
    const callbackUrl = encodeURIComponent('https://a-fish.vercel.app/api/emap/callback')
    const emapUrl = `https://emap.presco.com.tw/c2cemap.ashx?eshopid=001&showtype=1&tempvar=&url=${callbackUrl}`
    window.open(emapUrl, '711_emap', 'width=1000,height=680,toolbar=no,menubar=no,scrollbars=yes')
  }

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payModalBatch) return

    if (!bankLast5.trim() || !shippingName.trim() || !shippingPhone.trim() || !shippingStore.trim()) {
      alert('請完整填寫所有必填欄位！')
      return
    }
    if (bankLast5.trim().length !== 5) {
      alert('匯款帳號後五碼必須剛好為 5 個數字！')
      return
    }
    if (shippingPhone.trim().length !== 10 || !shippingPhone.trim().startsWith('09')) {
      alert('手機號碼格式錯誤！必須為 10 碼且以 09 開頭。')
      return
    }

    const profileData = {
      name: shippingName.trim(),
      phone: shippingPhone.trim(),
      store: shippingStore.trim()
    }
    try {
      localStorage.setItem('fish_buyer_profile', JSON.stringify(profileData))
    } catch (err) {
      console.error('LocalStorage 寫入失敗', err)
    }

    setSavedName(shippingName.trim())
    setSavedPhone(shippingPhone.trim())
    setSavedStore(shippingStore.trim())

    setReportingPay(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          pay_status: 'reported',
          buyer_name: shippingName.trim(),
          customer_name: shippingName.trim(),
          buyer_phone: shippingPhone.trim(),
          customer_phone: shippingPhone.trim(),
          store_name: shippingStore.trim(),
          store_info: shippingStore.trim(),
          note: `${payModalBatch.batch_name} (已匯款末5碼: ${bankLast5.trim()})`
        })
        .in('id', payModalBatch.orderIds)

      if (error) throw error

      alert('匯款與 7-11 寄件資料已成功送出！賣家查帳完成後將立即安排出貨！')
      setPayModalBatch(null)
      setBankLast5('')
      setShippingName('')
      setShippingPhone('')
      setShippingStore('')
      if (lineUser) fetchMyOrders(lineUser.displayName)
    } catch (err: any) {
      console.error(err)
      alert(`送出失敗：${err.message || '請確認網路連線或稍後再試'}`)
    } finally {
      setReportingPay(false)
    }
  }

  const groupBuyerOrders = () => {
    const grouped: Record<string, {
      batch_name: string
      orderIds: string[]
      total_amount: number
      latest_time: string
      isCompleted: boolean
      isShipped: boolean
      isShipping: boolean
      pay_status: string
      overallState: 'pending_buy' | 'ready_to_pay' | 'reported' | 'paid' | 'shipped' | 'completed' | 'all_failed'
      items: { name: string; variant?: string; price: number; quantity: number; status: string }[]
    }> = {}

    myOrders.forEach((ord) => {
      const uniqueGroupKey = ord.batch_id || ord.note?.split(' (')[0] || ord.id

      let bName = ord.note?.split(' (')[0] || '連線訂單'
      if (ord.batch_id) {
        const found = batches.find(b => b.id === ord.batch_id)
        if (found) bName = found.name
      }

      if (!grouped[uniqueGroupKey]) {
        grouped[uniqueGroupKey] = {
          batch_name: bName,
          orderIds: [ord.id],
          total_amount: 0,
          latest_time: ord.created_at,
          isCompleted: false,
          isShipped: false,
          isShipping: false,
          pay_status: ord.pay_status || 'unpaid',
          overallState: 'pending_buy',
          items: []
        }
      } else {
        if (!grouped[uniqueGroupKey].orderIds.includes(ord.id)) {
          grouped[uniqueGroupKey].orderIds.push(ord.id)
        }
      }

      if (ord.items && Array.isArray(ord.items)) {
        ord.items.forEach((it: any) => {
          const itStatus = it.status || 'pending'
          const sampleOrd = myOrders.find(o => ord.id === o.id)
          const shipStatus = sampleOrd?.status
          const isShippingOrLater = shipStatus === 'shipped' || shipStatus === 'completed'

          if (isShippingOrLater && itStatus === 'failed') {
            return
          }

          grouped[uniqueGroupKey].items.push({
            name: it.name,
            variant: it.selectedVariant,
            price: it.price,
            quantity: it.quantity || 1,
            status: itStatus
          })
        })
      }
    })

    Object.values(grouped).forEach((g) => {
      g.total_amount = g.items
        .filter(i => i.status !== 'failed')
        .reduce((sum, i) => sum + (i.price * i.quantity), 0)

      const sampleOrd = myOrders.find(o => g.orderIds.includes(o.id))
      const payStatus = sampleOrd?.pay_status
      const shipStatus = sampleOrd?.status
      g.pay_status = payStatus || 'unpaid'

      const targetBatch = batches.find(b => b.id === sampleOrd?.batch_id || b.name === g.batch_name)
      const isBatchEnded = targetBatch ? targetBatch.status === 'ended' : true
      const allFailed = g.items.length > 0 && g.items.every(i => i.status === 'failed')

      if (shipStatus === 'completed') {
        g.overallState = 'completed'
        g.isCompleted = true
      } else if (shipStatus === 'shipped') {
        g.overallState = 'shipped'
        g.isShipped = true
      } else if (payStatus === 'paid') {
        g.overallState = 'paid'
        g.isShipping = true
      } else if (payStatus === 'reported') {
        g.overallState = 'reported'
      } else if (allFailed) {
        g.overallState = 'all_failed'
      } else if (isBatchEnded) {
        g.overallState = 'ready_to_pay'
      } else {
        g.overallState = 'pending_buy'
      }
    })

    return Object.values(grouped)
  }

  const allBuyerGroupedOrders = groupBuyerOrders()
  const activeBuyerOrders = allBuyerGroupedOrders.filter(g => !g.isCompleted && !g.isShipped && !g.isShipping)
  const shippingBuyerOrders = allBuyerGroupedOrders.filter(g => g.isShipping && !g.isShipped && !g.isCompleted)
  const shippedBuyerOrders = allBuyerGroupedOrders.filter(g => g.isShipped && !g.isCompleted)
  const completedBuyerOrders = allBuyerGroupedOrders.filter(g => g.isCompleted)

  const displayedBuyerOrders = 
    buyerOrderTab === 'active' 
      ? activeBuyerOrders 
      : buyerOrderTab === 'shipping' 
      ? shippingBuyerOrders 
      : buyerOrderTab === 'shipped'
      ? shippedBuyerOrders
      : completedBuyerOrders

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">🎉 登記成功！</h2>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-sm text-left space-y-2 font-mono">
            <p className="text-slate-400">登記帳號：<span className="text-emerald-400 font-bold">{orderSuccess.lineName}</span></p>
            <p className="text-slate-400">連線條數：<span className="text-slate-200">{orderSuccess.batchCount} 條連線</span></p>
            <p className="text-slate-400">本次品項：<span className="text-slate-200">{orderSuccess.count} 件</span></p>
            <p className="text-slate-400">預計總額：<span className="text-emerald-400 font-bold font-mono">NT$ {orderSuccess.total.toLocaleString()}</span></p>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm cursor-pointer"
          >
            繼續搶其他商品
          </button>
        </div>
      </div>
    )
  }

  const liveCount = availableProducts.filter(p => getItemType(p) === 'live').length
  const ongoingCount = availableProducts.filter(p => getItemType(p) === 'ongoing').length
  const spotCount = availableProducts.filter(p => getItemType(p) === 'spot').length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-400 flex items-center gap-2">
              一条魚代購
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <Truck className="w-4 h-4 text-emerald-400" /> 即時現場連線・LINE 認證搶單系統
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {lineUser ? (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 pr-4 rounded-2xl shadow-lg">
                {lineUser.pictureUrl ? (
                  <img src={lineUser.pictureUrl} alt={lineUser.displayName} className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {lineUser.displayName[0]}
                  </div>
                )}
                
                <button
                  onClick={openMemberCenter}
                  className="text-left group cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-200 block max-w-[110px] truncate group-hover:text-emerald-400 transition">
                    {lineUser.displayName}
                  </span>
                  <span className="text-xs text-emerald-400">會員中心 ›</span>
                </button>

                <button
                  onClick={handleLineLogout}
                  className="text-slate-500 hover:text-rose-400 pl-2.5 border-l border-slate-800 ml-1 cursor-pointer"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginPrompt(true)}
                className="flex items-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>登入 LINE</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!lineUser) {
                  setShowLoginPrompt(true)
                } else {
                  setIsCartOpen(true)
                }
              }}
              className="relative flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>購物車</span>
              {totalCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {lineUser ? (
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  🎉 歡迎回來，<span className="text-emerald-400">{lineUser.displayName}</span>！
                </p>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                  批次結束前可隨時追加商品，結束後將開放匯款與 7-11 寄貨資料填寫！
                </p>
              </div>
            </div>
            <button
              onClick={openMyOrdersModal}
              className="text-xs md:text-sm bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl font-medium transition whitespace-nowrap self-end sm:self-auto cursor-pointer"
            >
              查看我的訂單 ›
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-slate-200">
                  您尚未綁定 LINE 帳號
                </p>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                  您可隨意瀏覽現場商品，登記搶單時請一鍵完成 LINE 綁定！
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLoginPrompt(true)}
              className="text-xs md:text-sm bg-[#06C755] hover:bg-[#05b34c] text-white px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/30 whitespace-nowrap self-end sm:self-auto cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              立即使用 LINE 一鍵綁定
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab('live')
              setSelectedBatchId('ALL')
            }}
            className={`py-3.5 px-2 rounded-xl text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === 'live' ? 'animate-pulse text-white' : 'text-rose-400'}`} />
            <span className="truncate">限時下單 ({liveCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ongoing')
              setSelectedBatchId('ALL')
            }}
            className={`py-3.5 px-2 rounded-xl text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ongoing'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 md:w-5 md:h-5" />
            <span className="truncate">各國連線 ({ongoingCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('spot')
              setSelectedBatchId('ALL')
            }}
            className={`py-3.5 px-2 rounded-xl text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'spot'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4 md:w-5 md:h-5" />
            <span className="truncate">現貨專區 ({spotCount})</span>
          </button>
        </div>

        {availableBatches.length > 0 && (
          <div className="flex gap-2.5 pb-2 overflow-x-auto">
            <button
              onClick={() => setSelectedBatchId('ALL')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedBatchId === 'ALL'
                  ? activeTab === 'live'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                    : activeTab === 'ongoing'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              全部 ({tabProducts.length})
            </button>
            {availableBatches.map((b) => {
              const count = tabProducts.filter((p) => p.batch_id === b.id).length
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatchId(b.id)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedBatchId === b.id
                      ? activeTab === 'live'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                        : activeTab === 'ongoing'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {getBatchBadgeWithFlag(b.id)} ({count})
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 py-16 text-center text-sm md:text-base">載入商品中...</p>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-400 text-sm md:text-base">
            {activeTab === 'live'
              ? '🔴 目前此專區尚未有限時下單商品，請稍候！'
              : activeTab === 'ongoing'
              ? '📦 目前此專區尚未有各國連線商品。'
              : '🏷️ 目前現貨專區尚無商品上架。'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => {
              const isLive = getItemType(product) === 'live'
              const isSpot = getItemType(product) === 'spot'
              const variants = extractVariants(product)
              const currentSelected =
                selectedVariants[product.id] || (variants.length > 0 ? variants[0] : '')
              const images = getProductImages(product)

              return (
                <div
                  key={product.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 z-10">
                    {isLive ? (
                      <span className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        {product.batch_id ? getBatchBadgeWithFlag(product.batch_id) : '限時下單'}
                      </span>
                    ) : isSpot ? (
                      <span className="bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                        現貨供應
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-200 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 shadow-sm">
                        {getBatchBadgeWithFlag(product.batch_id)}
                      </span>
                    )}
                  </div>

                  <div className="cursor-pointer group" onClick={() => { setActiveDetailProduct(product); setCurrentImageIndex(0); }}>
                    {images.length > 0 ? (
                      <div className="relative overflow-hidden rounded-xl mb-3.5 bg-slate-800">
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
                        />
                        {images.length > 1 && (
                          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> {images.length} 張照片
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Info className="w-4 h-4 text-emerald-400" /> 點擊查看商品說明
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-slate-800/60 rounded-xl mb-3.5 flex items-center justify-center text-slate-400 text-sm font-medium">
                        {isLive ? '🔴 限時下單熱賣中' : '📦 專櫃選品'}
                      </div>
                    )}
                    <h3 className="font-bold text-slate-100 text-lg pr-16 leading-snug group-hover:text-emerald-400 transition">{product.name}</h3>

                    {product.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div>
                    {variants.length > 0 && (
                      <div className="mt-3.5">
                        <span className="text-xs text-slate-300 block mb-2 font-medium">選擇規格：</span>
                        <div className="flex flex-wrap gap-2">
                          {variants.map((v) => {
                            const isSelected = currentSelected === v
                            return (
                              <button
                                key={v}
                                type="button"
                                onClick={() =>
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [product.id]: v
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium border transition cursor-pointer ${
                                  isSelected
                                    ? isLive
                                      ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold'
                                      : isSpot
                                      ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-bold'
                                      : 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
                                }`}
                              >
                                {isSelected ? '✓ ' : ''}{v}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">代購價</div>
                      <div className="text-emerald-400 font-black text-xl font-mono">
                        NT$ {product.price?.toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
                        isLive
                          ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
                          : isSpot
                          ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                      }`}
                    >
                      + 加入購物車
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {activeDetailProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" /> 商品詳細說明
              </h3>
              <button onClick={() => setActiveDetailProduct(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const images = getProductImages(activeDetailProduct)
              if (images.length === 0) {
                return (
                  <div className="w-full h-48 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
                    此商品無圖片
                  </div>
                )
              }
              const currentImg = images[currentImageIndex] || images[0]

              return (
                <div className="space-y-3">
                  <div className="relative group cursor-pointer overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
                    <img
                      src={currentImg}
                      alt={activeDetailProduct.name}
                      className="w-full h-72 object-cover"
                      onClick={() => setZoomImageSrc(currentImg)}
                    />
                    
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md font-mono">
                          {currentImageIndex + 1} / {images.length}
                        </span>
                      </>
                    )}

                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
                      <ZoomIn className="w-4 h-4 text-emerald-400" /> 點擊圖片放大檢視細節
                    </div>
                  </div>

                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition ${
                            currentImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`縮圖 ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-100">{activeDetailProduct.name}</h2>
              <div className="text-emerald-400 font-mono font-black text-2xl">
                NT$ {activeDetailProduct.price?.toLocaleString()}
              </div>

              {extractVariants(activeDetailProduct).length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs text-slate-400 block font-medium">選擇規格：</span>
                  <div className="flex flex-wrap gap-2">
                    {extractVariants(activeDetailProduct).map((v) => {
                      const isSelected = (selectedVariants[activeDetailProduct.id] || extractVariants(activeDetailProduct)[0]) === v
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [activeDetailProduct.id]: v
                            }))
                          }
                          className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium border transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{v}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> 產品介紹與規格說明
                </p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {activeDetailProduct.description || '賣家尚未填寫此商品的詳細說明。'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => addToCart(activeDetailProduct)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> + 加入購物車
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomImageSrc && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[60]" onClick={() => setZoomImageSrc(null)}>
          <button onClick={() => setZoomImageSrc(null)} className="absolute top-5 right-5 text-white bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-full cursor-pointer z-10">
            <X className="w-6 h-6" />
          </button>
          <img src={zoomImageSrc} alt="放大細節圖" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-[#06C755]/10 border border-[#06C755]/20 rounded-2xl flex items-center justify-center mx-auto text-[#06C755]">
              <MessageSquare className="w-8 h-8 fill-[#06C755]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-100">需綁定 LINE 帳號</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                本系統採 LINE 實名搶單，採購成功後將透過 LINE 官方即時通知您確認明細與結帳！
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleLineLogin}
                className="w-full py-3.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/40 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                使用 LINE 帳號一鍵授權登入
              </button>

              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2.5 text-slate-400 hover:text-slate-200 text-xs md:text-sm transition cursor-pointer"
              >
                先逛逛其他商品
              </button>
            </div>
          </div>
        </div>
      )}

      {memberModalOpen && lineUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                {lineUser.pictureUrl ? (
                  <img src={lineUser.pictureUrl} alt={lineUser.displayName} className="w-11 h-11 rounded-full border border-emerald-500/30 object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                    {lineUser.displayName[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-100">{lineUser.displayName}</h2>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-4 h-4" /> LINE 認證會員・會員中心
                  </p>
                </div>
              </div>
              <button onClick={() => setMemberModalOpen(false)} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setMemberTab('profile')}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  memberTab === 'profile' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> 常用寄件資料
              </button>
              <button
                onClick={() => setMemberTab('contact')}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  memberTab === 'contact' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> 官方客服
              </button>
            </div>

            {memberTab === 'profile' ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-slate-300 space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> 常用 7-11 寄件資料設定
                  </p>
                  <p className="text-[11px] text-slate-400">
                    在此預先設定您的真實姓名、電話與常備 7-11 門市，下次結帳將自動帶入！
                  </p>
                </div>

                {profileSavedMsg && (
                  <div className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 p-3 rounded-xl font-bold">
                    {profileSavedMsg}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-300 block mb-1">真實姓名 (領件核對證件) <span className="text-rose-500">*必填</span></label>
                    <input
                      type="text"
                      required
                      placeholder="例：林小魚"
                      value={savedName}
                      onChange={(e) => setSavedName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">手機號碼 (10碼，09開頭) <span className="text-rose-500">*必填</span></label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="例：0912345678"
                      value={savedPhone}
                      onChange={(e) => setSavedPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300">常備 7-11 門市 <span className="text-rose-500">*必填</span></label>
                      <button
                        type="button"
                        onClick={open711Map}
                        className="text-amber-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        🗺️ 地圖選門市 <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      readOnly
                      onClick={open711Map}
                      placeholder="點擊上方按鈕選擇 7-11 門市"
                      value={savedStore}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-emerald-300 font-medium cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" /> 儲存常用寄件資料
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 bg-[#06C755]/10 border border-[#06C755]/30 rounded-full flex items-center justify-center mx-auto text-[#06C755]">
                  <MessageSquare className="w-8 h-8 fill-[#06C755]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">需要協助或修改訂單嗎？</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    若您有任何商品問題、需要更改 7-11 門市或查詢匯款進度，歡迎隨時透過 LINE 官方客服與我們聯繫！
                  </p>
                </div>
                <a
                  href="https://line.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white" /> 點擊加入 LINE 官方客服
                </a>
              </div>
            )}

          </div>
        </div>
      )}

      {ordersModalOpen && lineUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-emerald-400" />
                <h2 className="text-base md:text-lg font-bold text-slate-100">我的訂單與採買進度</h2>
              </div>
              <button onClick={() => setOrdersModalOpen(false)} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBuyerOrderTab('active')}
                className={`py-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  buyerOrderTab === 'active' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                進行中 ({activeBuyerOrders.length})
              </button>
              <button
                onClick={() => setBuyerOrderTab('shipping')}
                className={`py-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  buyerOrderTab === 'shipping' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'
                }`}
              >
                準備出貨 ({shippingBuyerOrders.length})
              </button>
              <button
                onClick={() => setBuyerOrderTab('shipped')}
                className={`py-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  buyerOrderTab === 'shipped' ? 'bg-slate-800 text-purple-400' : 'text-slate-400'
                }`}
              >
                已出貨 ({shippedBuyerOrders.length})
              </button>
              <button
                onClick={() => setBuyerOrderTab('completed')}
                className={`py-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  buyerOrderTab === 'completed' ? 'bg-slate-800 text-slate-200' : 'text-slate-400'
                }`}
              >
                已完成 ({completedBuyerOrders.length})
              </button>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {displayedBuyerOrders.length === 0 ? (
                <div className="bg-slate-950/60 p-10 rounded-2xl text-center border border-slate-800 text-slate-400 text-xs">
                  目前沒有此分類的訂單紀錄
                </div>
              ) : (
                displayedBuyerOrders.map((g, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded font-bold">
                        {g.batch_name}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        NT$ {g.total_amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {g.items.map((it, iIdx) => {
                        const isBought = it.status === 'bought'
                        const isFailed = it.status === 'failed'

                        return (
                          <div key={iIdx} className="flex justify-between items-center text-slate-200">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isFailed ? 'line-through text-slate-500' : ''}`}>
                                • {it.name} {it.variant ? `(${it.variant})` : ''} × {it.quantity}
                              </span>
                              {isBought && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                                  ✓ 買到
                                </span>
                              )}
                              {isFailed && (
                                <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded font-bold">
                                  ✕ 缺貨
                                </span>
                              )}
                              {!isBought && !isFailed && (
                                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">
                                  ⏳ 搶單中
                                </span>
                              )}
                            </div>

                            <span className={`font-mono ${isFailed ? 'line-through text-slate-500' : 'text-emerald-400 font-bold'}`}>
                              NT$ {it.price * it.quantity}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {g.pay_status === 'reported' && (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5">
                        <Clock className="w-4 h-4 animate-pulse" /> ⏳ 匯款資訊已送出，等待賣家查帳中...
                      </div>
                    )}

                    {g.overallState === 'ready_to_pay' && (
                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={() => {
                            setOrdersModalOpen(false)
                            setPayModalBatch({
                              batch_name: g.batch_name,
                              amount: g.total_amount,
                              orderIds: g.orderIds
                            })
                            setShippingName(savedName)
                            setShippingPhone(savedPhone)
                            setShippingStore(savedStore)
                          }}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <CreditCard className="w-4 h-4" /> 匯款與填寫取件門市
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {payModalBatch && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                {payModalBatch.batch_name}・結帳轉帳
              </h3>
              <button onClick={() => setPayModalBatch(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">本次應匯總額</span>
                <span className="text-emerald-400 font-mono font-bold text-xl">
                  NT$ {payModalBatch.amount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                <p>🏦 銀行代碼：<span className="text-white font-mono font-bold">822 (中國信託)</span></p>
                <p>💳 匯款帳號：<span className="text-white font-mono font-bold">1234-5678-9012</span></p>
                <p>👤 戶名：<span className="text-white font-bold">林星妤</span></p>
              </div>
            </div>

            <form onSubmit={handleReportPayment} className="space-y-4 text-sm">
              <div>
                <label className="text-slate-300 block mb-1.5 font-medium text-xs">
                  匯款完成後，請輸入帳號末五碼（剛好 5 碼） <span className="text-rose-500">*必填</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="例：88990"
                  value={bankLast5}
                  onChange={(e) => setBankLast5(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono text-center tracking-widest text-base focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> 7-11 寄貨資料（0 元包裹純取貨）
                  </span>
                  {savedName && (
                    <button
                      type="button"
                      onClick={() => {
                        setShippingName(savedName)
                        setShippingPhone(savedPhone)
                        setShippingStore(savedStore)
                      }}
                      className="text-[11px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-500/30 cursor-pointer"
                    >
                      ⚡ 一鍵代入常用資料
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 text-xs">取件人真實姓名 (領件需核對證件) <span className="text-rose-500">*必填</span></label>
                  <input
                    type="text"
                    required
                    placeholder="例：林小魚"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 text-xs md:text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 text-xs">取件人手機號碼 (10碼，09開頭) <span className="text-rose-500">*必填</span></label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="例：0912345678"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 text-xs md:text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 text-xs">7-11 門市名稱與店號 <span className="text-rose-500">*必填</span></label>
                    <button
                      type="button"
                      onClick={open711Map}
                      className="text-xs text-amber-400 hover:text-amber-300 underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      🗺️ 開啟 7-11 地圖選門市
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    onClick={open711Map}
                    placeholder="請點擊右上角按鈕選擇 7-11 門市"
                    value={shippingStore}
                    className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-emerald-300 font-medium placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 text-xs md:text-sm cursor-pointer select-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={reportingPay}
                className="w-full mt-3 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {reportingPay ? '送出中...' : '送出後五碼與寄貨資料，通知賣家查帳'}
              </button>
            </form>
          </div>
        </div>
      )}

      {addedItemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">已加入購物車！</h3>
              <p className="text-sm text-slate-300 mt-1">
                {addedItemModal.name}
                {addedItemModal.variant ? ` (${addedItemModal.variant})` : ''}
              </p>
              <p className="text-emerald-400 font-mono font-bold mt-1 text-base">
                NT$ {addedItemModal.price.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAddedItemModal(null)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs md:text-sm transition cursor-pointer"
              >
                繼續搶其他款
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddedItemModal(null)
                  setIsCartOpen(true)
                }}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs md:text-sm transition shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                查看購物車 ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                購物車 ({totalCount})
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">購物車是空的</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs md:text-sm bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/60"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-medium">
                            {item.batch_name}
                          </span>
                          <p className="font-bold text-slate-100">{item.name}</p>
                        </div>
                        {item.selectedVariant && (
                          <span className="text-xs text-slate-400 block">
                            規格：{item.selectedVariant}
                          </span>
                        )}
                        <p className="text-xs text-slate-300 font-mono">
                          NT$ {item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold cursor-pointer text-sm"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono text-slate-100 font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold cursor-pointer text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex justify-between font-bold text-slate-100 text-base border-t border-slate-800">
                  <span>預估總金額</span>
                  <span className="text-emerald-400 font-mono text-lg font-black">
                    NT$ {totalPrice.toLocaleString()}
                  </span>
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-3 pt-2 border-t border-slate-800">
                  {lineUser && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center gap-3.5">
                      {lineUser.pictureUrl ? (
                        <img src={lineUser.pictureUrl} alt={lineUser.displayName} className="w-9 h-9 rounded-full object-cover border border-emerald-500/40" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                          {lineUser.displayName[0]}
                        </div>
                      )}
                      <div className="text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{lineUser.displayName}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">LINE 已綁定</span>
                        </div>
                        <span className="text-slate-400 block text-xs mt-0.5">批次結束前可隨時追加商品</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition cursor-pointer"
                    >
                      繼續選購
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !lineUser}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/40 cursor-pointer"
                    >
                      {submitting ? '登記中...' : '⚡️ 登記搶單'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StoreFront() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-500 flex items-center justify-center text-sm">載入商場中...</div>}>
      <StoreContent />
    </Suspense>
  )
}
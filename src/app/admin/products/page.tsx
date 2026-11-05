'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Package, Trash2, Tag, Layers, Search, AlertCircle, Edit3, X, Check, DollarSign, Image as ImageIcon, FileText, Eye, EyeOff, Upload, Globe, Box, Flame, Snowflake, Clock } from 'lucide-react'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // 新的主分類與子分類篩選狀態
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'overseas' | 'selected'>('all')
  const [activeSubTab, setActiveSubTab] = useState<string>('ALL')
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL')

  // 編輯商品的 Modal 狀態
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editStock, setEditStock] = useState('')
  const [editVariants, setEditVariants] = useState('')
  const [editDescription, setEditDescription] = useState('')
  
  // 多圖編輯狀態
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])
  const [newImageUrlInput, setNewImageUrlInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 編輯時的分類狀態
  const [editMainCategory, setEditMainCategory] = useState<'overseas' | 'selected'>('overseas')
  const [editSubCategory, setEditSubCategory] = useState<string>('limited')
  const [editBatchId, setEditBatchId] = useState('')

  const [updating, setUpdating] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (prodErr) throw prodErr
      if (prodData) setProducts(prodData)

      const { data: batchData, error: batchErr } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false })

      if (batchErr) throw batchErr
      if (batchData) setBatches(batchData)

    } catch (err) {
      console.error(err)
      alert('載入商品或批次失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (product: any) => {
    const currentActive = product.is_active !== false
    const nextActive = !currentActive

    try {
      const updatePayload = { is_active: nextActive }

      const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', product.id)

      if (error) throw error

      setProducts(products.map(p => p.id === product.id ? { ...p, ...updatePayload } : p))
      
      setSuccessMsg(`🎉 商品「${product.name}」已${nextActive ? '重新上架' : '單獨下架'}！`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      console.error(err)
      alert(`操作失敗：${err.message || '未知錯誤'}`)
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`確定要刪除商品「${String(name)}」嗎？`)) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
      alert('刪除失敗')
    }
  }

  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p)
    setEditName(p.name || '')
    setEditPrice(String(p.price || 0))
    setEditCost(String(p.cost || 0))
    setEditStock(String(p.stock || 9999))
    setEditVariants(Array.isArray(p.variants) ? p.variants.join('\n') : (p.variants || ''))
    setEditDescription(p.description || '')
    
    let imgs: string[] = []
    if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
      imgs = p.image_urls.filter(Boolean)
    } else if (p.image_url) {
      imgs = [p.image_url]
    }
    setEditImageUrls(imgs)
    setNewImageUrlInput('')

    const mCat = p.main_category || 'overseas'
    const sCat = p.sub_category || 'limited'
    setEditMainCategory(mCat)
    setEditSubCategory(sCat)
    setEditBatchId(p.batch_id || (batches.length > 0 ? batches[0].id : ''))
  }

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return
    setEditImageUrls([...editImageUrls, newImageUrlInput.trim()])
    setNewImageUrlInput('')
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setEditImageUrls(editImageUrls.filter((_, idx) => idx !== indexToRemove))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicURLData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        if (publicURLData?.publicUrl) {
          uploadedUrls.push(publicURLData.publicUrl)
        }
      }

      setEditImageUrls(prev => [...prev, ...uploadedUrls])
    } catch (err: any) {
      console.error(err)
      alert(`圖片上傳失敗：${err.message || '請確認 Supabase Storage 是否已建立 product-images 儲存桶'}`)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setUpdating(true)
    try {
      let targetBatchName = editSubCategory === 'ambient' ? '常溫好物' : editSubCategory === 'refrigerated' ? '冷藏好物' : editSubCategory === 'frozen' ? '冷凍好物' : '限時下單'
      let targetBatchId = null

      if (editMainCategory === 'overseas' && editSubCategory === 'international') {
        const found = batches.find(b => b.id === editBatchId)
        if (found) {
          targetBatchName = found.name
          targetBatchId = found.id
        }
      }

      const variantsArray = editVariants
        ? editVariants.split('\n').map(v => v.trim()).filter(Boolean)
        : ['單一規格']

      const updatedData = {
        name: editName.trim(),
        price: Number(editPrice) || 0,
        cost: Number(editCost) || 0,
        stock: 9999,
        variants: variantsArray,
        description: editDescription.trim() || null,
        image_urls: editImageUrls,
        image_url: editImageUrls.length > 0 ? editImageUrls[0] : null,
        main_category: editMainCategory,
        sub_category: editSubCategory,
        batch_id: targetBatchId,
        batch_name: targetBatchName,
      }

      const { error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', editingProduct.id)

      if (error) throw error

      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...updatedData } : p))
      setSuccessMsg('🎉 商品修改成功！')
      setTimeout(() => setSuccessMsg(''), 3000)
      setEditingProduct(null)
    } catch (err: any) {
      console.error(err)
      alert(`修改失敗：${err.message || '未知錯誤'}`)
    } finally {
      setUpdating(false)
    }
  }

  const endedBatchIds = new Set(batches.filter(b => b.status === 'ended').map(b => b.id))
  const endedBatchNames = new Set(batches.filter(b => b.status === 'ended').map(b => b.name))

  const validProducts = products.filter(p => {
    return !((p.batch_id && endedBatchIds.has(p.batch_id)) || (p.batch_name && endedBatchNames.has(p.batch_name)))
  })

  // 篩選邏輯
  const filteredProducts = validProducts.filter(p => {
    const mCat = p.main_category || 'overseas'
    const sCat = p.sub_category || 'limited'

    if (activeMainTab === 'overseas' && mCat !== 'overseas') return false
    if (activeMainTab === 'selected' && mCat !== 'selected') return false

    if (activeSubTab !== 'ALL' && sCat !== activeSubTab) return false

    if (selectedBatchFilter !== 'ALL') {
      if (p.batch_id !== selectedBatchFilter) return false
    }

    return true
  })

  const getVariantsArray = (variants: any): string[] => {
    if (Array.isArray(variants)) return variants.map(v => String(v))
    if (typeof variants === 'string') return variants.split('\n').map(v => v.trim()).filter(Boolean)
    return []
  }

  const getProductImages = (p: any): string[] => {
    if (Array.isArray(p.image_urls) && p.image_urls.length > 0) return p.image_urls.filter(Boolean)
    if (p.image_url) return [p.image_url]
    return []
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <Package className="w-5 h-5 text-emerald-400" />
            商品管理中心
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            統一檢視與管理所有海外代購與 7-11 嚴選好物商品（已結束批次的商品將自動隱藏）。
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* 🌟 第一層主分類按鈕 */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => { setActiveMainTab('all'); setActiveSubTab('ALL'); setSelectedBatchFilter('ALL'); }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activeMainTab === 'all' ? 'bg-slate-800 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-slate-400">全部商品</div>
          <div className="text-lg font-black text-white mt-1">{validProducts.length} 項</div>
        </button>

        <button
          onClick={() => { setActiveMainTab('overseas'); setActiveSubTab('limited'); setSelectedBatchFilter('ALL'); }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activeMainTab === 'overseas' ? 'bg-blue-950/40 border-blue-500 text-blue-300 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-blue-400">🌍 海外代購</div>
          <div className="text-lg font-black text-white mt-1">
            {validProducts.filter(p => (p.main_category || 'overseas') === 'overseas').length} 項
          </div>
        </button>

        <button
          onClick={() => { setActiveMainTab('selected'); setActiveSubTab('ambient'); setSelectedBatchFilter('ALL'); }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activeMainTab === 'selected' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-400">📦 嚴選好物</div>
          <div className="text-lg font-black text-white mt-1">
            {validProducts.filter(p => p.main_category === 'selected').length} 項
          </div>
        </button>
      </div>

      {/* 🌟 第二層子分類篩選導覽列 */}
      {activeMainTab === 'overseas' && (
        <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('limited')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'limited' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏳ 限時下單 ({validProducts.filter(p => (p.main_category || 'overseas') === 'overseas' && (p.sub_category || 'limited') === 'limited').length})
          </button>
          <button
            onClick={() => setActiveSubTab('international')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'international' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌍 各國連線 ({validProducts.filter(p => (p.main_category || 'overseas') === 'overseas' && p.sub_category === 'international').length})
          </button>
        </div>
      )}

      {activeMainTab === 'selected' && (
        <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('ambient')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'ambient' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 常溫 ({validProducts.filter(p => p.main_category === 'selected' && p.sub_category === 'ambient').length})
          </button>
          <button
            onClick={() => setActiveSubTab('refrigerated')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'refrigerated' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔥 冷藏 ({validProducts.filter(p => p.main_category === 'selected' && p.sub_category === 'refrigerated').length})
          </button>
          <button
            onClick={() => setActiveSubTab('frozen')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'frozen' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ❄️ 冷凍 ({validProducts.filter(p => p.main_category === 'selected' && p.sub_category === 'frozen').length})
          </button>
        </div>
      )}

      {/* 批次篩選（當選擇海外代購-各國連線時顯示） */}
      {activeMainTab === 'overseas' && activeSubTab === 'international' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> 依連線批次篩選：
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBatchFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedBatchFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              全部批次
            </button>
            {batches.filter(b => b.status !== 'ended').map(b => {
              const batchNameStr = typeof b.name === 'string' ? b.name : String(b?.name || '未命名批次')
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatchFilter(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    selectedBatchFilter === b.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {batchNameStr}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">載入商品中...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-sm font-bold text-slate-300">此分類目前沒有商品</div>
          <p className="text-xs text-slate-500">請至左側「一鍵快速上架」新增商品！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const variantList = getVariantsArray(p.variants)
            const productName = typeof p.name === 'string' ? p.name : String(p?.name || '未命名商品')
            const isActive = p.is_active !== false
            const images = getProductImages(p)
            const mCat = p.main_category || 'overseas'
            const sCat = p.sub_category || 'limited'

            return (
              <div key={p.id} className={`bg-slate-900 border rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition ${
                isActive ? 'border-slate-800' : 'border-rose-900/50 bg-slate-900/60'
              }`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {mCat === 'overseas' ? (sCat === 'limited' ? '⏳ 海外代購・限時下單' : `🌍 ${p.batch_name || '各國連線'}`) : (
                          sCat === 'ambient' ? '📦 嚴選好物・常溫' : sCat === 'refrigerated' ? '🔥 嚴選好物・冷藏' : '❄️ 嚴選好物・冷凍'
                        )}
                      </span>
                      {!isActive && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                          已下架
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {images.length > 0 ? (
                      <div className="relative">
                        <img src={images[0]} alt={productName} className="w-14 h-14 rounded-2xl object-cover border border-slate-800" />
                        {images.length > 1 && (
                          <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow">
                            {images.length}張
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                        無圖
                      </div>
                    )}
                    <div>
                      <h2 className="text-sm font-bold text-white">{productName}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 font-black text-sm">售 NT$ {String(p.price ?? 0)}</span>
                        <span className="text-slate-400 text-xs">/ 成本 NT$ {String(p.cost ?? 0)}</span>
                      </div>
                    </div>
                  </div>

                  {variantList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {variantList.map((v, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                      isActive
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {isActive ? '單獨下架' : '重新上架'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> 編輯
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, productName)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 刪除
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 編輯商品 Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateProduct} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                編輯商品資料與成本
              </h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">1. 上架主分類</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditMainCategory('overseas'); setEditSubCategory('limited'); }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      editMainCategory === 'overseas' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🌍 海外代購
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditMainCategory('selected'); setEditSubCategory('ambient'); }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      editMainCategory === 'selected' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    📦 嚴選好物
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">2. 子分類 / 溫層</label>
                {editMainCategory === 'overseas' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditSubCategory('limited')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        editSubCategory === 'limited' ? 'bg-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      ⏳ 限時下單
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSubCategory('international')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        editSubCategory === 'international' ? 'bg-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      🌍 各國連線
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditSubCategory('ambient')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        editSubCategory === 'ambient' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      📦 常溫
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSubCategory('refrigerated')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        editSubCategory === 'refrigerated' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      🔥 冷藏
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSubCategory('frozen')}
                      className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        editSubCategory === 'frozen' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      ❄️ 冷凍
                    </button>
                  </div>
                )}
              </div>

              {editMainCategory === 'overseas' && editSubCategory === 'international' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400">所屬連線批次</label>
                  <select
                    value={editBatchId}
                    onChange={(e) => setEditBatchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">商品名稱</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">售價 (NT$)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400">成本 (NT$)</label>
                  <input
                    type="number"
                    required
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300">商品規格 (每行輸入一個規格)</label>
                  <span className="text-[10px] text-slate-400">換行即代表不同規格項目</span>
                </div>
                <textarea
                  rows={3}
                  value={editVariants}
                  onChange={(e) => setEditVariants(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 resize-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">商品詳細說明 (選填)</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">商品照片管理 (可新增多張)</label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    {uploadingImage ? '上傳中...' : '從相簿選擇圖片'}
                  </button>

                  <div className="flex flex-1 gap-2">
                    <input
                      type="url"
                      placeholder="或貼上圖片網址 https://..."
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
                    >
                      + 新增
                    </button>
                  </div>
                </div>

                {editImageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {editImageUrls.map((url, index) => (
                      <div key={index} className="relative group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden h-20">
                        <img src={url} alt={`預覽 ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow transition cursor-pointer"
                          title="刪除此張照片"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 rounded">
                          #{index + 1} {index === 0 ? '(主圖)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                {updating ? '儲存中...' : '儲存修改'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
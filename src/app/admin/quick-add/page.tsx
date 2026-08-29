'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Zap, Plus, Check, Layers, Image as ImageIcon, Tag, DollarSign, Package, Upload, FileText, Trash2, Send, CheckSquare, Square, Box, Edit3, X, AlertCircle } from 'lucide-react'

interface Batch {
  id: string
  name: string
  status?: string
}

interface DraftProduct {
  id: string
  name: string
  price: number
  cost: number
  stock: number
  variants: string[]
  image_url: string | null
  image_urls?: string[] | null
  description: string | null
  category: 'flash' | 'batch' | 'spot'
  batch_id: string | null
  batch_name: string
}

export default function QuickAddPage() {
  const [topTab, setTopTab] = useState<'form' | 'drafts'>('form')

  const [activeTab, setActiveTab] = useState<'flash' | 'batch' | 'spot'>('flash')
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  
  const [showNewBatchInput, setShowNewBatchInput] = useState(false)
  const [newBatchName, setNewBatchName] = useState('')

  // 單品輸入表單狀態
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [stock, setStock] = useState('99')
  const [variants, setVariants] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrlInput, setNewImageUrlInput] = useState('')
  const [description, setDescription] = useState('')
  
  const [uploadingImage, setUploadingImage] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 雲端草稿暫存區狀態
  const [drafts, setDrafts] = useState<DraftProduct[]>([])
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([])
  const [batchPublishing, setBatchPublishing] = useState(false)
  const [loadingDrafts, setLoadingDrafts] = useState(false)

  // 編輯草稿的 Modal 狀態
  const [editingDraft, setEditingDraft] = useState<DraftProduct | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')
  const [editVariants, setEditVariants] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])
  const [editNewUrlInput, setEditNewUrlInput] = useState('')
  const [updatingDraft, setUpdatingDraft] = useState(false)

  useEffect(() => {
    fetchBatches()
    fetchDrafts()
  }, [])

  const fetchBatches = async () => {
    const { data } = await supabase
      .from('batches')
      .select('id, name, status')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      setBatches(data)
      const firstActive = data.find(b => !b.status || b.status === 'active')
      if (firstActive) {
        setSelectedBatchId(firstActive.id)
      } else {
        setSelectedBatchId(data[0].id)
      }
    } else {
      setBatches([])
      setSelectedBatchId('')
    }
  }

  const fetchDrafts = async () => {
    setLoadingDrafts(true)
    try {
      const { data, error } = await supabase
        .from('product_drafts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setDrafts(data)
        setSelectedDraftIds(data.map((d: DraftProduct) => d.id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDrafts(false)
    }
  }

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const MAX_WIDTH = 1000
          const MAX_HEIGHT = 1000

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height)
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Canvas blob compression failed'))
            },
            'image/jpeg',
            0.85
          )
        }
        img.onerror = (error) => reject(error)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploadingImage(true)

    try {
      const compressedBlob = await compressImage(file)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        alert('圖片上傳失敗，請改用貼上網址！')
        setUploadingImage(false)
        return
      }

      const { data: publicURLData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      if (publicURLData?.publicUrl) {
        if (isEditing) {
          setEditImageUrls([...editImageUrls, publicURLData.publicUrl])
        } else {
          setImageUrls([...imageUrls, publicURLData.publicUrl])
        }
      }
    } catch (err: any) {
      console.error(err)
      alert('圖片壓縮或上傳發生錯誤')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddImageUrl = (isEditing = false) => {
    if (isEditing) {
      if (!editNewUrlInput.trim()) return
      setEditImageUrls([...editImageUrls, editNewUrlInput.trim()])
      setEditNewUrlInput('')
    } else {
      if (!newImageUrlInput.trim()) return
      setImageUrls([...imageUrls, newImageUrlInput.trim()])
      setNewImageUrlInput('')
    }
  }

  const handleRemoveImage = (indexToRemove: number, isEditing = false) => {
    if (isEditing) {
      setEditImageUrls(editImageUrls.filter((_, idx) => idx !== indexToRemove))
    } else {
      setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove))
    }
  }

  const handleCreateBatch = async () => {
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
        setSelectedBatchId(data[0].id)
        setNewBatchName('')
        setShowNewBatchInput(false)
      }
    } catch (err: any) {
      console.error(err)
      alert(`新增批次失敗：${err.message || '未知錯誤'}`)
    }
  }

  const resolveTargetBatchInfo = (selectedBId: string, currentCategory: 'flash' | 'batch' | 'spot') => {
    if (currentCategory === 'spot') {
      return { category: 'spot' as const, batchId: null, batchName: '現貨專區' }
    }

    const selectedBatch = batches.find(b => b.id === selectedBId)
    if (!selectedBatch || selectedBatch.status === 'ended') {
      return {
        category: 'spot' as const,
        batchId: null,
        batchName: '現貨專區'
      }
    }

    return {
      category: currentCategory,
      batchId: selectedBatch.id,
      batchName: selectedBatch.name
    }
  }

  const handleDirectPublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('請輸入商品名稱')
      return
    }

    setLoading(true)
    try {
      const targetInfo = resolveTargetBatchInfo(selectedBatchId, activeTab)

      const finalStock = targetInfo.category === 'spot' ? (Number(stock) || 99) : 9999
      const variantsArray = variants
        ? variants.split('\n').map(v => v.trim()).filter(Boolean)
        : ['單一規格']

      const productData = {
        name: name.trim(),
        price: Number(price) || 0,
        cost: Number(cost) || 0,
        stock: finalStock,
        variants: variantsArray,
        image_urls: imageUrls,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        description: description.trim() || null,
        category: targetInfo.category,
        batch_id: targetInfo.batchId,
        batch_name: targetInfo.batchName,
        is_active: true
      }

      const { error } = await supabase.from('products').insert([productData])
      if (error) throw error

      if (targetInfo.category === 'spot' && batches.find(b => b.id === selectedBatchId)?.status === 'ended') {
        alert('💡 提示：您所選的批次已結束，系統已自動將此商品上架至「現貨專區」！')
      }

      setSuccessMsg(`🚀 成功上架商品：${name.trim()} (${targetInfo.batchName})！`)
      setName('')
      setPrice('')
      setCost('')
      setVariants('')
      setImageUrls([])
      setDescription('')

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      alert(`上架失敗：${err.message || '未知錯誤'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToDrafts = async () => {
    if (!name.trim()) {
      alert('請輸入商品名稱')
      return
    }

    const targetInfo = resolveTargetBatchInfo(selectedBatchId, activeTab)

    const finalStock = targetInfo.category === 'spot' ? (Number(stock) || 99) : 9999
    const variantsArray = variants
      ? variants.split('\n').map(v => v.trim()).filter(Boolean)
      : ['單一規格']

    const newDraftData = {
      name: name.trim(),
      price: Number(price) || 0,
      cost: Number(cost) || 0,
      stock: finalStock,
      variants: variantsArray,
      image_urls: imageUrls,
      image_url: imageUrls.length > 0 ? imageUrls[0] : null,
      description: description.trim() || null,
      category: targetInfo.category,
      batch_id: targetInfo.batchId,
      batch_name: targetInfo.batchName
    }

    try {
      const { data, error } = await supabase
        .from('product_drafts')
        .insert([newDraftData])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setDrafts([data[0], ...drafts])
        setSelectedDraftIds([...selectedDraftIds, data[0].id])
      }

      setSuccessMsg(`📦 已成功加入雲端草稿暫存 (${targetInfo.batchName})！`)
      
      setName('')
      setPrice('')
      setCost('')
      setVariants('')
      setImageUrls([])
      setDescription('')

      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      console.error(err)
      alert(`加入草稿失敗：${err.message || '未知錯誤'}`)
    }
  }

  const handleOpenEditDraft = (d: DraftProduct) => {
    setEditingDraft(d)
    setEditName(d.name || '')
    setEditPrice(String(d.price || 0))
    setEditStock(String(d.stock || 99))
    setEditVariants(Array.isArray(d.variants) ? d.variants.join('\n') : '')
    setEditDescription(d.description || '')
    
    let imgs: string[] = []
    if (Array.isArray(d.image_urls) && d.image_urls.length > 0) {
      imgs = d.image_urls.filter(Boolean)
    } else if (d.image_url) {
      imgs = [d.image_url]
    }
    setEditImageUrls(imgs)
    setEditNewUrlInput('')
  }

  const handleUpdateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDraft) return

    setUpdatingDraft(true)
    try {
      const variantsArray = editVariants
        ? editVariants.split('\n').map(v => v.trim()).filter(Boolean)
        : ['單一規格']

      const updatedFields = {
        name: editName.trim(),
        price: Number(editPrice) || 0,
        stock: Number(editStock) || 99,
        variants: variantsArray,
        description: editDescription.trim() || null,
        image_urls: editImageUrls,
        image_url: editImageUrls.length > 0 ? editImageUrls[0] : null,
      }

      const { error } = await supabase
        .from('product_drafts')
        .update(updatedFields)
        .eq('id', editingDraft.id)

      if (error) throw error

      setDrafts(drafts.map(d => d.id === editingDraft.id ? { ...d, ...updatedFields } : d))
      setSuccessMsg('🎉 草稿修改成功！')
      setTimeout(() => setSuccessMsg(''), 3000)
      setEditingDraft(null)
    } catch (err: any) {
      console.error(err)
      alert(`修改草稿失敗：${err.message || '未知錯誤'}`)
    } finally {
      setUpdatingDraft(false)
    }
  }

  const toggleSelectDraft = (id: string) => {
    if (selectedDraftIds.includes(id)) {
      setSelectedDraftIds(selectedDraftIds.filter(itemId => itemId !== id))
    } else {
      setSelectedDraftIds([...selectedDraftIds, id])
    }
  }

  const handleToggleSelectAll = () => {
    if (selectedDraftIds.length === drafts.length) {
      setSelectedDraftIds([])
    } else {
      setSelectedDraftIds(drafts.map(d => d.id))
    }
  }

  const handleRemoveDraft = async (id: string) => {
    try {
      await supabase.from('product_drafts').delete().eq('id', id)
      setDrafts(drafts.filter(d => d.id !== id))
      setSelectedDraftIds(selectedDraftIds.filter(itemId => itemId !== id))
    } catch (err) {
      console.error(err)
      alert('刪除草稿失敗')
    }
  }

  const handleClearAllDrafts = async () => {
    if (!confirm('確定要清空所有草稿嗎？')) return
    try {
      await supabase.from('product_drafts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      setDrafts([])
      setSelectedDraftIds([])
    } catch (err) {
      console.error(err)
    }
  }

  const handleBatchPublishSelected = async () => {
    const itemsToPublish = drafts.filter(d => selectedDraftIds.includes(d.id))
    if (itemsToPublish.length === 0) {
      alert('請先勾選想要上架的商品！')
      return
    }

    if (!confirm(`確定要將已勾選的 ${itemsToPublish.length} 項商品正式上架嗎？`)) return

    setBatchPublishing(true)
    try {
      const payload = itemsToPublish.map(d => {
        const batchObj = batches.find(b => b.id === d.batch_id)
        const isEnded = batchObj && batchObj.status === 'ended'
        const imgs = Array.isArray(d.image_urls) && d.image_urls.length > 0 ? d.image_urls : (d.image_url ? [d.image_url] : [])

        return {
          name: d.name,
          price: d.price,
          cost: d.cost,
          stock: isEnded ? (d.stock || 99) : 9999,
          variants: d.variants,
          image_urls: imgs,
          image_url: imgs.length > 0 ? imgs[0] : null,
          description: d.description,
          category: isEnded ? 'spot' : d.category,
          batch_id: isEnded ? null : d.batch_id,
          batch_name: isEnded ? '現貨專區' : d.batch_name,
          is_active: true
        }
      })

      const { error: insertError } = await supabase.from('products').insert(payload)
      if (insertError) throw insertError

      const publishedIds = itemsToPublish.map(d => d.id)
      const { error: deleteError } = await supabase.from('product_drafts').delete().in('id', publishedIds)
      if (deleteError) throw deleteError

      setSuccessMsg(`🚀 成功正式上架已勾選的 ${itemsToPublish.length} 項商品！`)
      
      const remainingDrafts = drafts.filter(d => !publishedIds.includes(d.id))
      setDrafts(remainingDrafts)
      setSelectedDraftIds([])

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      alert(`批次上架失敗：${err.message || '未知錯誤'}`)
    } finally {
      setBatchPublishing(false)
    }
  }

  const currentSelectedBatch = batches.find(b => b.id === selectedBatchId)
  const isCurrentBatchEnded = currentSelectedBatch && currentSelectedBatch.status === 'ended'

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-emerald-400" />
          全方位快速上架與雲端草稿同步
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          在此填寫商品資料。若所選批次已結束，系統會自動轉為上架至「現貨專區」！
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* 頂部頁面切換標籤 */}
      <div className="flex gap-3">
        <button
          onClick={() => setTopTab('form')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition cursor-pointer border flex items-center justify-center gap-2 ${
            topTab === 'form'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" /> ⚡ 快速上架填寫
        </button>
        <button
          onClick={() => setTopTab('drafts')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition cursor-pointer border flex items-center justify-center gap-2 relative ${
            topTab === 'drafts'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-4 h-4" /> 📦 雲端草稿暫存區
          {drafts.length > 0 && (
            <span className="absolute right-3 bg-emerald-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
              {drafts.length}
            </span>
          )}
        </button>
      </div>

      {topTab === 'form' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> 1. 選擇上架專區
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('flash')}
                className={`py-3 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === 'flash'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🔥 限時下單
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className={`py-3 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === 'batch'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ✈️ 各國連線
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spot')}
                className={`py-3 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === 'spot'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                📦 現貨專區
              </button>
            </div>
          </div>

          {activeTab !== 'spot' && (
            <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  📌 2. 選擇進行中的所屬批次
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewBatchInput(!showNewBatchInput)}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> {showNewBatchInput ? '取消新增' : '建立新批次'}
                </button>
              </div>

              {showNewBatchInput && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="輸入新批次名稱..."
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleCreateBatch}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    確認建立
                  </button>
                </div>
              )}

              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                {batches.length === 0 ? (
                  <option value="">目前尚無批次，請點擊上方「建立新批次」</option>
                ) : (
                  batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.status === 'ended' ? ' (已結束 ➔ 將自動轉為現貨)' : ''}
                    </option>
                  ))
                )}
              </select>

              {isCurrentBatchEnded && (
                <div className="bg-amber-950/40 border border-amber-500/40 text-amber-300 p-3 rounded-xl text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>注意：您目前選取的批次已結束，在此上架將會自動轉為<strong>「現貨專區」</strong>。</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> 商品名稱
              </label>
              <input
                type="text"
                required
                placeholder="例如：Bakehouse 蛋塔"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className={`grid gap-2 ${(activeTab === 'spot' || isCurrentBatchEnded) ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> 售價 (NT$)
                </label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>
              {(activeTab === 'spot' || isCurrentBatchEnded) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" /> 現貨庫存
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300">商品規格 (每行輸入一個規格)</label>
              <span className="text-[10px] text-slate-400">換行即代表不同規格項目</span>
            </div>
            <textarea
              rows={3}
              placeholder="例如：&#10;原味&#10;巧克力"
              value={variants}
              onChange={(e) => setVariants(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 resize-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> 商品詳細說明 (選填)
            </label>
            <textarea
              rows={2}
              placeholder="請輸入商品介紹..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {/* 🟢 多張圖片管理與上架區塊 */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> 商品照片管理 (可新增多張)
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{uploadingImage ? '壓縮上傳中...' : '從相簿選擇圖片'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <div className="flex-1 w-full flex gap-2">
                <input
                  type="url"
                  placeholder="或貼上圖片網址 https://..."
                  value={newImageUrlInput}
                  onChange={(e) => setNewImageUrlInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddImageUrl(false)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
                >
                  + 新增
                </button>
              </div>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden h-20">
                    <img src={url} alt={`預覽 ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, false)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={loading || uploadingImage}
              onClick={handleDirectPublish}
              className="py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Zap className="w-4 h-4" /> {loading ? '上架中...' : '⚡ 立即直接上架'}
            </button>
            <button
              type="button"
              disabled={uploadingImage}
              onClick={handleAddToDrafts}
              className="py-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-black rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Box className="w-4 h-4" /> 📦 加入雲端草稿暫存
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                📦 雲端草稿暫存區 ({drafts.length} 項)
              </h2>
              {drafts.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-xl font-bold transition cursor-pointer"
                >
                  {selectedDraftIds.length === drafts.length ? '取消全選' : '全選所有暫存'}
                </button>
              )}
            </div>
            {drafts.length > 0 && (
              <button
                onClick={handleClearAllDrafts}
                className="text-xs text-rose-400 hover:underline cursor-pointer"
              >
                清空全部
              </button>
            )}
          </div>

          {loadingDrafts ? (
            <div className="text-center py-16 text-xs text-slate-500">同步雲端草稿中...</div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500 space-y-2">
              <Box className="w-8 h-8 text-slate-600 mx-auto" />
              <p>目前雲端暫存區是空的，請先至「⚡ 快速上架填寫」加入商品！</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {drafts.map((d, index) => {
                  const isChecked = selectedDraftIds.includes(d.id)
                  const imgs = Array.isArray(d.image_urls) && d.image_urls.length > 0 ? d.image_urls : (d.image_url ? [d.image_url] : [])

                  return (
                    <div
                      key={d.id}
                      onClick={() => toggleSelectDraft(d.id)}
                      className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 transition cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md'
                          : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelectDraft(d.id)
                          }}
                          className="text-emerald-400 focus:outline-none cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </button>

                        <span className="text-xs font-mono text-slate-500 w-5">#{index + 1}</span>
                        
                        {imgs.length > 0 ? (
                          <div className="relative">
                            <img src={imgs[0]} alt={d.name} className="w-11 h-11 rounded-xl object-cover border border-slate-800" />
                            {imgs.length > 1 && (
                              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 font-bold text-[9px] px-1 py-0.5 rounded-full">
                                {imgs.length}張
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-[10px]">無圖</div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-white">{d.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 font-mono font-bold">NT$ {d.price}</span>
                            <span>｜</span>
                            <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-emerald-300">{d.batch_name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEditDraft(d)
                          }}
                          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> 編輯
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveDraft(d.id)
                          }}
                          className="text-slate-500 hover:text-rose-400 p-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                disabled={batchPublishing || selectedDraftIds.length === 0}
                onClick={handleBatchPublishSelected}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <Send className="w-4 h-4" />
                {batchPublishing ? '上架中...' : `🚀 一鍵批次上架已勾選的 ${selectedDraftIds.length} 項商品`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 編輯草稿 Modal（支援多圖上傳與相簿選擇） */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateDraft} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                編輯草稿商品與多張照片
              </h3>
              <button type="button" onClick={() => setEditingDraft(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
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
                  <label className="text-xs font-bold text-slate-300">庫存</label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
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

              {/* 草稿編輯中的多圖管理與相簿選擇區塊 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">商品照片管理 (可新增多張)</label>
                
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <label className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>從相簿選擇圖片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 w-full flex gap-2">
                    <input
                      type="url"
                      placeholder="貼上圖片網址 https://..."
                      value={editNewUrlInput}
                      onChange={(e) => setEditNewUrlInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImageUrl(true)}
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
                          onClick={() => handleRemoveImage(index, true)}
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
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={updatingDraft}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                {updatingDraft ? '儲存中...' : '儲存修改'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
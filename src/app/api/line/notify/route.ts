import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, orderIds, lineName, batchName, amount, bankLast5, storeName } = body

    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ success: false, error: '未設定 LINE_CHANNEL_ACCESS_TOKEN' }, { status: 500 })
    }

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, error: '缺少 orderIds' }, { status: 400 })
    }

    // 從資料庫撈出這筆訂單的 line_id
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('line_id, buyer_name')
      .in('id', orderIds)

    if (fetchError || !orders || orders.length === 0) {
      throw new Error('找不到對應的訂單或 line_id')
    }

    const targetUserId = orders[0].line_id
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: '該訂單沒有綁定 LINE ID (line_id 為空)' }, { status: 400 })
    }

    let textMessage = ''

    if (type === 'payment_confirmed') {
      textMessage = `✅ 【入帳成功通知】\n您在「${batchName}」的匯款已確認入帳！\n總金額：NT$ ${amount?.toLocaleString()}\n我們正準備為您安排出貨，謝謝您！`
    } else if (type === 'order_shipped') {
      textMessage = `📦 【商品已出貨通知】\n您在「${batchName}」訂購的商品已經寄出囉！\n將配送至 7-11 ${storeName || '指定門市'}，請留意取件簡訊前往取貨。`
    } else {
      textMessage = `🔔 【訂單進度通知】\n您在「${batchName}」的訂單狀態已更新。`
    }

    // 發送 LINE Push 訊息給買家
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        to: targetUserId,
        messages: [{ type: 'text', text: textMessage }]
      })
    })

    if (!response.ok) {
      const errRes = await response.text()
      throw new Error(`LINE API 錯誤: ${errRes}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('LINE 自動推播失敗:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
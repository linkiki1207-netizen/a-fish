import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json()

    if (!userId || !message) {
      return NextResponse.json({ success: false, error: '缺少 userId 或 message' }, { status: 400 })
    }

    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ success: false, error: '未設定 LINE_CHANNEL_ACCESS_TOKEN' }, { status: 500 })
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      })
    })

    if (!response.ok) {
      const errRes = await response.text()
      throw new Error(`LINE API 錯誤: ${errRes}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('LINE 推播失敗:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
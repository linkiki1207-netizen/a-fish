import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 🟢 動態抓取當前發起請求的主機網址（本機會是 http://localhost:3000，上線會是 https://a-fish.vercel.app）
  const urlObj = new URL(request.url)
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=no_code`)
  }

  try {
    const channelId = '2011277163'
    const channelSecret = process.env.LINE_CHANNEL_SECRET || ''
    const redirectUri = `${baseUrl}/api/auth/line/callback`

    // 1. 向 LINE 換取 Token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('LINE Token 換取失敗:', tokenData)
      return NextResponse.redirect(`${baseUrl}/?error=token_failed`)
    }

    // 2. 取得買家 Profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const profileData = await profileResponse.json()
    if (!profileResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/?error=profile_failed`)
    }

    const lineUser = {
      userId: profileData.userId,
      displayName: profileData.displayName,
      pictureUrl: profileData.pictureUrl || '',
    }

    // 3. 帶入使用者資料跳回首頁
    const userParam = encodeURIComponent(JSON.stringify(lineUser))
    return NextResponse.redirect(`${baseUrl}/?line_user=${userParam}`)
  } catch (err: any) {
    console.error('Callback Server Error:', err)
    return NextResponse.redirect(`${baseUrl}/?error=server_error`)
  }
}
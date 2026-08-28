import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const storeName = formData.get('storename')?.toString() || ''
    const storeId = formData.get('storeid')?.toString() || ''
    const storeAddress = formData.get('storeaddress')?.toString() || ''

    const result = {
      storeName,
      storeId,
      storeAddress,
      fullStoreInfo: `7-11 ${storeName}門市 (${storeId})`
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>門市選取完成</title>
        </head>
        <body style="background:#020617;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <div style="text-align:center;">
            <p style="font-size:18px;font-weight:bold;color:#10b981;">✓ 門市選取成功！</p>
            <p style="font-size:14px;color:#94a3b8;">正在自動帶入並關閉視窗...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage(${JSON.stringify(result)}, '*');
              setTimeout(function() { window.close(); }, 500);
            } else {
              window.location.href = '/?selected_store=' + encodeURIComponent('${result.fullStoreInfo}');
            }
          </script>
        </body>
      </html>
    `

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    return NextResponse.redirect('https://a-fish.vercel.app')
  }
}

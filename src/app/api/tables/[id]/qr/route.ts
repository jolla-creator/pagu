import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const url = `${baseUrl}/table/${params.id}`
    const qrCode = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#2D2D2D', light: '#FFFFFF' },
    })

    return NextResponse.json({ qrCode, url })
  } catch (error) {
    return NextResponse.json({ error: 'Errore generazione QR' }, { status: 500 })
  }
}

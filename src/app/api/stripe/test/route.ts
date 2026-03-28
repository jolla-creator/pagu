import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY
  return NextResponse.json({
    status: 'ok',
    mode: key?.startsWith('sk_test') ? 'test' : 'live',
    configured: !!key && key !== 'sk_test_placeholder',
  })
}

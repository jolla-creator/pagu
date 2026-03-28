import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, tableId, customerName } = body

    if (!items || items.length === 0 || !tableId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const lineItems = items.map((item: { name: string; price: number; quantity: number }) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.name },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/table/${tableId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/table/${tableId}`,
      metadata: {
        tableId,
        customerName: customerName || '',
        items: JSON.stringify(items),
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Errore checkout' }, { status: 500 })
  }
}

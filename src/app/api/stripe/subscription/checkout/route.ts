import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const restaurantId = body.restaurantId
    const plan: 'BASIC' | 'PRO' = (body.plan ?? 'BASIC') as any

    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
    }

    const priceId = plan === 'PRO'
      ? process.env.STRIPE_SUBSCRIPTION_PRO_PRICE_ID
      : process.env.STRIPE_SUBSCRIPTION_PRICE_ID

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
    }

    // Fetch connected account id for the restaurant
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { stripeAccountId: true } })
    const connectedAccount = restaurant?.stripeAccountId
    if (!connectedAccount) {
      return NextResponse.json({ error: 'Restaurant is not connected to Stripe' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/stripes/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/stripes/subscribe`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          restaurantId,
          plan,
        },
      },
    }, {
      stripeAccount: connectedAccount,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Errore checkout' }, { status: 500 })
  }
}

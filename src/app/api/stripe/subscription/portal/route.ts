import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const restaurantId = body.restaurantId
    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { stripeAccountId: true } })
    if (!restaurant?.stripeAccountId) {
      return NextResponse.json({ error: 'Restaurant is not connected to Stripe' }, { status: 400 })
    }

    // Use latest subscription to get customer id
    const sub = await prisma.subscription.findFirst({ where: { restaurantId }, orderBy: { createdAt: 'desc' }, select: { stripeCustomerId: true } })
    if (!sub?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found for this restaurant' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: appUrl,
    }, {
      stripeAccount: restaurant.stripeAccountId,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Errore portal' }, { status: 500 })
  }
}

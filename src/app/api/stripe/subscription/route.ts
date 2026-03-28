import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
// Price IDs are read directly from environment variables in the checkout flow

// Simple protected route placeholder: manage subscriptions in DB with 14-day trial
// POST: Create subscription with 14-day trial for the authenticated restaurant
// GET: Get current subscription status for restaurant
// DELETE: Cancel subscription

type Req = { restaurantId?: string; plan?: 'BASIC' | 'PRO' }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // In a real app, restaurantId would come from an authenticated session
    const restaurantId = body.restaurantId
    const plan: 'BASIC' | 'PRO' = (body.plan ?? 'BASIC') as any

    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
    }

    // Ensure valid plan
    if (plan === 'PRO' && !process.env.STRIPE_SUBSCRIPTION_PRO_PRICE_ID) {
      return NextResponse.json({ error: 'PRO plan not configured' }, { status: 400 })
    }

    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    const sub = await prisma.subscription.create({
      data: {
        restaurantId,
        status: 'TRIALING',
        plan,
        trialEnd,
      },
    })

    return NextResponse.json({ id: sub.id, trialEnd: sub.trialEnd, status: sub.status, plan: sub.plan })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Errore' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // restaurantId from query for compatibility; in a real app use auth
    const url = new URL(request.url)
    const restaurantId = url.searchParams.get('restaurantId') || ''
    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
    }

    const sub = await prisma.subscription.findFirst({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    })

    if (!sub) return NextResponse.json({})
    return NextResponse.json({
      id: sub.id,
      restaurantId: sub.restaurantId,
      status: sub.status,
      plan: sub.plan,
      trialEnd: sub.trialEnd,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      stripeCustomerId: sub.stripeCustomerId,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Errore' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const restaurantId = url.searchParams.get('restaurantId') || ''
    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
    }

    const sub = await prisma.subscription.findFirst({ where: { restaurantId }, orderBy: { createdAt: 'desc' } })
    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Attempt to cancel on Stripe if we have a connected subscription
    if (sub.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true })
      } catch {
        // Ignore Stripe errors for now; keep local state independent
      }
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'CANCELLED',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Errore' }, { status: 500 })
  }
}

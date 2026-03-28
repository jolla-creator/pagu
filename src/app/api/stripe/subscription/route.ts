import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { verifyJwt } from '@/lib/auth'

function getAuth(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader.split('pagu_session=')[1]?.split(';')[0]
  if (!token) return null
  return verifyJwt(token)
}

export async function POST(request: Request) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const plan: 'BASIC' | 'PRO' = (body.plan ?? 'BASIC') as 'BASIC' | 'PRO'

    if (plan === 'PRO' && !process.env.STRIPE_SUBSCRIPTION_PRO_PRICE_ID) {
      return NextResponse.json({ error: 'Piano PRO non configurato' }, { status: 400 })
    }

    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    const sub = await prisma.subscription.create({
      data: {
        restaurantId: auth.restaurantId,
        status: 'TRIALING',
        plan,
        trialEnd,
      },
    })

    return NextResponse.json({ id: sub.id, trialEnd: sub.trialEnd, status: sub.status, plan: sub.plan })
  } catch (error: any) {
    console.error('Subscription POST error:', error)
    return NextResponse.json({ error: error?.message ?? 'Errore' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const sub = await prisma.subscription.findFirst({
      where: { restaurantId: auth.restaurantId },
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
    console.error('Subscription GET error:', error)
    return NextResponse.json({ error: error?.message ?? 'Errore' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const sub = await prisma.subscription.findFirst({
      where: { restaurantId: auth.restaurantId },
      orderBy: { createdAt: 'desc' }
    })

    if (!sub) {
      return NextResponse.json({ error: 'Abbonamento non trovato' }, { status: 404 })
    }

    if (sub.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true })
      } catch (e) {
        console.error('Stripe cancel error:', e)
      }
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Subscription DELETE error:', error)
    return NextResponse.json({ error: error?.message ?? 'Errore' }, { status: 500 })
  }
}

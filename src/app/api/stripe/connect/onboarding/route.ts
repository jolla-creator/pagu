import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
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

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Ristorante non trovato' }, { status: 404 })
    }

    let accountLink
    if (!restaurant.stripeAccountId) {
      const accountEmail = restaurant.email || `${restaurant.id}@pagu.temp`
      
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'IT',
        email: accountEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          restaurantId: restaurant.id,
        },
      })

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { stripeAccountId: account.id },
      })

      accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/impostazioni`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect/callback`,
        type: 'account_onboarding',
      })
    } else {
      accountLink = await stripe.accountLinks.create({
        account: restaurant.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/impostazioni`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect/callback`,
        type: 'account_onboarding',
      })
    }

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Errore durante l\'onboarding Stripe' }, { status: 500 })
  }
}
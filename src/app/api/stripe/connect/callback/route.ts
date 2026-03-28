import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account')

    if (!accountId) {
      return NextResponse.redirect(new URL('/impostazioni?error=missing_account', request.url))
    }

    const account = await stripe.accounts.retrieve(accountId)

    const restaurant = await prisma.restaurant.findFirst({
      where: { stripeAccountId: accountId },
    })

    if (!restaurant) {
      return NextResponse.redirect(new URL('/impostazioni?error=restaurant_not_found', request.url))
    }

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        onboardingCompleted: true,
        stripeEnabled: account.charges_enabled && account.payouts_enabled,
      },
    })

    return NextResponse.redirect(new URL('/impostazioni?success=stripe_connected', request.url))
  } catch (error: any) {
    return NextResponse.redirect(new URL('/impostazioni?error=callback_failed', request.url))
  }
}
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { emitOrderEvent } from '@/lib/events'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}
        const { tableId, items: itemsJson, customerName } = metadata

        if (tableId && itemsJson) {
          const items = JSON.parse(itemsJson)

          let total = 0
          const orderItems = items.map((item: { name: string; price: number; quantity: number; menuItemId?: string }) => {
            const itemTotal = item.price * item.quantity
            total += itemTotal
            return {
              menuItemId: item.menuItemId || 'unknown',
              quantity: item.quantity,
              price: item.price,
            }
          })

          const table = await prisma.table.findUnique({
            where: { id: tableId }
          })

          const order = await prisma.order.create({
            data: {
              tableId,
              restaurantId: table?.restaurantId || '',
              total,
              status: 'PAID',
              stripePaymentId: session.payment_intent ? session.payment_intent.toString() : undefined,
              customerName: customerName || null,
              items: { create: orderItems.map((item: { menuItemId: string; quantity: number; price: number }) => ({ ...item, restaurantId: table?.restaurantId || '' })) },
            },
            include: { items: true, table: true }
          })

          // Emit SSE event for real-time updates
          if (table?.restaurantId) {
            emitOrderEvent(table.restaurantId, 'NEW_ORDER', {
              orderId: order.id,
              order,
              status: order.status,
              timestamp: new Date().toISOString()
            })
          }
        }

        // Handle subscription checkout
        const restaurantIdFromMeta = metadata?.restaurantId
        const subscriptionId = session?.subscription
        if (restaurantIdFromMeta && subscriptionId) {
          const stripeSub = await stripe.subscriptions.retrieve(
            subscriptionId as string,
            { expand: ['customer', 'items.data.price'] }
          )

          const priceId = stripeSub.items?.data?.[0]?.price?.id
          const isPro = priceId === process.env.STRIPE_SUBSCRIPTION_PRO_PRICE_ID
          const plan = isPro ? 'PRO' : 'BASIC'

          const start = stripeSub.current_period_start
          const end = stripeSub.current_period_end
          const trialEnd = stripeSub.trial_end

          await prisma.subscription.create({
            data: {
              restaurantId: restaurantIdFromMeta,
              stripeSubscriptionId: stripeSub.id,
              stripeCustomerId: stripeSub.customer as string,
              status: stripeSub.status?.toUpperCase?.() || 'TRIALING',
              plan,
              currentPeriodStart: start ? new Date((start as number) * 1000) : null,
              currentPeriodEnd: end ? new Date((end as number) * 1000) : null,
              trialEnd: trialEnd ? new Date((trialEnd as number) * 1000) : null,
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const restaurantId = subscription.metadata?.restaurantId

        if (restaurantId) {
          const priceId = subscription.items?.data?.[0]?.price?.id
          const isPro = priceId === process.env.STRIPE_SUBSCRIPTION_PRO_PRICE_ID
          const plan = isPro ? 'PRO' : 'BASIC'

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: subscription.status?.toUpperCase?.() || 'ACTIVE',
              plan,
              currentPeriodStart: subscription.current_period_start
                ? new Date(subscription.current_period_start * 1000)
                : undefined,
              currentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : undefined,
              trialEnd: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : undefined,
            }
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELLED'
          }
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const restaurantId = paymentIntent.metadata?.restaurantId
        const orderId = paymentIntent.metadata?.orderId

        if (orderId && restaurantId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
          })

          emitOrderEvent(restaurantId, 'STATUS_CHANGE', {
            orderId,
            status: 'CANCELLED',
            timestamp: new Date().toISOString()
          })
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        // Update restaurant stripe status if needed
        if (account.id) {
          const restaurant = await prisma.restaurant.findFirst({
            where: { stripeAccountId: account.id }
          })

          if (restaurant) {
            await prisma.restaurant.update({
              where: { id: restaurant.id },
              data: {
                stripeEnabled: account.charges_enabled && account.payouts_enabled
              }
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

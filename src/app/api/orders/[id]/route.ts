import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { emitOrderEvent } from '@/lib/events'
import { verifyJwt } from '@/lib/auth'

function getAuth(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader.split('pagu_session=')[1]?.split(';')[0]
  if (!token) return null
  return verifyJwt(token)
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        table: true,
        items: { include: { menuItem: true } },
        review: true,
      },
    })

    if (!order || order.restaurantId !== auth.restaurantId) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'PAID', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 })
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: { restaurantId: true }
    })

    if (!existingOrder || existingOrder.restaurantId !== auth.restaurantId) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    })

    try {
      emitOrderEvent(order.restaurantId, 'STATUS_CHANGE', {
        orderId: order.id,
        order: {
          id: order.id,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt?.toISOString?.() ?? new Date().toISOString(),
          restaurantId: order.restaurantId,
        },
        status: order.status,
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Failed to emit STATUS_CHANGE event', e)
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order PUT error:', error)
    return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 })
  }
}

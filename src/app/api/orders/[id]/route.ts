import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { emitOrderEvent } from '@/lib/events'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        table: true,
        items: { include: { menuItem: true } },
        review: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'PAID', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    })
    // Emit STATUS_CHANGE event for the restaurant if identifiable
    try {
      const restaurantId = (order as any).restaurantId || (order as any).table?.restaurantId
      if (restaurantId) {
        const sanitizedOrder = {
          id: order.id,
          total: order.total,
          status: order.status,
          createdAt: (order as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
          restaurantId: restaurantId,
        }
        emitOrderEvent(restaurantId, 'STATUS_CHANGE', {
          orderId: order.id,
          order: sanitizedOrder,
          status: order.status,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (e) {
      console.error('Failed to emit STATUS_CHANGE event', e)
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 })
  }
}

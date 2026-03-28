import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { emitOrderEvent } from '@/lib/events'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        table: true,
        items: {
          include: { menuItem: true },
        },
        review: true,
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tableId, items, customerName, notes } = body

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId }
    })

    if (!table) {
      return NextResponse.json({ error: 'Tavolo non trovato' }, { status: 404 })
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) } },
    })

    let total = 0
    const orderItems = items.map((item: { menuItemId: string; quantity: number; notes?: string }) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)
      if (!menuItem) throw new Error('Piatto non trovato')
      const itemTotal = menuItem.price * item.quantity
      total += itemTotal
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || null,
        restaurantId: table.restaurantId,
      }
    })

    const order = await prisma.order.create({
      data: {
        tableId,
        restaurantId: table.restaurantId,
        total,
        customerName: customerName || null,
        notes: notes || null,
        status: 'PENDING',
        items: { create: orderItems },
      },
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    })

    emitOrderEvent(table.restaurantId, 'NEW_ORDER', {
      orderId: order.id,
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        restaurantId: table.restaurantId,
      },
      status: order.status,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Errore creazione ordine' }, { status: 500 })
  }
}

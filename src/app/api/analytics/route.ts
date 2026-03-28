import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await prisma.order.findMany({
      where: { 
        createdAt: { gte: today },
        status: 'PAID',
      },
      include: { items: { include: { menuItem: true } } },
    })

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

    const activeTables = await prisma.order.groupBy({
      by: ['tableId'],
      where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
    })
    const activeTableCount = activeTables.length

    const avgPerTable = todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0

    const itemCounts: Record<string, number> = {}
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.menuItem?.name ?? 'Sconosciuto'
        itemCounts[name] = (itemCounts[name] || 0) + item.quantity
      })
    })

    const topItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const ordersByDay = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayOrders = await prisma.order.findMany({
        where: { 
          createdAt: { gte: date, lt: nextDate },
          status: 'PAID',
        },
      })

      ordersByDay.push({
        date: date.toLocaleDateString('it-IT', { weekday: 'short' }),
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      })
    }

    return NextResponse.json({
      todayOrders: todayOrders.length,
      todayRevenue,
      activeTables: activeTableCount,
      avgPerTable,
      topItems,
      ordersByDay,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

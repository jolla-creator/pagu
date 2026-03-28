import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: { menuItem: true },
            },
            review: true,
          },
        },
      },
    })

    if (!table) {
      return NextResponse.json({ error: 'Tavolo non trovato' }, { status: 404 })
    }

    return NextResponse.json({ table, orders: table.orders })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

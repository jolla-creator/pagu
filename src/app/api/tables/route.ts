import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
        },
      },
    })

    return NextResponse.json({ tables })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { number, restaurantId, count } = body

    if (count && count > 1) {
      const lastTable = await prisma.table.findFirst({
        orderBy: { number: 'desc' },
      })
      const startNumber = lastTable ? lastTable.number + 1 : 1

      const tables = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          prisma.table.create({
            data: { number: startNumber + i, restaurantId },
          })
        )
      )

      return NextResponse.json({ tables }, { status: 201 })
    }

    const table = await prisma.table.create({
      data: { number, restaurantId },
    })

    return NextResponse.json({ table }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Errore creazione tavolo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('id')

    if (!tableId) {
      return NextResponse.json({ error: 'ID tavolo mancante' }, { status: 400 })
    }

    await prisma.table.delete({
      where: { id: tableId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore eliminazione tavolo' }, { status: 500 })
  }
}

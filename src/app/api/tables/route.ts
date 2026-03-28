import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'

function getAuth(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader.split('pagu_session=')[1]?.split(';')[0]
  if (!token) return null
  return verifyJwt(token)
}

export async function GET(request: Request) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const tables = await prisma.table.findMany({
      where: { restaurantId: auth.restaurantId },
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
        },
      },
    })

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Tables GET error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { number, count } = body

    if (count && count > 1) {
      const lastTable = await prisma.table.findFirst({
        where: { restaurantId: auth.restaurantId },
        orderBy: { number: 'desc' },
      })
      const startNumber = lastTable ? lastTable.number + 1 : 1

      const tables = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          prisma.table.create({
            data: { number: startNumber + i, restaurantId: auth.restaurantId },
          })
        )
      )

      return NextResponse.json({ tables }, { status: 201 })
    }

    const table = await prisma.table.create({
      data: { number, restaurantId: auth.restaurantId },
    })

    return NextResponse.json({ table }, { status: 201 })
  } catch (error) {
    console.error('Table POST error:', error)
    return NextResponse.json({ error: 'Errore creazione tavolo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = getAuth(request)
    if (!auth?.restaurantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('id')

    if (!tableId) {
      return NextResponse.json({ error: 'ID tavolo mancante' }, { status: 400 })
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { restaurantId: true }
    })

    if (!table || table.restaurantId !== auth.restaurantId) {
      return NextResponse.json({ error: 'Tavolo non trovato' }, { status: 404 })
    }

    await prisma.table.delete({
      where: { id: tableId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Table DELETE error:', error)
    return NextResponse.json({ error: 'Errore eliminazione tavolo' }, { status: 500 })
  }
}

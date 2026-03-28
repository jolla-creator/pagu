import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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

    if (!table || table.restaurantId !== auth.restaurantId) {
      return NextResponse.json({ error: 'Tavolo non trovato' }, { status: 404 })
    }

    return NextResponse.json({ table, orders: table.orders })
  } catch (error) {
    console.error('Table GET error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

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

    const reviews = await prisma.review.findMany({
      where: { restaurantId: auth.restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { table: true } },
      },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, rating, comment } = body

    if (!orderId || !rating) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { restaurantId: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        restaurantId: order.restaurantId,
        rating: Math.min(5, Math.max(1, rating)),
        comment: comment || null,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Review POST error:', error)
    return NextResponse.json({ error: 'Errore creazione recensione' }, { status: 500 })
  }
}

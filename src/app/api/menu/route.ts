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

    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: auth.restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    const parsed = categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({
        ...item,
        allergens: JSON.parse(item.allergens),
      })),
    }))

    return NextResponse.json({
      categories: parsed,
      restaurant: { id: auth.restaurantId, name: 'Ristorante' },
    })
  } catch (error) {
    console.error('Menu GET error:', error)
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
    const { name, description, price, categoryId, allergens, imageUrl } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description || null,
        price: Math.round(price * 100),
        categoryId,
        restaurantId: auth.restaurantId,
        imageUrl: imageUrl || null,
        allergens: JSON.stringify(allergens ?? []),
      },
    })

    return NextResponse.json({ ...item, allergens: JSON.parse(item.allergens) }, { status: 201 })
  } catch (error) {
    console.error('Menu POST error:', error)
    return NextResponse.json({ error: 'Errore creazione piatto' }, { status: 500 })
  }
}

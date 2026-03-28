import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst()
    if (!restaurant) {
      return NextResponse.json({ error: 'Ristorante non trovato' }, { status: 404 })
    }

    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: restaurant.id },
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
      restaurant: { id: restaurant.id, name: restaurant.name },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, restaurantId, allergens, imageUrl } = body

    if (!name || !price || !categoryId || !restaurantId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description || null,
        price: Math.round(price * 100),
        categoryId,
        restaurantId,
        imageUrl: imageUrl || null,
        allergens: JSON.stringify(allergens ?? []),
      },
    })

    return NextResponse.json({ ...item, allergens: JSON.parse(item.allergens) }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Errore creazione piatto' }, { status: 500 })
  }
}

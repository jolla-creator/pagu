import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const category = await prisma.menuCategory.findUnique({
      where: { id: params.categoryId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoria non trovata' }, { status: 404 })
    }

    const items = category.items.map((item) => ({
      ...item,
      allergens: JSON.parse(item.allergens),
    }))

    return NextResponse.json({ ...category, items })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const body = await request.json()

    const item = await prisma.menuItem.update({
      where: { id: params.categoryId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: Math.round(body.price * 100) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.available !== undefined && { available: body.available }),
        ...(body.allergens !== undefined && { allergens: JSON.stringify(body.allergens) }),
      },
    })

    return NextResponse.json({ ...item, allergens: JSON.parse(item.allergens) })
  } catch (error) {
    return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    await prisma.menuItem.delete({
      where: { id: params.categoryId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore eliminazione' }, { status: 500 })
  }
}

import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const packages = await prisma.menuPackage.findMany({
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })
    
    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, imageUrl, restaurantId, items } = await request.json()
    
    if (!name || !price || !restaurantId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Name, price, restaurantId, and at least one item are required' },
        { status: 400 }
      )
    }
    
    const packageData = await prisma.menuPackage.create({
      data: {
        name,
        description: description || null,
        price: Math.round(parseFloat(price) * 100),
        imageUrl: imageUrl || null,
        restaurantId,
        items: {
          create: items.map((item: { menuItemId: string; quantity: number }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    })
    
    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, description, price, imageUrl, items } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }
    
    // Update package
    const packageData = await prisma.menuPackage.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description || null : undefined,
        price: price !== undefined ? Math.round(parseFloat(price) * 100) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl || null : undefined,
        items: {
          deleteMany: {}, // Delete existing items
          create: items?.map((item: { menuItemId: string; quantity: number }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
          })) || []
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    })
    
    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }
    
    await prisma.menuPackage.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
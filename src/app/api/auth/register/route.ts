import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signJwt, PAGU_SESSION_COOKIE } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, restaurantName } = body

    if (!email || !password || !name || !restaurantName) {
      return NextResponse.json(
        { error: 'Email, password, nome e nome ristorante sono obbligatori' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          email: email,
        }
      })

      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'OWNER',
          restaurantId: restaurant.id,
        }
      })

      await tx.subscription.create({
        data: {
          restaurantId: restaurant.id,
          status: 'TRIALING',
          plan: 'BASIC',
        }
      })

      const category1 = await tx.menuCategory.create({
        data: {
          name: 'Pizze Classiche',
          description: 'Le nostre pizze tradizionali',
          sortOrder: 0,
          restaurantId: restaurant.id,
        }
      })

      const category2 = await tx.menuCategory.create({
        data: {
          name: 'Pizze Speciali',
          description: 'Creazioni dello chef',
          sortOrder: 1,
          restaurantId: restaurant.id,
        }
      })

      const category3 = await tx.menuCategory.create({
        data: {
          name: 'Bibite',
          description: 'Bevande analcoliche e alcoliche',
          sortOrder: 2,
          restaurantId: restaurant.id,
        }
      })

      await tx.menuItem.createMany({
        data: [
          {
            name: 'Margherita',
            description: 'Pomodoro, mozzarella, basilico',
            price: 800,
            categoryId: category1.id,
            restaurantId: restaurant.id,
          },
          {
            name: 'Marinara',
            description: 'Pomodoro, aglio, origano',
            price: 600,
            categoryId: category1.id,
            restaurantId: restaurant.id,
          },
          {
            name: 'Diavola',
            description: 'Pomodoro, mozzarella, salame piccante',
            price: 900,
            categoryId: category1.id,
            restaurantId: restaurant.id,
          },
          {
            name: 'Coca Cola',
            description: '33cl',
            price: 250,
            categoryId: category3.id,
            restaurantId: restaurant.id,
          },
          {
            name: 'Birra Peroni',
            description: '33cl',
            price: 350,
            categoryId: category3.id,
            restaurantId: restaurant.id,
          },
        ]
      })

      await tx.table.createMany({
        data: [
          { number: 1, restaurantId: restaurant.id },
          { number: 2, restaurantId: restaurant.id },
          { number: 3, restaurantId: restaurant.id },
        ]
      })

      return { user, restaurant }
    })

    const token = signJwt({
      userId: result.user.id,
      restaurantId: result.restaurant.id,
      role: 'OWNER',
    })

    const cookieValue = `${PAGU_SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax;`

    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
      }
    }, { status: 201 })

    response.headers.set('Set-Cookie', cookieValue)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    )
  }
}

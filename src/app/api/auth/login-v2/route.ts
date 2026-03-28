import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signJwt, PAGU_SESSION_COOKIE } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatorie' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { restaurant: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    const payload = {
      userId: user.id,
      restaurantId: user.restaurantId,
      role: user.role as 'OWNER' | 'STAFF'
    }

    const token = signJwt(payload)

    const cookieValue = `${PAGU_SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax;`

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      restaurant: {
        id: user.restaurant.id,
        name: user.restaurant.name,
      }
    }, { status: 200 })

    response.headers.set('Set-Cookie', cookieValue)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Errore durante il login' },
      { status: 500 }
    )
  }
}

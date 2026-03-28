import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'PAID', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 })
  }
}

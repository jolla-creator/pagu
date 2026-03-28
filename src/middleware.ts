import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('pagu_session')
  const token = sessionCookie?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = verifyJwt(token)

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}

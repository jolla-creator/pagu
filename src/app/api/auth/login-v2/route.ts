import { NextResponse } from 'next/server';
import { signJwt, JwtPayload, PAGU_SESSION_COOKIE } from '../../../../lib/auth';

// Hardcoded test credentials (no User model yet)
const TEST_CREDENTIALS = {
  email: 'owner@example.com',
  password: 'password123',
  restaurantId: 'resto_001',
  userId: 'user_001',
  role: 'OWNER' as const
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (email !== TEST_CREDENTIALS.email || password !== TEST_CREDENTIALS.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const payload: JwtPayload = {
      userId: TEST_CREDENTIALS.userId,
      restaurantId: TEST_CREDENTIALS.restaurantId,
      role: TEST_CREDENTIALS.role
    };

    const token = signJwt(payload);

    const cookieValue = `${PAGU_SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax;`;

    const res = NextResponse.json({ user: payload }, { status: 200 });
    res.headers.set('Set-Cookie', cookieValue);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

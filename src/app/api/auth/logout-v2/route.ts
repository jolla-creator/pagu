import { NextResponse } from 'next/server';
import { PAGU_SESSION_COOKIE } from '../../../../lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  // Clear the session cookie
  res.headers.set('Set-Cookie', `${PAGU_SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;`);
  return res;
}

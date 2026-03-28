import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, JwtPayload, PAGU_SESSION_COOKIE } from './auth';

// Very small cookie parser for server-side Next.js routes
function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (!key) return;
    const value = parts.join('=');
    list[key] = decodeURIComponent(value);
  });
  return list;
}

export type AuthUser = JwtPayload;

// Extract and verify JWT from cookies
export function authenticateRequest(req: NextRequest): AuthUser | null {
  const cookieHeader = req.headers.get('cookie');
  const cookies = parseCookies(cookieHeader ?? undefined);
  const token = cookies[PAGU_SESSION_COOKIE];
  if (!token) return null;
  const payload = verifyJwt(token);
  return payload;
}

// Wrapper to enforce authentication on API routes
export function requireAuth(
  handler: (req: NextRequest, user: AuthUser) => Response | Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = authenticateRequest(req);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return handler(req, user);
  };
}

// Wrapper to enforce a specific role on API routes
export function requireRole(
  role: JwtPayload['role'],
  handler: (req: NextRequest, user: AuthUser) => Response | Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = authenticateRequest(req);
    if (!user || user.role !== role) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    return handler(req, user);
  };
}

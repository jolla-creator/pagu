import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// JWT payload shape
export type JwtPayload = {
  userId: string;
  restaurantId: string;
  role: 'OWNER' | 'STAFF';
};

// Cookie name for session
export const PAGU_SESSION_COOKIE = 'pagu_session';

// Secret management: use env var if provided, otherwise lazily generate a random 64-byte hex string
let cachedSecret: string | undefined;
function getJwtSecret(): string {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0) {
    return process.env.JWT_SECRET;
  }
  if (!cachedSecret) {
    // 64 bytes => 128 hex chars
    cachedSecret = crypto.randomBytes(64).toString('hex');
  }
  return cachedSecret;
}

const SECRET = getJwtSecret();

// Sign a JWT with a payload
export function signJwt(payload: JwtPayload, expiresIn: number = 86400): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

// Verify a JWT and return the payload or null if invalid
export function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Password helpers
export async function hashPassword(password: string, rounds = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

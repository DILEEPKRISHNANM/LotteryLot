import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET! + '_refresh'; // Or separate secret

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin' | 'client';
}

// Access token: 5 minutes
export function encodeAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' });
}

// Refresh token: 7 days
export function encodeRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

// Decode access token
export function decodeAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Decode refresh token
export function decodeRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const COOKIE_NAME = 'auth_token';

export type JwtPayload = {
  userId: number;
  role: 'user' | 'admin';
};

export function signAuthToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyAuthToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).user = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const payload = (req as any).user as JwtPayload | undefined;
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

export function setAuthCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}


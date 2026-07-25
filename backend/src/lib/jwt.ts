import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { Role } from './enums.js';

export interface TokenPayload {
  sub: string; // user id
  role: Role;
  organizationId?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}

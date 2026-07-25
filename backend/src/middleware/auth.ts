import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../lib/enums.js';
import { verifyToken, type TokenPayload } from '../lib/jwt.js';
import { Errors } from '../lib/errors.js';

// Express Request ga foydalanuvchi ma'lumotini qo'shamiz
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(Errors.unauthorized('Token yuborilmadi'));
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    next(Errors.unauthorized("Token yaroqsiz yoki muddati o'tgan"));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(Errors.unauthorized());
    if (roles.length && !roles.includes(req.user.role)) {
      return next(Errors.forbidden('Bu amal uchun ruxsatingiz yo‘q'));
    }
    next();
  };
}

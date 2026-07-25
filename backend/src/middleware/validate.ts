import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { AppError } from '../lib/errors.js';

// Zod sxemasi bilan req.body ni tekshiradi va tozalangan qiymatni qaytaradi.
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const msg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        return next(new AppError(400, 'VALIDATION_ERROR', msg));
      }
      next(err);
    }
  };
}

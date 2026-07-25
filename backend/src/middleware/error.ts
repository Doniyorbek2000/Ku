import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';
import { env } from '../config/env.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (!env.isProd) console.error(err);
  return res
    .status(500)
    .json({ error: { code: 'INTERNAL', message: 'Serverda kutilmagan xatolik' } });
}

// async handlerlarni o'rab, xatolarni next() ga uzatadi
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

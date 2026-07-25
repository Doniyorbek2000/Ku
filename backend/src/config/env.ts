import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Muhit o'zgaruvchisi topilmadi: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET', 'dev-only-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
  purchaseQrTtlMinutes: Number(process.env.PURCHASE_QR_TTL_MINUTES ?? 15),
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
};

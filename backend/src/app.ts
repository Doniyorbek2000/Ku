import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { orgRouter } from './modules/org/org.routes.js';
import { purchaseRouter } from './modules/purchase/purchase.routes.js';
import { walletRouter } from './modules/wallet/wallet.routes.js';
import { errorHandler, asyncHandler } from './middleware/error.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Sog'liq tekshiruvi
  app.get('/health', (_req, res) => res.json({ ok: true, service: 'ku-backend' }));

  // Ochiq katalog — mobil ilovada do'konlarni ko'rsatish uchun
  app.get(
    '/api/catalog',
    asyncHandler(async (_req, res) => {
      const orgs = await prisma.organization.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          logoUrl: true,
          description: true,
          cashbackType: true,
          cashbackValue: true,
        },
        orderBy: { name: 'asc' },
      });
      res.json({ organizations: orgs });
    }),
  );

  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/org', orgRouter);
  app.use('/api/purchases', purchaseRouter);
  app.use('/api/wallet', walletRouter);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Yo‘l topilmadi' } });
  });

  app.use(errorHandler);
  return app;
}

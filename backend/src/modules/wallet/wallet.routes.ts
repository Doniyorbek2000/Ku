import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const walletRouter = Router();

walletRouter.use(authenticate, authorize('CUSTOMER'));

// Barcha tashkilotlardagi keshbek balanslari + umumiy summa
walletRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.user!.sub },
      include: {
        organization: { select: { id: true, name: true, logoUrl: true, category: true } },
      },
      orderBy: { balance: 'desc' },
    });
    const total = wallets.reduce((s, w) => s + w.balance, 0);
    res.json({
      totalBalance: total,
      wallets: wallets.map((w) => ({
        organization: w.organization,
        balance: w.balance,
        updatedAt: w.updatedAt,
      })),
    });
  }),
);

// Tranzaksiya tarixi (barcha yoki bitta tashkilot bo'yicha)
walletRouter.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    const take = Math.min(Number(req.query.limit ?? 30), 100);
    const organizationId = req.query.organizationId as string | undefined;
    const txns = await prisma.transaction.findMany({
      where: { userId: req.user!.sub, ...(organizationId ? { organizationId } : {}) },
      include: { organization: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
    res.json({ transactions: txns });
  }),
);

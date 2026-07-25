import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { Errors } from '../../lib/errors.js';
import { tierForSpend, nextTier, TIERS } from '../../lib/growth.js';
import { validate } from '../../middleware/validate.js';
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

// Bonus va daraja ma'lumoti (referral, tier, "Ku bonus")
walletRouter.get(
  '/rewards',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw Errors.notFound('Foydalanuvchi topilmadi');

    const tier = tierForSpend(user.lifetimeSpend);
    const next = nextTier(user.lifetimeSpend);
    const referralCount = await prisma.user.count({ where: { referredById: user.id } });
    const events = await prisma.bonusEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    res.json({
      bonusPoints: user.bonusPoints,
      referralCode: user.referralCode,
      referralCount,
      lifetimeSpend: user.lifetimeSpend,
      tier: { key: tier.key, name: tier.name, bonusRate: tier.bonusRate },
      nextTier: next ? { name: next.tier.name, remaining: next.remaining } : null,
      allTiers: TIERS.map((t) => ({ key: t.key, name: t.name, minSpend: t.minSpend, bonusRate: t.bonusRate })),
      events,
    });
  }),
);

// Expo push tokenini saqlash (kelajakdagi push-bildirishnomalar uchun)
walletRouter.post(
  '/push-token',
  validate(z.object({ token: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    await prisma.user.update({
      where: { id: req.user!.sub },
      data: { expoPushToken: (req.body as { token: string }).token },
    });
    res.json({ ok: true });
  }),
);

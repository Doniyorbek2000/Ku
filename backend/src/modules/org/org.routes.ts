import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { Errors } from '../../lib/errors.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const orgRouter = Router();

orgRouter.use(authenticate, authorize('ORG_OWNER'));

// Egadan organizationId ni oladi (yo'q bo'lsa xato)
function orgId(req: { user?: { organizationId?: string | null } }): string {
  const id = req.user?.organizationId;
  if (!id) throw Errors.forbidden('Siz hech qaysi tashkilotga bog‘lanmagansiz');
  return id;
}

// O'z tashkiloti ma'lumoti
orgRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const org = await prisma.organization.findUnique({ where: { id: orgId(req) } });
    res.json({ organization: org });
  }),
);

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  cashbackType: z.enum(['PERCENT', 'FIXED']).optional(),
  cashbackValue: z.number().nonnegative().optional(),
  minPurchase: z.number().int().nonnegative().optional(),
  maxCashbackPerTxn: z.number().int().positive().nullable().optional(),
  redeemEnabled: z.boolean().optional(),
});

// Keshbek qoidalari va profilni yangilash
orgRouter.patch(
  '/me',
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const org = await prisma.organization.update({
      where: { id: orgId(req) },
      data: req.body as z.infer<typeof updateSchema>,
    });
    res.json({ organization: org });
  }),
);

// ---- Kassirlar ----
const cashierSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

orgRouter.post(
  '/cashiers',
  validate(cashierSchema),
  asyncHandler(async (req, res) => {
    const b = req.body as z.infer<typeof cashierSchema>;
    const exists = await prisma.user.findUnique({ where: { email: b.email.toLowerCase() } });
    if (exists) throw Errors.conflict('Bu email band');

    const cashier = await prisma.user.create({
      data: {
        name: b.name,
        email: b.email.toLowerCase(),
        role: 'CASHIER',
        passwordHash: await bcrypt.hash(b.password, 10),
        organizationId: orgId(req),
      },
    });
    res.status(201).json({
      cashier: { id: cashier.id, name: cashier.name, email: cashier.email },
    });
  }),
);

orgRouter.get(
  '/cashiers',
  asyncHandler(async (req, res) => {
    const cashiers = await prisma.user.findMany({
      where: { organizationId: orgId(req), role: 'CASHIER' },
      select: { id: true, name: true, email: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ cashiers });
  }),
);

orgRouter.patch(
  '/cashiers/:id/active',
  validate(z.object({ isActive: z.boolean() })),
  asyncHandler(async (req, res) => {
    const cashier = await prisma.user.findFirst({
      where: { id: req.params.id, organizationId: orgId(req), role: 'CASHIER' },
    });
    if (!cashier) throw Errors.notFound('Kassir topilmadi');
    await prisma.user.update({
      where: { id: cashier.id },
      data: { isActive: (req.body as { isActive: boolean }).isActive },
    });
    res.json({ ok: true });
  }),
);

// ---- Statistika va xaridlar ----
orgRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const id = orgId(req);
    const [purchases, customers, earned, redeemed, salesSum] = await Promise.all([
      prisma.purchase.count({ where: { organizationId: id, status: 'COMPLETED' } }),
      prisma.wallet.count({ where: { organizationId: id } }),
      prisma.transaction.aggregate({
        where: { organizationId: id, type: 'EARN' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { organizationId: id, type: 'REDEEM' },
        _sum: { amount: true },
      }),
      prisma.purchase.aggregate({
        where: { organizationId: id, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);
    res.json({
      completedPurchases: purchases,
      uniqueCustomers: customers,
      totalSales: salesSum._sum.amount ?? 0,
      cashbackGiven: earned._sum.amount ?? 0,
      cashbackRedeemed: Math.abs(redeemed._sum.amount ?? 0),
    });
  }),
);

orgRouter.get(
  '/purchases',
  asyncHandler(async (req, res) => {
    const take = Math.min(Number(req.query.limit ?? 20), 100);
    const purchases = await prisma.purchase.findMany({
      where: { organizationId: orgId(req) },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        cashier: { select: { id: true, name: true } },
      },
    });
    res.json({ purchases });
  }),
);

// ---- Aksiyalar (promotion) ----
orgRouter.get(
  '/promotions',
  asyncHandler(async (req, res) => {
    const promotions = await prisma.promotion.findMany({
      where: { organizationId: orgId(req) },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ promotions });
  }),
);

const promoSchema = z.object({
  title: z.string().min(2),
  cashbackType: z.enum(['PERCENT', 'FIXED']),
  cashbackValue: z.number().nonnegative(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
});

orgRouter.post(
  '/promotions',
  validate(promoSchema),
  asyncHandler(async (req, res) => {
    const b = req.body as z.infer<typeof promoSchema>;
    if (b.endsAt <= b.startsAt) throw Errors.badRequest('Tugash sanasi boshlanishdan keyin bo‘lishi kerak');
    const promo = await prisma.promotion.create({
      data: { ...b, organizationId: orgId(req), isActive: true },
    });
    res.status(201).json({ promotion: promo });
  }),
);

orgRouter.patch(
  '/promotions/:id/active',
  validate(z.object({ isActive: z.boolean() })),
  asyncHandler(async (req, res) => {
    const promo = await prisma.promotion.findFirst({
      where: { id: req.params.id, organizationId: orgId(req) },
    });
    if (!promo) throw Errors.notFound('Aksiya topilmadi');
    const updated = await prisma.promotion.update({
      where: { id: promo.id },
      data: { isActive: (req.body as { isActive: boolean }).isActive },
    });
    res.json({ promotion: updated });
  }),
);

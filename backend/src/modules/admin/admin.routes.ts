import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { Errors } from '../../lib/errors.js';
import { slugify } from '../../lib/slug.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const adminRouter = Router();

// Hamma yo'llar faqat SUPER_ADMIN uchun
adminRouter.use(authenticate, authorize('SUPER_ADMIN'));

const createOrgSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  cashbackType: z.enum(['PERCENT', 'FIXED']).default('PERCENT'),
  cashbackValue: z.number().nonnegative(),
  minPurchase: z.number().int().nonnegative().default(0),
  maxCashbackPerTxn: z.number().int().positive().optional(),
  // tashkilot egasining hisobi
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
});

// Yangi tashkilot + ega hisobini yaratish
adminRouter.post(
  '/organizations',
  validate(createOrgSchema),
  asyncHandler(async (req, res) => {
    const b = req.body as z.infer<typeof createOrgSchema>;

    const emailExists = await prisma.user.findUnique({
      where: { email: b.ownerEmail.toLowerCase() },
    });
    if (emailExists) throw Errors.conflict('Bu email allaqachon band');

    let slug = slugify(b.name) || 'org';
    // slug takrorlanmasligini ta'minlaymiz
    let n = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${slugify(b.name)}-${++n}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name: b.ownerName,
          email: b.ownerEmail.toLowerCase(),
          role: 'ORG_OWNER',
          passwordHash: await bcrypt.hash(b.ownerPassword, 10),
        },
      });
      const org = await tx.organization.create({
        data: {
          name: b.name,
          slug,
          category: b.category,
          cashbackType: b.cashbackType,
          cashbackValue: b.cashbackValue,
          minPurchase: b.minPurchase,
          maxCashbackPerTxn: b.maxCashbackPerTxn,
          isActive: true,
          ownerId: owner.id,
        },
      });
      // egani tashkilotga bog'laymiz
      await tx.user.update({
        where: { id: owner.id },
        data: { organizationId: org.id },
      });
      return { org, owner };
    });

    res.status(201).json({
      organization: result.org,
      owner: { id: result.owner.id, email: result.owner.email },
    });
  }),
);

// Barcha tashkilotlar
adminRouter.get(
  '/organizations',
  asyncHandler(async (_req, res) => {
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { purchases: true, staff: true } },
      },
    });
    res.json({ organizations: orgs });
  }),
);

// Tashkilotni faollashtirish/o'chirish
adminRouter.patch(
  '/organizations/:id/active',
  validate(z.object({ isActive: z.boolean() })),
  asyncHandler(async (req, res) => {
    const org = await prisma.organization.update({
      where: { id: req.params.id },
      data: { isActive: (req.body as { isActive: boolean }).isActive },
    });
    res.json({ organization: org });
  }),
);

// Platforma statistikasi
adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [orgs, customers, purchases, earned, redeemed] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.purchase.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.aggregate({ where: { type: 'EARN' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { type: 'REDEEM' }, _sum: { amount: true } }),
    ]);
    res.json({
      organizations: orgs,
      customers,
      completedPurchases: purchases,
      totalCashbackEarned: earned._sum.amount ?? 0,
      totalCashbackRedeemed: Math.abs(redeemed._sum.amount ?? 0),
    });
  }),
);

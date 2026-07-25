import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { Errors } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import { computeCashback } from '../../lib/cashback.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const purchaseRouter = Router();

// QR token uchun tasodifiy, adashtirmaydigan alifbo
const genToken = customAlphabet('0123456789abcdefghijkmnpqrstuvwxyz', 24);

// ------- 1) Kassir xarid yaratadi (QR) -------
const createSchema = z.object({
  amount: z.number().int().positive('Summa musbat butun son bo‘lishi kerak'),
  redeemAmount: z.number().int().nonnegative().default(0), // ishlatmoqchi bo'lgan keshbek
  branchId: z.string().optional(),
});

purchaseRouter.post(
  '/',
  authenticate,
  authorize('CASHIER'),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    if (!orgId) throw Errors.forbidden('Kassir tashkilotga bog‘lanmagan');
    const b = req.body as z.infer<typeof createSchema>;

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org || !org.isActive) throw Errors.forbidden('Tashkilot faol emas');

    const cashbackAmount = computeCashback(org, b.amount);
    const expiresAt = new Date(Date.now() + env.purchaseQrTtlMinutes * 60_000);

    const purchase = await prisma.purchase.create({
      data: {
        organizationId: orgId,
        branchId: b.branchId,
        cashierId: req.user!.sub,
        amount: b.amount,
        cashbackAmount,
        redeemAmount: org.redeemEnabled ? b.redeemAmount : 0,
        status: 'PENDING',
        qrToken: genToken(),
        expiresAt,
      },
    });

    res.status(201).json({
      purchaseId: purchase.id,
      qrToken: purchase.qrToken, // QR ga shu token joylanadi
      amount: purchase.amount,
      cashbackPreview: purchase.cashbackAmount,
      redeemRequested: purchase.redeemAmount,
      expiresAt: purchase.expiresAt,
      status: purchase.status,
    });
  }),
);

// ------- 2) Ko'rib chiqish / holatni tekshirish (token orqali) -------
purchaseRouter.get(
  '/:qrToken',
  authenticate,
  asyncHandler(async (req, res) => {
    const purchase = await prisma.purchase.findUnique({
      where: { qrToken: req.params.qrToken },
      include: { organization: { select: { id: true, name: true, logoUrl: true } } },
    });
    if (!purchase) throw Errors.notFound('Xarid topilmadi');

    res.json({
      purchaseId: purchase.id,
      organization: purchase.organization,
      amount: purchase.amount,
      cashback: purchase.cashbackAmount,
      redeemRequested: purchase.redeemAmount,
      status: purchase.status,
      expiresAt: purchase.expiresAt,
    });
  }),
);

// ------- 3) Xaridor QR ni skanerlaydi va keshbekni oladi -------
const claimSchema = z.object({ qrToken: z.string().min(8) });

purchaseRouter.post(
  '/claim',
  authenticate,
  authorize('CUSTOMER'),
  validate(claimSchema),
  asyncHandler(async (req, res) => {
    const { qrToken } = req.body as z.infer<typeof claimSchema>;
    const customerId = req.user!.sub;

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({ where: { qrToken } });
      if (!purchase) throw Errors.notFound('Xarid topilmadi');
      if (purchase.status !== 'PENDING') {
        throw Errors.conflict('Bu QR allaqachon ishlatilgan yoki bekor qilingan');
      }
      if (purchase.expiresAt < new Date()) {
        await tx.purchase.update({ where: { id: purchase.id }, data: { status: 'EXPIRED' } });
        throw Errors.conflict('QR muddati o‘tgan');
      }

      // Joriy hamyon (yo'q bo'lsa yaratamiz)
      const wallet = await tx.wallet.upsert({
        where: {
          userId_organizationId: { userId: customerId, organizationId: purchase.organizationId },
        },
        create: { userId: customerId, organizationId: purchase.organizationId, balance: 0 },
        update: {},
      });

      // Redeem — mavjud balansdan oshmasin
      const redeem = Math.min(purchase.redeemAmount, wallet.balance);
      let balance = wallet.balance - redeem;
      const earn = purchase.cashbackAmount;
      balance += earn;

      await tx.wallet.update({ where: { id: wallet.id }, data: { balance } });

      if (redeem > 0) {
        await tx.transaction.create({
          data: {
            userId: customerId,
            organizationId: purchase.organizationId,
            purchaseId: purchase.id,
            type: 'REDEEM',
            amount: -redeem,
            balanceAfter: wallet.balance - redeem,
            note: 'Xaridda keshbek ishlatildi',
          },
        });
      }
      await tx.transaction.create({
        data: {
          userId: customerId,
          organizationId: purchase.organizationId,
          purchaseId: purchase.id,
          type: 'EARN',
          amount: earn,
          balanceAfter: balance,
          note: 'Xariddan keshbek',
        },
      });

      const updated = await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          customerId,
          redeemAmount: redeem,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return { purchase: updated, earn, redeem, balance };
    });

    res.json({
      message: 'Keshbek muvaffaqiyatli qo‘shildi',
      earned: result.earn,
      redeemed: result.redeem,
      netPayable: result.purchase.amount - result.redeem,
      newBalance: result.balance,
    });
  }),
);

// ------- 4) Kassir kutilayotgan xaridni bekor qiladi -------
purchaseRouter.post(
  '/:id/cancel',
  authenticate,
  authorize('CASHIER'),
  asyncHandler(async (req, res) => {
    const purchase = await prisma.purchase.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId ?? '' },
    });
    if (!purchase) throw Errors.notFound('Xarid topilmadi');
    if (purchase.status !== 'PENDING') throw Errors.conflict('Faqat kutilayotgan xaridni bekor qilish mumkin');

    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'CANCELLED' } });
    res.json({ ok: true });
  }),
);

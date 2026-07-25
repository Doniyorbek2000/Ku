import type { Organization } from '@prisma/client';

/**
 * Xarid summasiga qarab keshbek miqdorini hisoblaydi (so'm, butun son).
 * Qoidalar: minPurchase, foiz/qat'iy summa, maxCashbackPerTxn shifti.
 */
export function computeCashback(org: Organization, amount: number): number {
  if (amount <= 0) return 0;
  if (amount < org.minPurchase) return 0;

  let cashback: number;
  if (org.cashbackType === 'PERCENT') {
    cashback = Math.floor((amount * org.cashbackValue) / 100);
  } else {
    cashback = Math.floor(org.cashbackValue);
  }

  if (org.maxCashbackPerTxn != null && cashback > org.maxCashbackPerTxn) {
    cashback = org.maxCashbackPerTxn;
  }
  return Math.max(0, cashback);
}

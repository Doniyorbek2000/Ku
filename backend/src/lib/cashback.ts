import type { Organization, Promotion } from '@prisma/client';

/**
 * Xarid summasiga qarab keshbek miqdorini hisoblaydi (so'm, butun son).
 * Qoidalar: minPurchase, foiz/qat'iy summa, maxCashbackPerTxn shifti.
 * Faol aksiya (promo) bo'lsa, uning keshbek qoidasi ustunlik qiladi.
 */
export function computeCashback(
  org: Organization,
  amount: number,
  promo?: Pick<Promotion, 'cashbackType' | 'cashbackValue'> | null,
): number {
  if (amount <= 0) return 0;
  if (amount < org.minPurchase) return 0;

  const type = promo?.cashbackType ?? org.cashbackType;
  const value = promo?.cashbackValue ?? org.cashbackValue;

  let cashback: number;
  if (type === 'PERCENT') {
    cashback = Math.floor((amount * value) / 100);
  } else {
    cashback = Math.floor(value);
  }

  if (org.maxCashbackPerTxn != null && cashback > org.maxCashbackPerTxn) {
    cashback = org.maxCashbackPerTxn;
  }
  return Math.max(0, cashback);
}

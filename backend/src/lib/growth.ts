import { customAlphabet } from 'nanoid';

// Taklif kodi: adashtirmaydigan katta harflar+raqamlar, masalan "KU7QX2A4"
const codeGen = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);
export function generateReferralCode(): string {
  return `KU${codeGen()}`;
}

// --- Referral bonuslari (Ku bonus ballari) ---
export const REFERRAL_INVITER_POINTS = 10_000; // taklif qilganga
export const REFERRAL_INVITEE_POINTS = 5_000; // taklif qilinganʼga

// --- Darajalar (umumiy xarid summasiga qarab) ---
// bonusRate: har xariddan olingan keshbekning shu ulushi qo'shimcha
// "Ku bonus" bo'lib beriladi (platforma rag'bati).
export interface Tier {
  key: string;
  name: string;
  minSpend: number; // so'm
  bonusRate: number; // 0.10 = keshbekning +10% i bonus ball
}

export const TIERS: Tier[] = [
  { key: 'BRONZE', name: 'Bronza', minSpend: 0, bonusRate: 0 },
  { key: 'SILVER', name: 'Kumush', minSpend: 1_000_000, bonusRate: 0.1 },
  { key: 'GOLD', name: 'Oltin', minSpend: 5_000_000, bonusRate: 0.2 },
  { key: 'PLATINUM', name: 'Platina', minSpend: 20_000_000, bonusRate: 0.3 },
];

export function tierForSpend(spend: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) if (spend >= t.minSpend) current = t;
  return current;
}

// Keyingi darajagacha qancha qolgani (yo'q bo'lsa null = eng yuqori)
export function nextTier(spend: number): { tier: Tier; remaining: number } | null {
  for (const t of TIERS) if (spend < t.minSpend) return { tier: t, remaining: t.minSpend - spend };
  return null;
}

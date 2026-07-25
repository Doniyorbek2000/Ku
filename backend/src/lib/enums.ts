// SQLite String ustunlari uchun tur (union) ta'riflari — enum o'rnida.
export type Role = 'SUPER_ADMIN' | 'ORG_OWNER' | 'CASHIER' | 'CUSTOMER';
export type CashbackType = 'PERCENT' | 'FIXED';
export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type TxnType = 'EARN' | 'REDEEM' | 'ADJUST';

export const ROLES: Role[] = ['SUPER_ADMIN', 'ORG_OWNER', 'CASHIER', 'CUSTOMER'];

export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: 'SUPER_ADMIN' | 'ORG_OWNER' | 'CASHIER' | 'CUSTOMER';
  organizationId: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  category: string | null;
  logoUrl: string | null;
  description?: string | null;
  cashbackType: 'PERCENT' | 'FIXED';
  cashbackValue: number;
}

export interface WalletItem {
  organization: Pick<Organization, 'id' | 'name' | 'logoUrl' | 'category'>;
  balance: number;
  updatedAt: string;
}

export interface WalletResponse {
  totalBalance: number;
  wallets: WalletItem[];
}

export interface Transaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'ADJUST';
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
  organization: { id: string; name: string };
}

export interface PurchasePreview {
  purchaseId: string;
  organization: { id: string; name: string; logoUrl: string | null };
  amount: number;
  cashback: number;
  redeemRequested: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
}

export interface ClaimResult {
  message: string;
  earned: number;
  redeemed: number;
  netPayable: number;
  newBalance: number;
}

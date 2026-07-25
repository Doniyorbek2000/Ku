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
  slug: string;
  category: string | null;
  description: string | null;
  phone: string | null;
  cashbackType: 'PERCENT' | 'FIXED';
  cashbackValue: number;
  minPurchase: number;
  maxCashbackPerTxn: number | null;
  redeemEnabled: boolean;
  isActive: boolean;
}

export interface Cashier {
  id: string;
  name: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface OrgStats {
  completedPurchases: number;
  uniqueCustomers: number;
  totalSales: number;
  cashbackGiven: number;
  cashbackRedeemed: number;
}

export interface Purchase {
  id: string;
  amount: number;
  cashbackAmount: number;
  redeemAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  customer: { id: string; name: string; phone: string | null } | null;
  cashier: { id: string; name: string } | null;
}

export interface CreatePurchaseResult {
  purchaseId: string;
  qrToken: string;
  amount: number;
  cashbackPreview: number;
  redeemRequested: number;
  expiresAt: string;
  status: string;
}

export interface PurchaseStatusResult {
  purchaseId: string;
  organization: { id: string; name: string; logoUrl: string | null };
  amount: number;
  cashback: number;
  redeemRequested: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
}

// ---- Admin ----
export interface AdminStats {
  organizations: number;
  customers: number;
  completedPurchases: number;
  totalCashbackEarned: number;
  totalCashbackRedeemed: number;
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  cashbackType: 'PERCENT' | 'FIXED';
  cashbackValue: number;
  isActive: boolean;
  createdAt: string;
  owner: { id: string; name: string; email: string | null };
  _count: { purchases: number; staff: number };
}

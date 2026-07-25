import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { OrgStats, Organization } from '@/api/types';
import { sum } from '@/utils/format';

export function Dashboard() {
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    api.get<{ organization: Organization }>('/api/org/me').then((r) => setOrg(r.organization)).catch(() => {});
    api.get<OrgStats>('/api/org/stats').then(setStats).catch(() => {});
  }, []);

  const rule = org
    ? org.cashbackType === 'PERCENT'
      ? `${org.cashbackValue}%`
      : sum(org.cashbackValue)
    : '—';

  const cards = [
    { label: 'Yakunlangan xaridlar', value: stats ? String(stats.completedPurchases) : '—' },
    { label: 'Mijozlar', value: stats ? String(stats.uniqueCustomers) : '—' },
    { label: 'Umumiy savdo', value: stats ? sum(stats.totalSales) : '—' },
    { label: 'Berilgan keshbek', value: stats ? sum(stats.cashbackGiven) : '—' },
    { label: 'Ishlatilgan keshbek', value: stats ? sum(stats.cashbackRedeemed) : '—' },
    { label: 'Joriy keshbek qoidasi', value: rule },
  ];

  return (
    <div>
      <h1 className="page-title">{org?.name ?? 'Boshqaruv'}</h1>
      <p className="page-sub">Tashkilotingiz ko‘rsatkichlari</p>

      <div className="grid cols-3">
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      {org && !org.isActive && (
        <div className="card" style={{ marginTop: 16, borderColor: 'var(--danger)' }}>
          <b style={{ color: 'var(--danger)' }}>Tashkilot admin tomonidan faollashtirilmagan.</b>
        </div>
      )}
    </div>
  );
}

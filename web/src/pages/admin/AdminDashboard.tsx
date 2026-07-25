import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { AdminStats } from '@/api/types';
import { sum } from '@/utils/format';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get<AdminStats>('/api/admin/stats').then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: 'Tashkilotlar', value: stats ? String(stats.organizations) : '—' },
    { label: 'Xaridorlar', value: stats ? String(stats.customers) : '—' },
    { label: 'Yakunlangan xaridlar', value: stats ? String(stats.completedPurchases) : '—' },
    { label: 'Umumiy berilgan keshbek', value: stats ? sum(stats.totalCashbackEarned) : '—' },
    { label: 'Umumiy ishlatilgan keshbek', value: stats ? sum(stats.totalCashbackRedeemed) : '—' },
  ];

  return (
    <div>
      <h1 className="page-title">Platforma statistikasi</h1>
      <p className="page-sub">Butun Ku tizimi bo‘yicha ko‘rsatkichlar</p>
      <div className="grid cols-3">
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

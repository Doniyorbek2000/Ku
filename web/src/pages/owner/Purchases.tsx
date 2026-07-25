import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { Purchase } from '@/api/types';
import { shortDateTime, sum } from '@/utils/format';

const STATUS: Record<Purchase['status'], { label: string; cls: string }> = {
  COMPLETED: { label: 'Yakunlandi', cls: 'green' },
  PENDING: { label: 'Kutilmoqda', cls: 'gray' },
  CANCELLED: { label: 'Bekor', cls: 'red' },
  EXPIRED: { label: 'Muddati o‘tgan', cls: 'red' },
};

export function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    api
      .get<{ purchases: Purchase[] }>('/api/org/purchases?limit=50')
      .then((r) => setPurchases(r.purchases))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="page-title">Xaridlar</h1>
      <p className="page-sub">So‘nggi 50 ta xarid</p>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Sana</th>
              <th>Mijoz</th>
              <th>Summa</th>
              <th>Keshbek</th>
              <th>Ishlatildi</th>
              <th>Holat</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan={6} className="muted center">
                  Hali xaridlar yo‘q
                </td>
              </tr>
            )}
            {purchases.map((p) => {
              const s = STATUS[p.status];
              return (
                <tr key={p.id}>
                  <td>{shortDateTime(p.createdAt)}</td>
                  <td>{p.customer?.name ?? '—'}</td>
                  <td>{sum(p.amount)}</td>
                  <td style={{ color: 'var(--success)' }}>{sum(p.cashbackAmount)}</td>
                  <td>{p.redeemAmount ? sum(p.redeemAmount) : '—'}</td>
                  <td>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

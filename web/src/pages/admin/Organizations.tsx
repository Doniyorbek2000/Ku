import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import type { AdminOrganization } from '@/api/types';
import { shortDateTime, sum } from '@/utils/format';

export function Organizations() {
  const [orgs, setOrgs] = useState<AdminOrganization[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    api
      .get<{ organizations: AdminOrganization[] }>('/api/admin/organizations')
      .then((r) => setOrgs(r.organizations))
      .catch(() => {});
  }
  useEffect(load, []);

  async function toggle(o: AdminOrganization) {
    setBusy(o.id);
    try {
      await api.patch(`/api/admin/organizations/${o.id}/active`, { isActive: !o.isActive });
      load();
    } catch {
      /* e'tiborsiz */
    } finally {
      setBusy(null);
    }
  }

  function rule(o: AdminOrganization) {
    return o.cashbackType === 'PERCENT' ? `${o.cashbackValue}%` : sum(o.cashbackValue);
  }

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 4 }}>
        <h1 className="page-title">Tashkilotlar</h1>
        <Link to="/organizations/new" className="btn">
          + Yangi tashkilot
        </Link>
      </div>
      <p className="page-sub">Barcha ro‘yxatdan o‘tgan tashkilotlar</p>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Nomi</th>
              <th>Kategoriya</th>
              <th>Keshbek</th>
              <th>Ega</th>
              <th>Kassir</th>
              <th>Xarid</th>
              <th>Qo‘shilgan</th>
              <th>Holat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 && (
              <tr>
                <td colSpan={9} className="muted center">
                  Hali tashkilotlar yo‘q
                </td>
              </tr>
            )}
            {orgs.map((o) => (
              <tr key={o.id}>
                <td>
                  <b>{o.name}</b>
                </td>
                <td>{o.category ?? '—'}</td>
                <td>{rule(o)}</td>
                <td className="muted">{o.owner.email ?? o.owner.name}</td>
                <td>{o._count.staff}</td>
                <td>{o._count.purchases}</td>
                <td className="muted">{shortDateTime(o.createdAt)}</td>
                <td>
                  <span className={`badge ${o.isActive ? 'green' : 'red'}`}>
                    {o.isActive ? 'Faol' : 'O‘chirilgan'}
                  </span>
                </td>
                <td>
                  <button className="btn ghost" disabled={busy === o.id} onClick={() => toggle(o)}>
                    {o.isActive ? 'O‘chirish' : 'Faollashtirish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

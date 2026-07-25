import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/api/client';
import type { Promotion } from '@/api/types';
import { shortDateTime, sum } from '@/utils/format';

function toLocalInput(d: Date) {
  // datetime-local uchun "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function Promotions() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const now = new Date();
  const weekLater = new Date(Date.now() + 7 * 86400000);
  const [form, setForm] = useState({
    title: '',
    cashbackType: 'PERCENT' as 'PERCENT' | 'FIXED',
    cashbackValue: '',
    startsAt: toLocalInput(now),
    endsAt: toLocalInput(weekLater),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function load() {
    api.get<{ promotions: Promotion[] }>('/api/org/promotions').then((r) => setPromos(r.promotions)).catch(() => {});
  }
  useEffect(load, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/org/promotions', {
        title: form.title.trim(),
        cashbackType: form.cashbackType,
        cashbackValue: Number(form.cashbackValue) || 0,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      });
      setForm((f) => ({ ...f, title: '', cashbackValue: '' }));
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  async function toggle(p: Promotion) {
    await api.patch(`/api/org/promotions/${p.id}/active`, { isActive: !p.isActive }).catch(() => {});
    load();
  }

  function statusBadge(p: Promotion) {
    const now = Date.now();
    const active = p.isActive && new Date(p.startsAt).getTime() <= now && new Date(p.endsAt).getTime() >= now;
    if (active) return <span className="badge green">Faol</span>;
    if (!p.isActive) return <span className="badge red">O‘chirilgan</span>;
    if (new Date(p.startsAt).getTime() > now) return <span className="badge gray">Rejalashtirilgan</span>;
    return <span className="badge gray">Tugagan</span>;
  }

  return (
    <div>
      <h1 className="page-title">Aksiyalar</h1>
      <p className="page-sub">Belgilangan davrda oshirilgan keshbek bilan mijozlarni jalb qiling</p>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Yangi aksiya</h3>
          <form onSubmit={create}>
            <div className="field">
              <label>Nomi</label>
              <input
                className="input"
                placeholder="Hafta oxiri aksiyasi"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid cols-2">
              <div className="field">
                <label>Keshbek turi</label>
                <select
                  className="select"
                  value={form.cashbackType}
                  onChange={(e) => setForm({ ...form, cashbackType: e.target.value as 'PERCENT' | 'FIXED' })}
                >
                  <option value="PERCENT">Foiz (%)</option>
                  <option value="FIXED">Qat'iy summa</option>
                </select>
              </div>
              <div className="field">
                <label>{form.cashbackType === 'PERCENT' ? 'Foiz' : 'Summa'}</label>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.cashbackValue}
                  onChange={(e) => setForm({ ...form, cashbackValue: e.target.value.replace(/[^\d.]/g, '') })}
                />
              </div>
            </div>
            <div className="field">
              <label>Boshlanishi</label>
              <input
                className="input"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Tugashi</label>
              <input
                className="input"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button className="btn block" disabled={loading}>
              {loading ? 'Yaratilmoqda…' : 'Aksiya yaratish'}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Keshbek</th>
                <th>Muddat</th>
                <th>Holat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted center">
                    Aksiyalar yo‘q
                  </td>
                </tr>
              )}
              {promos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.title}</b>
                  </td>
                  <td>{p.cashbackType === 'PERCENT' ? `${p.cashbackValue}%` : sum(p.cashbackValue)}</td>
                  <td className="muted">
                    {shortDateTime(p.startsAt)} — {shortDateTime(p.endsAt)}
                  </td>
                  <td>{statusBadge(p)}</td>
                  <td>
                    <button className="btn ghost" onClick={() => toggle(p)}>
                      {p.isActive ? 'O‘chirish' : 'Yoqish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

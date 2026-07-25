import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/api/client';
import type { Organization } from '@/api/types';

export function Settings() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ organization: Organization }>('/api/org/me').then((r) => setOrg(r.organization)).catch(() => {});
  }, []);

  function set<K extends keyof Organization>(key: K, value: Organization[K]) {
    setOrg((o) => (o ? { ...o, [key]: value } : o));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!org) return;
    setError('');
    setMsg('');
    setSaving(true);
    try {
      await api.patch('/api/org/me', {
        name: org.name,
        category: org.category ?? undefined,
        description: org.description ?? undefined,
        phone: org.phone ?? undefined,
        cashbackType: org.cashbackType,
        cashbackValue: Number(org.cashbackValue),
        minPurchase: Number(org.minPurchase),
        maxCashbackPerTxn: org.maxCashbackPerTxn ? Number(org.maxCashbackPerTxn) : null,
        redeemEnabled: org.redeemEnabled,
      });
      setMsg('Saqlandi');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  }

  if (!org) return <p className="muted">Yuklanmoqda…</p>;

  return (
    <div>
      <h1 className="page-title">Sozlamalar</h1>
      <p className="page-sub">Keshbek qoidalari va tashkilot profili</p>

      <form className="card" onSubmit={save} style={{ maxWidth: 560 }}>
        <div className="field">
          <label>Tashkilot nomi</label>
          <input className="input" value={org.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Kategoriya</label>
          <input
            className="input"
            value={org.category ?? ''}
            onChange={(e) => set('category', e.target.value)}
          />
        </div>

        <div className="grid cols-2">
          <div className="field">
            <label>Keshbek turi</label>
            <select
              className="select"
              value={org.cashbackType}
              onChange={(e) => set('cashbackType', e.target.value as Organization['cashbackType'])}
            >
              <option value="PERCENT">Foiz (%)</option>
              <option value="FIXED">Qat'iy summa (so'm)</option>
            </select>
          </div>
          <div className="field">
            <label>{org.cashbackType === 'PERCENT' ? 'Foiz miqdori' : 'Summa (so\'m)'}</label>
            <input
              className="input"
              inputMode="numeric"
              value={String(org.cashbackValue)}
              onChange={(e) => set('cashbackValue', Number(e.target.value.replace(/[^\d.]/g, '')) || 0)}
            />
          </div>
        </div>

        <div className="grid cols-2">
          <div className="field">
            <label>Minimal xarid (so'm)</label>
            <input
              className="input"
              inputMode="numeric"
              value={String(org.minPurchase)}
              onChange={(e) => set('minPurchase', Number(e.target.value.replace(/\D/g, '')) || 0)}
            />
          </div>
          <div className="field">
            <label>Bitta xaridga keshbek shifti (so'm)</label>
            <input
              className="input"
              inputMode="numeric"
              placeholder="cheksiz"
              value={org.maxCashbackPerTxn ? String(org.maxCashbackPerTxn) : ''}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                set('maxCashbackPerTxn', v ? Number(v) : null);
              }}
            />
          </div>
        </div>

        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={org.redeemEnabled}
              onChange={(e) => set('redeemEnabled', e.target.checked)}
            />
            Keshbekni xaridda ishlatishga ruxsat
          </label>
        </div>

        {error && <div className="error">{error}</div>}
        {msg && <div style={{ color: 'var(--success)', marginBottom: 8 }}>{msg}</div>}
        <button className="btn" disabled={saving}>
          {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </form>
    </div>
  );
}

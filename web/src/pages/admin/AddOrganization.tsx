import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/api/client';

export function AddOrganization() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    category: '',
    cashbackType: 'PERCENT' as 'PERCENT' | 'FIXED',
    cashbackValue: '',
    minPurchase: '',
    maxCashbackPerTxn: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.ownerName || !form.ownerEmail || form.ownerPassword.length < 6) {
      setError('Tashkilot nomi, ega ismi, email va kamida 6 belgili parol shart');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/admin/organizations', {
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        cashbackType: form.cashbackType,
        cashbackValue: Number(form.cashbackValue) || 0,
        minPurchase: Number(form.minPurchase) || 0,
        maxCashbackPerTxn: form.maxCashbackPerTxn ? Number(form.maxCashbackPerTxn) : undefined,
        ownerName: form.ownerName.trim(),
        ownerEmail: form.ownerEmail.trim(),
        ownerPassword: form.ownerPassword,
      });
      navigate('/organizations');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Yangi tashkilot</h1>
      <p className="page-sub">Tashkilot va uning egasi hisobini yarating</p>

      <form className="card" onSubmit={submit} style={{ maxWidth: 620 }}>
        <h3 style={{ marginBottom: 12 }}>Tashkilot</h3>
        <div className="field">
          <label>Nomi</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Kategoriya</label>
          <input
            className="input"
            placeholder="Oziq-ovqat, Kafe, Kiyim…"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          />
        </div>
        <div className="grid cols-2">
          <div className="field">
            <label>Keshbek turi</label>
            <select
              className="select"
              value={form.cashbackType}
              onChange={(e) => set('cashbackType', e.target.value as 'PERCENT' | 'FIXED')}
            >
              <option value="PERCENT">Foiz (%)</option>
              <option value="FIXED">Qat'iy summa (so'm)</option>
            </select>
          </div>
          <div className="field">
            <label>{form.cashbackType === 'PERCENT' ? 'Foiz miqdori' : 'Summa (so\'m)'}</label>
            <input
              className="input"
              inputMode="numeric"
              value={form.cashbackValue}
              onChange={(e) => set('cashbackValue', e.target.value.replace(/[^\d.]/g, ''))}
            />
          </div>
        </div>
        <div className="grid cols-2">
          <div className="field">
            <label>Minimal xarid (so'm)</label>
            <input
              className="input"
              inputMode="numeric"
              value={form.minPurchase}
              onChange={(e) => set('minPurchase', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="field">
            <label>Keshbek shifti (so'm, ixtiyoriy)</label>
            <input
              className="input"
              inputMode="numeric"
              placeholder="cheksiz"
              value={form.maxCashbackPerTxn}
              onChange={(e) => set('maxCashbackPerTxn', e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <h3 style={{ margin: '12px 0' }}>Tashkilot egasi</h3>
        <div className="field">
          <label>Ega ismi</label>
          <input
            className="input"
            value={form.ownerName}
            onChange={(e) => set('ownerName', e.target.value)}
          />
        </div>
        <div className="grid cols-2">
          <div className="field">
            <label>Email (kirish uchun)</label>
            <input
              className="input"
              type="email"
              value={form.ownerEmail}
              onChange={(e) => set('ownerEmail', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Parol</label>
            <input
              className="input"
              type="text"
              placeholder="kamida 6 belgi"
              value={form.ownerPassword}
              onChange={(e) => set('ownerPassword', e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>
          {loading ? 'Yaratilmoqda…' : 'Tashkilot yaratish'}
        </button>
      </form>
    </div>
  );
}

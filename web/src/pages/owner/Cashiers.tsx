import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/api/client';
import type { Cashier } from '@/api/types';

export function Cashiers() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function load() {
    api.get<{ cashiers: Cashier[] }>('/api/org/cashiers').then((r) => setCashiers(r.cashiers)).catch(() => {});
  }
  useEffect(load, []);

  async function addCashier(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await api.post('/api/org/cashiers', { name: name.trim(), email: email.trim(), password });
      setMsg('Kassir qo‘shildi');
      setName('');
      setEmail('');
      setPassword('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  async function toggle(c: Cashier) {
    await api.patch(`/api/org/cashiers/${c.id}/active`, { isActive: !c.isActive }).catch(() => {});
    load();
  }

  return (
    <div>
      <h1 className="page-title">Kassirlar</h1>
      <p className="page-sub">Kassa xodimlarini boshqaring</p>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Yangi kassir qo‘shish</h3>
          <form onSubmit={addCashier}>
            <div className="field">
              <label>Ism</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Parol</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="error">{error}</div>}
            {msg && <div style={{ color: 'var(--success)', marginBottom: 8 }}>{msg}</div>}
            <button className="btn block" disabled={loading}>
              {loading ? 'Qo‘shilmoqda…' : 'Qo‘shish'}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Email</th>
                <th>Holat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cashiers.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted center">
                    Kassirlar yo‘q
                  </td>
                </tr>
              )}
              {cashiers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>
                    <span className={`badge ${c.isActive ? 'green' : 'red'}`}>
                      {c.isActive ? 'Faol' : 'Bloklangan'}
                    </span>
                  </td>
                  <td>
                    <button className="btn ghost" onClick={() => toggle(c)}>
                      {c.isActive ? 'Bloklash' : 'Faollashtirish'}
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

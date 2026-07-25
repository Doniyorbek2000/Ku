import { useEffect, useRef, useState, type FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/api/client';
import type { CreatePurchaseResult, PurchaseStatusResult } from '@/api/types';
import { sum } from '@/utils/format';

type View =
  | { step: 'form' }
  | { step: 'qr'; purchase: CreatePurchaseResult }
  | { step: 'done'; result: PurchaseStatusResult };

export function CashierPage() {
  const { user, logout } = useAuth();
  const [amount, setAmount] = useState('');
  const [redeem, setRedeem] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>({ step: 'form' });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }
  useEffect(() => stopPolling, []);

  async function createPurchase(e: FormEvent) {
    e.preventDefault();
    setError('');
    const amt = Number(amount);
    if (!Number.isInteger(amt) || amt <= 0) {
      setError('To‘g‘ri summa kiriting');
      return;
    }
    setLoading(true);
    try {
      const purchase = await api.post<CreatePurchaseResult>('/api/purchases', {
        amount: amt,
        redeemAmount: redeem ? Number(redeem) : 0,
      });
      setView({ step: 'qr', purchase });
      startPolling(purchase.qrToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  function startPolling(token: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.get<PurchaseStatusResult>(`/api/purchases/${token}`);
        if (status.status === 'COMPLETED') {
          stopPolling();
          setView({ step: 'done', result: status });
        } else if (status.status === 'EXPIRED' || status.status === 'CANCELLED') {
          stopPolling();
          setError('QR muddati o‘tdi yoki bekor qilindi');
          reset();
        }
      } catch {
        /* keyingi urinishda qayta */
      }
    }, 2000);
  }

  async function cancel(purchaseId: string) {
    stopPolling();
    try {
      await api.post(`/api/purchases/${purchaseId}/cancel`);
    } catch {
      /* e'tiborsiz */
    }
    reset();
  }

  function reset() {
    stopPolling();
    setAmount('');
    setRedeem('');
    setView({ step: 'form' });
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <div className="brand" style={{ margin: 0 }}>
            Ku · Kassa
          </div>
          <button className="btn ghost" onClick={logout}>
            Chiqish
          </button>
        </div>
        <p className="muted" style={{ marginTop: -8, marginBottom: 20 }}>
          Kassir: {user?.name}
        </p>

        {view.step === 'form' && (
          <form onSubmit={createPurchase} className="stack">
            <div className="field">
              <label>Xarid summasi (so'm)</label>
              <input
                className="input"
                inputMode="numeric"
                placeholder="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
            <div className="field">
              <label>Keshbek ishlatish (ixtiyoriy, so'm)</label>
              <input
                className="input"
                inputMode="numeric"
                placeholder="0"
                value={redeem}
                onChange={(e) => setRedeem(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button className="btn block" type="submit" disabled={loading}>
              {loading ? 'Yaratilmoqda…' : 'QR yaratish'}
            </button>
          </form>
        )}

        {view.step === 'qr' && (
          <div className="qr-stage">
            <div className="qr-box">
              <QRCodeSVG value={view.purchase.qrToken} size={220} />
            </div>
            <div className="big-amount">{sum(view.purchase.amount)}</div>
            <p className="muted">
              Keshbek: <b>{sum(view.purchase.cashbackPreview)}</b>
            </p>
            <p className="muted">
              <span className="spinner" /> Xaridor skanerlashini kutmoqda…
            </p>
            <button className="btn danger block" onClick={() => cancel(view.purchase.purchaseId)}>
              Bekor qilish
            </button>
          </div>
        )}

        {view.step === 'done' && (
          <div className="qr-stage">
            <div style={{ fontSize: 56 }}>✅</div>
            <h2>To‘lov qabul qilindi</h2>
            <p className="muted">
              Xaridorga keshbek berildi: <b style={{ color: 'var(--success)' }}>{sum(view.result.cashback)}</b>
            </p>
            {view.result.redeemRequested > 0 && (
              <p className="muted">Ishlatilgan keshbek: {sum(view.result.redeemRequested)}</p>
            )}
            <button className="btn block" onClick={reset}>
              Yangi xarid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

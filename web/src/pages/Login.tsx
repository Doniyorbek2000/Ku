import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="logo-lg">Ku</div>
        <p className="center muted" style={{ marginTop: 4, marginBottom: 24 }}>
          Tashkilot paneliga kirish
        </p>
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="owner@dokon.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label>Parol</label>
          <input
            className="input"
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn block" type="submit" disabled={loading}>
          {loading ? 'Kirilmoqda…' : 'Kirish'}
        </button>
      </form>
    </div>
  );
}

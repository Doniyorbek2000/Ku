import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Login } from '@/pages/Login';
import { Layout } from '@/components/Layout';
import { CashierPage } from '@/pages/cashier/CashierPage';
import { Dashboard } from '@/pages/owner/Dashboard';
import { Settings } from '@/pages/owner/Settings';
import { Cashiers } from '@/pages/owner/Cashiers';
import { Purchases } from '@/pages/owner/Purchases';

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-wrap">
        <span className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Kassir alohida sodda ekran ko'radi
  if (user.role === 'CASHIER') {
    return (
      <Routes>
        <Route path="/" element={<CashierPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user.role === 'ORG_OWNER') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cashiers" element={<Cashiers />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Boshqa rollar (admin/xaridor) bu panelga tegishli emas
  return (
    <div className="auth-wrap">
      <div className="card auth-card center">
        <p>Bu panel faqat kassir va tashkilot egalari uchun.</p>
      </div>
    </div>
  );
}

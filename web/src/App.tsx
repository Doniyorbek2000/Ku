import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Login } from '@/pages/Login';
import { Layout, adminLinks } from '@/components/Layout';
import { CashierPage } from '@/pages/cashier/CashierPage';
import { Dashboard } from '@/pages/owner/Dashboard';
import { Settings } from '@/pages/owner/Settings';
import { Cashiers } from '@/pages/owner/Cashiers';
import { Purchases } from '@/pages/owner/Purchases';
import { Promotions } from '@/pages/owner/Promotions';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { Organizations } from '@/pages/admin/Organizations';
import { AddOrganization } from '@/pages/admin/AddOrganization';

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
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user.role === 'SUPER_ADMIN') {
    return (
      <Routes>
        <Route element={<Layout links={adminLinks} brand="Ku · Admin" />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/new" element={<AddOrganization />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Xaridor bu panelga tegishli emas (u mobil ilovadan foydalanadi)
  return (
    <div className="auth-wrap">
      <div className="card auth-card center">
        <p>Bu panel tashkilotlar va admin uchun. Xaridorlar mobil ilovadan foydalanadi.</p>
      </div>
    </div>
  );
}

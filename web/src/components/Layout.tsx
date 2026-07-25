import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export interface NavItem {
  to: string;
  label: string;
  end: boolean;
}

const ownerLinks: NavItem[] = [
  { to: '/', label: 'Boshqaruv', end: true },
  { to: '/purchases', label: 'Xaridlar', end: false },
  { to: '/promotions', label: 'Aksiyalar', end: false },
  { to: '/cashiers', label: 'Kassirlar', end: false },
  { to: '/settings', label: 'Sozlamalar', end: false },
];

export function Layout({ links = ownerLinks, brand = 'Ku' }: { links?: NavItem[]; brand?: string }) {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">{brand}</div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <p className="muted" style={{ fontSize: 13, margin: '8px 14px' }}>
            {user?.name}
          </p>
          <button className="btn ghost block" onClick={logout}>
            Chiqish
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export const adminLinks: NavItem[] = [
  { to: '/', label: 'Statistika', end: true },
  { to: '/organizations', label: 'Tashkilotlar', end: false },
  { to: '/organizations/new', label: 'Yangi tashkilot', end: false },
];

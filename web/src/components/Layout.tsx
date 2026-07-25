import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/', label: 'Boshqaruv', end: true },
  { to: '/purchases', label: 'Xaridlar', end: false },
  { to: '/cashiers', label: 'Kassirlar', end: false },
  { to: '/settings', label: 'Sozlamalar', end: false },
];

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Ku</div>
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

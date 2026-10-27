import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { IconDashboard, IconFilm, IconLogo, IconLogout, IconMenu, IconX } from './Icons.jsx';

// The frame around every private page: sidebar on desktop, slide-in menu on mobile.
export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success('You have been signed out');
    navigate('/login', { replace: true });
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <IconMenu />
        </button>
        <div className="brand brand-small">
          <IconLogo />
          <span>ShotList</span>
        </div>
      </header>

      {menuOpen && <div className="sidebar-backdrop" onClick={closeMenu} />}

      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="sidebar-head">
          <div className="brand">
            <IconLogo size={22} />
            <span>ShotList</span>
          </div>
          <button className="icon-btn sidebar-close" onClick={closeMenu} aria-label="Close menu">
            <IconX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="nav-link" onClick={closeMenu}>
            <IconDashboard /> Dashboard
          </NavLink>
          <NavLink to="/projects" className="nav-link" onClick={closeMenu}>
            <IconFilm /> Projects
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{user.username.charAt(0).toUpperCase()}</span>
            <div className="user-meta">
              <strong>{user.username}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-block" onClick={handleLogout}>
            <IconLogout /> Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

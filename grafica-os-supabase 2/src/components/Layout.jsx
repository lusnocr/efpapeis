import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, LogOut, Printer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, title }) {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ordens', icon: FileText, label: 'Ordens de Serviço' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/produtos', icon: Package, label: 'Produtos' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="company-name">EF COMÉRCIO<br />DE PAPÉIS LTDA</div>
          <div className="company-sub">Gestão de Pedidos</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link" onClick={logout} style={{ color: 'rgba(255,255,255,.45)' }}>
            <LogOut size={17} />
            Sair do sistema
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="top-bar">
          <div className="top-bar-title">{title}</div>
          <div className="top-bar-right">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

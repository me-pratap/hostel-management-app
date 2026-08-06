import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, CreditCard, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, onClick }: { icon: any, label: string, to?: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = to ? location.pathname === to : false;
  
  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 20px',
    borderRadius: '16px',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-glow)' : 'transparent',
    border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '12px',
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
    fontSize: 'inherit'
  };

  if (onClick) {
    return (
      <button onClick={onClick} style={{ ...style, border: 'none', background: 'transparent' }} className="sidebar-btn">
        <Icon size={22} color="currentColor" strokeWidth={2} />
        {label}
      </button>
    );
  }
  
  return (
    <Link to={to!} style={style}>
      <Icon size={22} color={isActive ? 'var(--accent-primary)' : 'currentColor'} strokeWidth={isActive ? 2.5 : 2} />
      {label}
    </Link>
  );
};

export const Layout = () => {
  // Check local storage or default to light theme
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { logout } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Hostel OS</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Management</p>
          </div>
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <nav style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <SidebarItem icon={Home} label="Rooms" to="/rooms" />
          <SidebarItem icon={Users} label="Tenants" to="/tenants" />
          <SidebarItem icon={CreditCard} label="Payments" to="/payments" />
        </nav>

        <div style={{ padding: '20px 0 0', borderTop: '1px solid var(--border-subtle)' }}>
          <SidebarItem icon={LogOut} label="Logout" onClick={logout} />
        </div>
      </aside>
      
      <main className="main-content">
        <div className="glass-panel" style={{ padding: '40px', minHeight: 'calc(100vh - 80px)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

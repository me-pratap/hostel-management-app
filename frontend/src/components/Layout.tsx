import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, CreditCard, Sun, Moon } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to }: { icon: any, label: string, to: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      style={{
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
        fontWeight: isActive ? 600 : 500
      }}
    >
      <Icon size={22} color={isActive ? 'var(--accent-primary)' : 'currentColor'} strokeWidth={isActive ? 2.5 : 2} />
      {label}
    </Link>
  );
};

export const Layout = () => {
  // Check local storage or default to light theme
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ padding: '0 12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Hostel OS</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Management</p>
          </div>
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <nav>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <SidebarItem icon={Home} label="Rooms" to="/rooms" />
          <SidebarItem icon={Users} label="Tenants" to="/tenants" />
          <SidebarItem icon={CreditCard} label="Payments" to="/payments" />
        </nav>
      </aside>
      
      <main className="main-content">
        <div className="glass-panel" style={{ padding: '40px', minHeight: 'calc(100vh - 80px)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

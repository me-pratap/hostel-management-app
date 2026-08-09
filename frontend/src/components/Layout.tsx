import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, CreditCard, Sun, Moon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, onClick, isCollapsed }: { icon: any, label: string, to?: string, onClick?: () => void, isCollapsed?: boolean }) => {
  const location = useLocation();
  const isActive = to ? location.pathname === to : false;
  
  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: isCollapsed ? '14px' : '14px 20px',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
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
      <button onClick={onClick} style={{ ...style, border: 'none', background: 'transparent' }} className="sidebar-btn" title={label}>
        <Icon size={22} color="currentColor" strokeWidth={2} />
        {!isCollapsed && label}
      </button>
    );
  }
  
  return (
    <Link to={to!} style={style} title={label}>
      <Icon size={22} color={isActive ? 'var(--accent-primary)' : 'currentColor'} strokeWidth={isActive ? 2.5 : 2} />
      {!isCollapsed && label}
    </Link>
  );
};

export const Layout = () => {
  // Check local storage or default to light theme
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            right: '-16px',
            top: '40px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            zIndex: 10,
            cursor: 'pointer'
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div style={{ padding: isCollapsed ? '0 0 40px' : '0 12px 40px', display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center', flexDirection: isCollapsed ? 'column' : 'row', gap: isCollapsed ? '16px' : '0' }}>
          {!isCollapsed ? (
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Hostel OS</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Management</p>
            </div>
          ) : (
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--accent-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '1.2rem'
            }}>
              H
            </div>
          )}
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme" style={isCollapsed ? { width: '40px', height: '40px' } : {}}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <nav style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" isCollapsed={isCollapsed} />
          <SidebarItem icon={Home} label="Rooms" to="/rooms" isCollapsed={isCollapsed} />
          <SidebarItem icon={Users} label="Tenants" to="/tenants" isCollapsed={isCollapsed} />
          <SidebarItem icon={CreditCard} label="Payments" to="/payments" isCollapsed={isCollapsed} />
        </nav>

        <div style={{ padding: '20px 0 0', borderTop: '1px solid var(--border-subtle)' }}>
          <SidebarItem icon={LogOut} label="Logout" onClick={logout} isCollapsed={isCollapsed} />
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

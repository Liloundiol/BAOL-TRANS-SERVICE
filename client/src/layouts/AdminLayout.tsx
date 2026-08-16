import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Route, Bus, Users, LogOut, DollarSign, Menu, Bell, User, QrCode, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Close sidebar on mobile after clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!token || user?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  const sidebarLinks = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/trips', icon: <Route size={20} />, label: 'Trajets' },
    { path: '/admin/buses', icon: <Bus size={20} />, label: 'Bus' },
    { path: '/admin/reservations', icon: <Users size={20} />, label: 'Réservations' },
    { path: '/admin/verify/scan', icon: <QrCode size={20} />, label: 'Valider Billet' },
    { path: '/admin/users', icon: <User size={20} />, label: 'Utilisateurs' },
    { path: '/admin/packages', icon: <Package size={20} />, label: 'Colis' },
    { path: '/admin/finance', icon: <DollarSign size={20} />, label: 'Finance' },
  ];

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="BTS" className="brand-text" style={{ height: '32px' }} />
          <span className="brand-badge">ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`sidebar-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              className="sidebar-toggle" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="page-title">
              {sidebarLinks.find(link => location.pathname.startsWith(link.path))?.label || 'Administration'}
            </h1>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="topbar-user">
              <div className="avatar">{user?.firstName?.[0]?.toUpperCase() || 'A'}</div>
              <div className="user-info">
                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                <span className="user-role">{user?.role === 'ADMIN' ? 'Administrateur' : 'Staff'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

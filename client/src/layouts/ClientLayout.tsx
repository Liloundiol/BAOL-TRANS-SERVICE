import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, Ticket, User, MessageCircle, Package as PackageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/shared/Footer';
import './ClientLayout.css';

const ClientLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { path: '/', icon: <Home size={24} />, label: 'Accueil' },
    { path: '/search', icon: <Search size={24} />, label: 'Rechercher' },
    { path: '/dashboard', icon: <Ticket size={24} />, label: 'Mes Billets' },
    { path: '/my-packages', icon: <PackageIcon size={24} />, label: 'Mes Colis' },
    { 
      path: isAuthenticated ? (user?.role === 'ADMIN' ? '/admin/dashboard' : '/profile') : '/auth', 
      icon: <User size={24} />, 
      label: 'Profil' 
    },
  ];

  return (
    <div className="client-layout">
      {/* Desktop Header */}
      <header className="client-header desktop-only">
        <div className="container header-content">
          <Link to="/" className="brand-logo">
            <img src="/favicon.png" alt="BTS" style={{ height: '40px' }} />
          </Link>
          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="client-main">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav mobile-only">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/221772698246" 
        target="_blank" 
        rel="noreferrer" 
        className="floating-whatsapp-btn"
        aria-label="Contacter le support sur WhatsApp"
      >
        <MessageCircle size={20} />
        <span className="whatsapp-text">WhatsApp</span>
      </a>
    </div>
  );
};

export default ClientLayout;

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, Ticket, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ClientLayout.css';

const ClientLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { path: '/', icon: <Home size={24} />, label: 'Accueil' },
    { path: '/search', icon: <Search size={24} />, label: 'Rechercher' },
    { path: '/dashboard', icon: <Ticket size={24} />, label: 'Mes Billets' },
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
            <strong>BTS</strong>
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
      {location.pathname !== '/' && (
        <footer className="container footer-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', marginTop: 'auto' }}>
          <p>© 2026 Baol Trans Services. Tous droits réservés.</p>
          <div className="footer-links" style={{ display: 'flex', gap: '15px' }}>
            <Link to="/terms">CGV</Link>
            <Link to="/privacy">Confidentialité</Link>
          </div>
        </footer>
      )}

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

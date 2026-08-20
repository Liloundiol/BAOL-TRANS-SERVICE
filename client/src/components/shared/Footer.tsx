import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="bts-footer" translate="no">
      <div className="footer-container">
        
        {/* Brand Section */}
        <div className="footer-section brand-section">
          <img src="/logo.png" alt="BTS" className="footer-brand" style={{ height: '50px', marginBottom: '1rem' }} />
          <p className="footer-slogan">Votre partenaire de confiance pour des voyages confortables et sécurisés.</p>
          <div className="social-links">
            <a href="https://wa.me/221773402425" target="_blank" rel="noreferrer" className="social-icon" aria-label="WhatsApp"><MessageCircle size={20} /></a>
          </div>
        </div>

        <div className="footer-section links-section">
          <h3 className="footer-title">Suivez-nous</h3>
          <ul className="footer-links">
            <li>
              <a href="https://www.instagram.com/baoltransservices?igsh=MXZ4M2dhazgycml2OQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> Instagram
              </a>
            </li>
            <li>
              <a href="https://whatsapp.com/channel/0029Vb8ES2q4o7qEt0GxlA2d" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={18} /> Canal WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact-section">
          <h3 className="footer-title">Nous contacter</h3>
          <ul className="contact-list">
            <li>
              <Phone size={16} />
              <span>+221 77 340 24 25</span>
            </li>
            <li>
              <Mail size={16} />
              <span>contactbaoltranservices@gmail.com</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Université Gaston Berger, Saint-Louis</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Baol Trans Services. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

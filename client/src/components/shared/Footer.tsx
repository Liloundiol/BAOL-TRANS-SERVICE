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
          <h2 className="footer-brand">BTS</h2>
          <p className="footer-slogan">Voyagez en toute sérénité avec Baol Trans Services.</p>
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="WhatsApp"><MessageCircle size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section links-section">
          <h3 className="footer-title">Liens rapides</h3>
          <ul className="footer-links">
            <li><Link to="/">Rechercher un trajet</Link></li>
            <li><Link to="/tickets">Mes billets</Link></li>
            <li><Link to="/profile">Mon profil</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact-section">
          <h3 className="footer-title">Nous contacter</h3>
          <ul className="contact-list">
            <li>
              <Phone size={16} />
              <span>+221 77 123 45 67</span>
            </li>
            <li>
              <Mail size={16} />
              <span>contact@baoltrans.com</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Dakar, Sénégal</span>
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { ArrowRight, Clock, ShieldCheck, Smartphone, Headset, MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { TripCard } from '../../components/cards/TripCard';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await apiFetch('/trips');
        setAvailableTrips(data.trips);
      } catch (error) {
        console.error('Erreur lors du chargement des trajets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="landing-page" translate="no">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Nouveau à l'UGB 🎉</span>
          <h1>Voyagez simplement, <br/>sans prise de tête.</h1>
          <p>
            Réservez votre place de bus entre Saint-Louis et Dakar en moins de 2 minutes. 
            Paiement sécurisé par Wave, billet numérique instantané.
          </p>
          <div className="hero-actions">
            <Button variant="primary" onClick={() => navigate('/search')} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Réserver un billet
              <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </Button>
          </div>
        </div>
      </section>

      {/* Available Routes Section */}
      <section className="popular-trips-section">
        <h2>Trajets Disponibles Actuellement</h2>
        <p className="section-subtitle">Réservez dès maintenant votre place sur nos axes prioritaires</p>
        
        {isLoading ? (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>Chargement des trajets...</p>
        ) : (
          <div className="trips-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem', 
            marginTop: '2rem',
            padding: '0 1rem'
          }}>
            {availableTrips.length > 0 ? (
              availableTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  departure={trip.departure}
                  destination={trip.destination}
                  date={new Date(trip.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  time={new Date(trip.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  price={Number(trip.price)}
                  availableSeats={trip.availableSeats}
                  onReserve={(id) => {
                    if (!user) {
                      navigate('/auth', { state: { returnTo: `/book/${id}` } });
                    } else {
                      navigate(`/book/${id}`);
                    }
                  }}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-white)', borderRadius: '12px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
                <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>Aucun trajet disponible</h3>
                <p style={{ color: 'var(--color-gray-disabled)' }}>Il n'y a pas de trajet disponible pour le moment.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      <section className="coming-soon-section">
        <h2>⏳ Disponibles Prochainement</h2>
        <p className="section-subtitle">La vision nationale de BTS : nous arrivons bientôt chez vous !</p>
        
        <div className="coming-soon-grid">
          <div className="coming-soon-card"><span>UGB ⇄ Fatick</span> <span className="badge-soon">Bientôt</span></div>
          <div className="coming-soon-card"><span>UGB ⇄ Kaffrine / Kouguel</span> <span className="badge-soon">Bientôt</span></div>
          <div className="coming-soon-card"><span>UGB ⇄ Tambacounda</span> <span className="badge-soon">Bientôt</span></div>
          <div className="coming-soon-card"><span>UGB ⇄ Ziguinchor</span> <span className="badge-soon">Bientôt</span></div>
          <div className="coming-soon-card"><span>UGB ⇄ Kolda</span> <span className="badge-soon">Bientôt</span></div>
          <div className="coming-soon-card"><span>UGB ⇄ Matam</span> <span className="badge-soon">Bientôt</span></div>
          <div className="coming-soon-card"><span>UGB ⇄ Mbour</span> <span className="badge-soon">Bientôt</span></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Pourquoi choisir BTS ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Clock size={32} /></div>
            <h3>Gain de temps</h3>
            <p>Fini les longues files d'attente à la gare. Réservez depuis votre chambre.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Smartphone size={32} /></div>
            <h3>100% Mobile</h3>
            <p>Votre billet directement sur votre téléphone avec un QR Code unique.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={32} /></div>
            <h3>Paiement Sécurisé</h3>
            <p>Payez facilement et en toute sécurité avec Wave Sénégal.</p>
          </div>
        </div>
      </section>
      
      {/* Banner Section */}
      <section className="banner-section">
        <div className="banner-content">
          <h2>Prêt pour le départ ?</h2>
          <p>Rejoignez des centaines de voyageurs qui voyagent malin avec Baol Trans Services.</p>
          <Button variant="primary" onClick={() => navigate('/search')} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}>
            Voir les trajets disponibles
          </Button>
        </div>
      </section>
      {/* Footer Section */}
      <footer className="bts-footer">
        <div className="bts-footer-container">
          <div className="footer-top">
            <div className="footer-brand-info">
              <h3>Baol Trans Services</h3>
              <p>Gare Routière UGB, Saint-Louis</p>
            </div>
            
            <div className="footer-contact-links">
              <a href="tel:+221772698246" className="footer-link-item">
                <Phone size={18} />
                <span>+221 77 269 82 46</span>
              </a>
              <a href="mailto:support@baoltrans.sn" className="footer-link-item">
                <Mail size={18} />
                <span>support@baoltrans.sn</span>
              </a>
              <a href="https://wa.me/221772698246" target="_blank" rel="noreferrer" className="footer-link-item whatsapp-link">
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div className="footer-legal-links">
              <a href="/privacy">Confidentialité</a>
              <span className="separator">•</span>
              <a href="/terms">Conditions</a>
            </div>
            <div className="footer-copyright">
              <p>© {new Date().getFullYear()} BTS. Tous droits réservés.</p>
              <p>Développé par <a href="https://ibrahima-ong.com" target="_blank" rel="noreferrer">Ibrahima ONG</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

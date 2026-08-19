import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripCard } from '../../components/cards/TripCard';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Calendar, ArrowRight, User, Bus, ShieldCheck, Clock, ThumbsUp, Star } from 'lucide-react';
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
    <div className="pro-home" translate="no">
      {/* Hero Header */}
      <section className="pro-hero">
        <header className="hero-topbar">
          <div className="hero-brand">
            <img src="/logo.png" alt="BTS" className="brand-text" style={{ height: '45px' }} />
          </div>
        </header>

        <div className="hero-content">
          <h1>{user ? `Heureux de vous revoir, ${user.firstName || 'voyageur'}` : 'Voyagez à travers le Sénégal.'}</h1>
          <p>Réservez votre billet en toute sécurité avec Baol Trans Services.</p>
        </div>
      </section>

      <main className="pro-main-content">
        {/* Overlapping Search Widget */}
        <section className="pro-search-container">
          <div className="pro-search-card">
            <h2 className="search-card-title">Où allez-vous ?</h2>
            
            <div className="pro-search-inputs">
              <div className="input-group">
                <MapPin size={20} className="input-icon" />
                <div className="input-content">
                  <span className="input-label">Départ</span>
                  <input type="text" placeholder="Ville de départ" className="pro-input" readOnly onClick={() => navigate('/search')} />
                </div>
              </div>
              
              <div className="input-divider"></div>
              
              <div className="input-group">
                <MapPin size={20} className="input-icon dest-icon" />
                <div className="input-content">
                  <span className="input-label">Arrivée</span>
                  <input type="text" placeholder="Votre destination" className="pro-input" readOnly onClick={() => navigate('/search')} />
                </div>
              </div>

              <div className="input-divider"></div>

              <div className="input-group">
                <Calendar size={20} className="input-icon" />
                <div className="input-content">
                  <span className="input-label">Date</span>
                  <input type="text" placeholder="Aujourd'hui" className="pro-input" readOnly onClick={() => navigate('/search')} />
                </div>
              </div>
            </div>

            <button className="btn-pro-search" onClick={() => navigate('/search')}>
              <Search size={20} />
              Rechercher
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="pro-quick-actions">
          <h3 className="section-subtitle">Trajets populaires</h3>
          <div className="chips-container">
            <button className="pro-chip" onClick={() => navigate('/search?from=Dakar&to=Saint-Louis')}>
              Dakar <ArrowRight size={14} /> Saint-Louis
            </button>
            <button className="pro-chip" onClick={() => navigate('/search?from=Saint-Louis&to=Dakar')}>
              Saint-Louis <ArrowRight size={14} /> Dakar
            </button>
            <button className="pro-chip" onClick={() => navigate('/search?from=Dakar&to=Touba')}>
              Dakar <ArrowRight size={14} /> Touba
            </button>
          </div>
        </section>

        {/* Trips List */}
        <section className="pro-available-trips">
          <div className="section-header">
            <h2 className="section-title">Départs Imminents</h2>
            <button className="btn-view-all" onClick={() => navigate('/search')}>Voir tout</button>
          </div>
          
          {isLoading ? (
            <div className="loading-state">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          ) : (
            <div className="trips-list">
              {availableTrips.length > 0 ? (
                availableTrips.map(trip => (
                  <TripCard
                    key={trip.id}
                    id={trip.id}
                    departure={trip.departure}
                    destination={trip.destination}
                    date={new Date(trip.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
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
                <div className="empty-state">
                  <div className="empty-icon-container">
                    <Bus size={32} color="var(--color-primary)" />
                  </div>
                  <h4>Aucun départ prévu</h4>
                  <p>Consultez la page de recherche pour d'autres dates.</p>
                </div>
              )}
            </div>
          )}
        </section>
        {/* Pourquoi choisir BTS */}
        <section className="pro-features">
          <h2 className="section-title text-center" style={{ textAlign: 'center', marginBottom: '2rem' }}>Pourquoi choisir Baol Trans Services ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><ShieldCheck size={32} /></div>
              <h3>Confort & Sécurité</h3>
              <p>Des bus climatisés, récents et rigoureusement entretenus pour un voyage en toute sérénité.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Clock size={32} /></div>
              <h3>Gagnez du temps</h3>
              <p>Réservez votre billet en quelques clics et payez facilement via Wave, sans vous déplacer.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ThumbsUp size={32} /></div>
              <h3>Service Fiable</h3>
              <p>Des départs à l'heure, un personnel accueillant et un suivi en temps réel de vos réservations.</p>
            </div>
          </div>
        </section>

        {/* Avis Clients */}
        <section className="pro-reviews" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h2 className="section-title text-center" style={{ textAlign: 'center', marginBottom: '2rem' }}>Ce que disent nos clients</h2>
          <div className="reviews-grid">
            <div className="review-card">
              <div className="stars">
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
              </div>
              <p className="review-text">"Application super pratique ! J'ai pu réserver mon billet pour Touba en 2 minutes avec Wave. Fini les longues files d'attente à la gare."</p>
              <h4 className="reviewer-name">Aminata D.</h4>
            </div>
            <div className="review-card">
              <div className="stars">
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} color="#e5e7eb" />
              </div>
              <p className="review-text">"Les bus sont confortables et partent toujours à l'heure. Je voyage chaque semaine entre Dakar et Saint-Louis avec eux."</p>
              <h4 className="reviewer-name">Moussa N.</h4>
            </div>
            <div className="review-card">
              <div className="stars">
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
                <Star size={16} fill="#F4C430" color="#F4C430" />
              </div>
              <p className="review-text">"Le service client est très réactif. J'ai eu un imprévu et ils m'ont aidé à modifier ma réservation très rapidement."</p>
              <h4 className="reviewer-name">Fatou F.</h4>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;

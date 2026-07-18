import React, { useState, useEffect } from 'react';
import { User, Ticket, Star, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { apiFetch } from '../../services/api';
import { calculateLoyalty } from '../../utils/loyalty';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyReservations = async () => {
      try {
        const data = await apiFetch('/reservations/me');
        setReservations(data.reservations);
      } catch (error) {
        console.error("Failed to fetch reservations", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyReservations();
  }, []);

  const paidReservationsCount = reservations.filter(r => r.status === 'PAID').length;
  const loyalty = calculateLoyalty(paidReservationsCount);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-simple">
        <h1>Mon Tableau de bord</h1>
        <p>Bienvenue ! Voici le résumé de vos activités.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(11, 110, 46, 0.1)', color: 'var(--color-primary)' }}>
            <Ticket size={24} />
          </div>
          <div className="stat-content">
            <h3>{paidReservationsCount}</h3>
            <p>Billets au total</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(244, 196, 48, 0.2)', color: '#B8860B' }}>
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>{loyalty.points} pts</h3>
            <p>Fidélité {loyalty.tier}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="tickets-section">
          <h2>Mes prochains voyages</h2>
          
          {isLoading ? (
            <p>Chargement de vos billets...</p>
          ) : reservations.length > 0 ? (
            reservations.map((reservation) => (
              <div className="ticket-item" key={reservation.id}>
                <div className="ticket-date">
                  <span className="day">{new Date(reservation.bus.trip.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                  <span className="date-num">{new Date(reservation.bus.trip.date).getDate()}</span>
                </div>
                <div className="ticket-details">
                  <h4>{reservation.bus.trip.departure} ➔ {reservation.bus.trip.destination}</h4>
                  <p>Départ à {new Date(reservation.bus.trip.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • Bus {reservation.bus.busNumber}</p>
                  <span className={`status-badge ${reservation.status === 'PAID' ? 'paid' : 'pending'}`}>
                    {reservation.status === 'PAID' ? 'Payé' : 'En attente'}
                  </span>
                </div>
                {reservation.status === 'PAID' && reservation.ticket ? (
                  <Button variant="primary" onClick={() => navigate(`/ticket/${reservation.ticket.ticketCode}`)}>Voir QR Code</Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate(`/book/${reservation.bus.trip.id}`)}>Payer</Button>
                )}
              </div>
            ))
          ) : (
            <div className="dashboard-empty-state">
              <div className="empty-state-icon-wrapper">
                <Ticket size={48} className="empty-icon" />
              </div>
              <h3>Aucun voyage en vue</h3>
              <p>Vous n'avez pas encore de billet réservé. Planifiez votre prochain trajet dès aujourd'hui.</p>
              <Button variant="primary" onClick={() => navigate('/search')} style={{ borderRadius: '30px', padding: '0.75rem 2rem', fontWeight: 600 }}>
                Rechercher un trajet ➔
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/shared/Button';
import { Download, ChevronLeft } from 'lucide-react';
import { apiFetch } from '../../services/api';
import './TicketPage.css';

const TicketPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticketData, setTicketData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await apiFetch(`/reservations/ticket/${id}`);
        
        const reservation = response.ticket.reservation;
        const trip = reservation.bus.trip;
        const user = reservation.user;

        // Format the dates
        const dateObj = new Date(trip.date);
        const timeObj = new Date(trip.time);
        const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
          day: 'numeric', month: 'long', year: 'numeric' 
        });
        const formattedTime = timeObj.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', minute: '2-digit' 
        });

        setTicketData({
          ...response.ticket,
          boardingPoint: reservation.boardingPoint || trip.departure,
          dropoffPoint: reservation.dropoffPoint || trip.destination,
          passenger: `${user.firstName} ${user.lastName}`,
          seatNumber: reservation.seatNumber,
          date: formattedDate,
          time: formattedTime,
          price: `${trip.price} FCFA`
        });
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du billet');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchTicket();
    }
  }, [id]);

  if (isLoading) return <div className="p-4 text-center">Chargement de votre billet...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!ticketData) return <div className="p-4 text-center">Billet introuvable.</div>;

  return (
    <div className="ticket-page">
      <div className="ticket-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ChevronLeft size={24} />
          Retour
        </button>
        <h1>Votre Billet</h1>
      </div>

      <div className="ticket-card">
        <div className="ticket-top">
          <img src="/logo.png" alt="BTS" className="brand" style={{ height: '24px' }} />
          <div className="ticket-status badge-success badge">VALIDE</div>
        </div>
        
        <div className="ticket-body">
          <div className="ticket-header-info">
            <div className="passenger-info">
              <span className="label-small">PASSAGER</span>
              <h4>{ticketData.passenger}</h4>
            </div>
            <div className="seat-info">
              <span className="label-small">SIÈGE</span>
              <h2 className="seat-number">{ticketData.seatNumber || '--'}</h2>
            </div>
          </div>

          <div className="ticket-route-clean">
            <div className="route-point">
              <span className="label-small">DÉPART</span>
              <h3>{ticketData.boardingPoint}</h3>
              {ticketData.boardingTime && (
                <span className="boarding-time">
                  {ticketData.boardingTime}
                </span>
              )}
            </div>
            <div className="route-divider">
              <div className="line"></div>
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              </div>
              <div className="line"></div>
            </div>
            <div className="route-point right">
              <span className="label-small">ARRIVÉE</span>
              <h3>{ticketData.dropoffPoint}</h3>
            </div>
          </div>

          <div className="ticket-details-grid">
            <div className="detail-item">
              <span className="label-small">DATE</span>
              <strong>{ticketData.date}</strong>
            </div>
            <div className="detail-item">
              <span className="label-small">HEURE</span>
              <strong>{ticketData.time}</strong>
            </div>
            <div className="detail-item">
              <span className="label-small">PRIX PAYÉ</span>
              <strong>{ticketData.price}</strong>
            </div>
            <div className="detail-item">
              <span className="label-small">BUS N°</span>
              <strong>{ticketData.reservation?.bus?.busNumber || '--'}</strong>
            </div>
          </div>
        </div>

        <div className="ticket-divider"></div>

        <div className="ticket-qr-section">
          <div className="qr-container">
            <QRCodeSVG value={`${window.location.origin}/admin/verify/${ticketData.ticketCode}`} size={140} level="H" includeMargin={true} />
          </div>
          <p className="ticket-id">BILLET N° {ticketData.ticketCode}</p>
        </div>
      </div>

      <div className="ticket-actions">
        <Button variant="primary" fullWidth onClick={() => window.print()}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Télécharger en PDF
        </Button>
      </div>
    </div>
  );
};

export default TicketPage;

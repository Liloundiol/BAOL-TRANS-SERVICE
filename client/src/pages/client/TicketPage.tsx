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
        
        // Format the dates
        const dateObj = new Date(response.ticket.date);
        const timeObj = new Date(response.ticket.time);
        const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
          day: 'numeric', month: 'long', year: 'numeric' 
        });
        const formattedTime = timeObj.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', minute: '2-digit' 
        });

        setTicketData({
          ...response.ticket,
          date: formattedDate,
          time: formattedTime,
          price: `${response.ticket.price} FCFA`
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
          <img src="/logo.svg" alt="BTS" className="brand" style={{ height: '30px' }} />
          <div className="ticket-status badge-success badge">VALIDE</div>
        </div>
        
        <div className="ticket-body">
          <div className="ticket-route-clean">
            <div className="route-point">
              <span className="label-small">De (Montée)</span>
              <h3>{ticketData.boardingPoint}</h3>
              {ticketData.boardingTime && (
                <span className="boarding-time" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Heure de passage : {ticketData.boardingTime}
                </span>
              )}
            </div>
            <div className="route-divider">
              <div className="line"></div>
              <div className="icon">→</div>
              <div className="line"></div>
            </div>
            <div className="route-point right">
              <span className="label-small">À (Descente)</span>
              <h3>{ticketData.dropoffPoint}</h3>
            </div>
          </div>

          <div className="ticket-details-grid">
            <div className="detail-item">
              <span>Passager</span>
              <strong>{ticketData.passenger}</strong>
            </div>
            <div className="detail-item">
              <span>Date de départ</span>
              <strong>{ticketData.date} à {ticketData.time}</strong>
            </div>
            <div className="detail-item">
              <span>Siège</span>
              <strong className="seat-number" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
                N° {ticketData.seatNumber || '--'}
              </strong>
            </div>
            <div className="detail-item">
              <span>Prix Payé</span>
              <strong style={{ fontSize: '1.2rem' }}>{ticketData.price}</strong>
            </div>
          </div>
        </div>

        <div className="ticket-qr-section">
          <div className="qr-container">
            <QRCodeSVG value={`${window.location.origin}/admin/verify/${ticketData.id}`} size={150} />
          </div>
          <p className="ticket-id">{ticketData.id}</p>
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

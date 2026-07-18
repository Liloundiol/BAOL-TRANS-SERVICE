import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { apiFetch } from '../../services/api';
import './TicketVerifyPage.css';

type TicketStatus = 'VALID' | 'USED' | 'INVALID';

const TicketVerifyPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TicketStatus>('VALID');
  const [actionLoading, setActionLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await apiFetch(`/reservations/ticket/${id}`);
        const t = data.ticket;
        
        if (t.isUsed) {
          setStatus('USED');
        } else if (t.reservation.status === 'CANCELLED') {
          setStatus('INVALID');
        } else {
          setStatus('VALID');
        }

        setTicketData({
          id: t.ticketCode,
          passenger: `${t.reservation.user?.firstName || ''} ${t.reservation.user?.lastName || ''}`.trim() || 'Passager',
          phone: t.reservation.user?.phoneNumber || '',
          boardingPoint: t.reservation.boardingPoint || t.reservation.bus?.trip?.departure || '',
          dropoffPoint: t.reservation.dropoffPoint || t.reservation.bus?.trip?.destination || '',
          date: t.reservation.bus?.trip?.date ? new Date(t.reservation.bus.trip.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
          time: t.reservation.bus?.trip?.time ? new Date(t.reservation.bus.trip.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
          price: t.reservation.bus?.trip?.price || '',
          seat: t.reservation.seatNumber
        });
      } catch (error) {
        console.error("Erreur lors de la récupération du billet", error);
        setStatus('INVALID');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    } else {
      setStatus('INVALID');
      setLoading(false);
    }
  }, [id]);

  const handleValidate = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/reservations/ticket/${id}/use`, { method: 'PUT' });
      setStatus('USED');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la validation : " + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="verify-loading">
        <div className="spinner"></div>
        <p>Vérification du billet en cours...</p>
      </div>
    );
  }

  const renderStatus = () => {
    switch (status) {
      case 'VALID':
        return (
          <div className="status-banner valid">
            <CheckCircle size={48} />
            <h2>Billet Valide</h2>
            <p>Ce billet est prêt pour l'embarquement.</p>
          </div>
        );
      case 'USED':
        return (
          <div className="status-banner used">
            <AlertTriangle size={48} />
            <h2>Billet Déjà Utilisé</h2>
            <p>Ce billet a déjà été validé pour ce trajet.</p>
          </div>
        );
      case 'INVALID':
      default:
        return (
          <div className="status-banner invalid">
            <XCircle size={48} />
            <h2>Billet Invalide</h2>
            <p>Ce billet n'existe pas ou a été annulé.</p>
          </div>
        );
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-header">
        <button className="back-btn" onClick={() => navigate('/admin/verify/scan')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Contrôle Billet</h1>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="verify-content">
        {renderStatus()}

        {ticketData && status !== 'INVALID' && (
          <div className="verify-details">
            <h3>Informations du trajet</h3>
            
            <div className="detail-row">
              <span className="label">Passager</span>
              <span className="value font-bold">{ticketData.passenger}</span>
            </div>
            
            <div className="detail-row">
              <span className="label">Téléphone</span>
              <span className="value">{ticketData.phone}</span>
            </div>

            <div className="detail-row">
              <span className="label">Trajet</span>
              <span className="value">{ticketData.boardingPoint} → {ticketData.dropoffPoint}</span>
            </div>

            <div className="detail-row">
              <span className="label">Départ</span>
              <span className="value">{ticketData.date} à {ticketData.time}</span>
            </div>

            <div className="detail-row highlight">
              <span className="label">Place attribuée</span>
              <span className="value big">{ticketData.seat}</span>
            </div>
          </div>
        )}

        <div className="verify-actions">
          {status === 'VALID' ? (
            <Button 
              variant="primary" 
              fullWidth 
              size="large"
              onClick={handleValidate}
              isLoading={actionLoading}
            >
              Valider l'embarquement
            </Button>
          ) : (
            <Button 
              variant="outline" 
              fullWidth 
              size="large"
              onClick={() => navigate('/admin/verify/scan')}
            >
              Scanner un autre billet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketVerifyPage;

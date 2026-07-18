import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { Select } from '../../components/shared/Select';
import { apiFetch } from '../../services/api';
import './BookingFlow.css';

// Step 1: Seat Selection
// Step 1: Details Selection
const DetailsSelection: React.FC<{ onNext: (boarding: string, dropoff: string) => void, trip: any }> = ({ onNext, trip }) => {
  const [boardingPoint, setBoardingPoint] = useState<string>('');
  const [dropoffPoint, setDropoffPoint] = useState<string>('');
  
  return (
    <div className="booking-step">
      <div className="details-grid">
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Point de montée</label>
          <Select
            id="boardingPoint"
            label=""
            value={boardingPoint}
            onChange={(e) => setBoardingPoint(e.target.value)}
            placeholder="Sélectionnez un point de montée"
            options={
              trip?.boardingPoints && trip.boardingPoints.length > 0
                ? trip.boardingPoints.map((bp: any) => ({
                    value: bp.name,
                    label: `${bp.name} - ${bp.time}`
                  }))
                : [{ value: 'Non défini', label: 'Aucun point défini', disabled: true }]
            }
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Point de descente</label>
          <Select
            id="dropoffPoint"
            label=""
            value={dropoffPoint}
            onChange={(e) => setDropoffPoint(e.target.value)}
            placeholder="Sélectionnez un point de descente"
            options={[
              { value: 'Kébémer', label: 'Kébémer' },
              { value: 'Tivaouane', label: 'Tivaouane' },
              { value: 'Thiès', label: 'Thiès' },
              { value: 'Dakar - Patte d\'oie', label: 'Dakar - Patte d\'oie' },
              { value: 'Dakar - Colobane', label: 'Dakar - Colobane' },
            ]}
          />
        </div>
      </div>

      <div className="booking-footer">
        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => onNext(boardingPoint, dropoffPoint)}
          disabled={!boardingPoint || !dropoffPoint}
        >
          Confirmer les détails
        </Button>
      </div>
    </div>
  );
};



// Step 2: Booking Summary & Payment
const BookingSummary: React.FC<{ seat: number, boarding: string, dropoff: string, tripId: string, onPay: () => void }> = ({ seat, boarding, dropoff, tripId, onPay }) => {
  return (
    <div className="booking-step">
      <h2>Résumé de votre réservation</h2>
      
      <div className="summary-card">
        <div className="summary-row">
          <span>Trajet</span>
          <strong>UGB → Dakar</strong>
        </div>
        <div className="summary-row">
          <span>Point de montée</span>
          <strong>{boarding}</strong>
        </div>
        <div className="summary-row">
          <span>Point de descente</span>
          <strong>{dropoff}</strong>
        </div>
        <div className="summary-row">
          <span>Date et Heure</span>
          <strong>15 Oct 2026 - 14:00</strong>
        </div>
        <div className="summary-row">
          <span>Place numéro</span>
          <strong>{seat}</strong>
        </div>
        <hr className="summary-divider" />
        <div className="summary-row total">
          <span>Total à payer</span>
          <strong className="price-accent">5000 FCFA</strong>
        </div>
      </div>

      <div className="payment-section">
        <h3>Paiement sécurisé</h3>
        <p>Vous serez redirigé vers l'application Wave pour valider le paiement.</p>
        <Button variant="primary" fullWidth onClick={onPay}>
          Payer avec Wave
        </Button>
      </div>
    </div>
  );
};

const BookingFlow: React.FC = () => {
  const { id } = useParams(); // Trip ID
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Stored state
  const [trip, setTrip] = useState<any>(null);
  const [reservationData, setReservationData] = useState<any>(null);
  const [bookingPoints, setBookingPoints] = useState({ boarding: '', dropoff: '' });

  useEffect(() => {
    const fetchTrip = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch(`/trips/${id}`);
        setTrip(data.trip);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du trajet');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const handleDetailsSelected = async (boarding: string, dropoff: string) => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Create reservation (auto-assigns seat)
      const data = await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({ 
          tripId: id, 
          boardingPoint: boarding, 
          dropoffPoint: dropoff
        })
      });
      
      setReservationData(data.reservation);
      setBookingPoints({ boarding, dropoff });
      setStep(2); // Go to payment
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réservation');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 2. Pay reservation
      const data = await apiFetch('/reservations/pay', {
        method: 'POST',
        body: JSON.stringify({ 
          reservationId: reservationData.id, 
          waveTransactionId: `WAVE-${Date.now()}` 
        })
      });

      // 3. Success -> Redirect to ticket
      navigate(`/ticket/${data.ticket.ticketCode}`);
    } catch (err: any) {
      setError(err.message || 'Erreur de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-flow-container">
      <div className="booking-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Détails</div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Paiement</div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Billet</div>
      </div>

      {error && <div className="auth-alert error" style={{margin: '1rem'}}>{error}</div>}
      {isLoading && <p style={{textAlign: 'center', margin: '1rem'}}>Chargement en cours...</p>}

      {!isLoading && step === 1 && trip && <DetailsSelection onNext={handleDetailsSelected} trip={trip} />}
      {!isLoading && step === 2 && reservationData && (
        <BookingSummary 
          seat={reservationData.seatNumber} 
          boarding={bookingPoints.boarding} 
          dropoff={bookingPoints.dropoff} 
          tripId={id || ''} 
          onPay={handlePayment} 
        />
      )}
    </div>
  );
};

export default BookingFlow;

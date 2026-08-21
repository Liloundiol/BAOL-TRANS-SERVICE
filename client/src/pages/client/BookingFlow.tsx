import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { Select } from '../../components/shared/Select';
import { apiFetch, API_BASE_URL } from '../../services/api';
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
            options={
              trip?.dropoffPoints && trip.dropoffPoints.length > 0
                ? trip.dropoffPoints.map((dp: any) => ({
                    value: dp.name,
                    label: `${dp.name} - ${dp.time}`
                  }))
                : [{ value: 'Non défini', label: 'Aucun point défini', disabled: true }]
            }
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
const BookingSummary: React.FC<{ seat: number, boarding: string, dropoff: string, trip: any, onPay: () => void }> = ({ seat, boarding, dropoff, trip, onPay }) => {

  return (
    <div className="booking-step">
      <h2>Résumé de votre réservation</h2>
      
      <div className="summary-card">
        <div className="summary-row">
          <span>Trajet</span>
          <strong>{trip.departure} → {trip.destination}</strong>
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
          <strong>{new Date(trip.date).toLocaleDateString('fr-FR')} - {trip.departureTime}</strong>
        </div>
        <div className="summary-row">
          <span>Place numéro</span>
          <strong>{seat}</strong>
        </div>
        <hr className="summary-divider" />
        <div className="summary-row total">
          <span>Total à payer</span>
          <strong className="price-accent">{trip.price} FCFA</strong>
        </div>
      </div>

      <div className="payment-section" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ color: '#0B6E2E', marginBottom: '1rem' }}>Paiement Wave</h3>
        <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: '#374151' }}>
          <li style={{ marginBottom: '0.5rem' }}>Cliquez sur le lien ci-dessous ou ouvrez votre application Wave</li>
          <li style={{ marginBottom: '0.5rem' }}>Payez <strong>{trip.price} FCFA</strong> au numéro : <strong style={{color: '#111827', fontSize: '1.1em'}}>{import.meta.env.VITE_WAVE_MERCHANT_PHONE || '77 000 00 00'}</strong></li>
        </ol>

        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => {
            if (import.meta.env.VITE_WAVE_MERCHANT_LINK) {
              window.open(import.meta.env.VITE_WAVE_MERCHANT_LINK, '_blank');
            }
            onPay();
          }}
        >
          🔗 Payer et confirmer ma réservation
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
      // La réservation a déjà été créée à l'étape 1 (en statut PENDING)
      // L'admin validera manuellement sans preuve image
      
      // 3. Move to success/ticket step
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la confirmation de la réservation');
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
          trip={trip} 
          onPay={handlePayment} 
        />
      )}
      {!isLoading && step === 3 && (
        <div className="booking-step" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#0B6E2E', marginBottom: '1rem' }}>Réservation en attente !</h2>
          <p style={{ marginBottom: '2rem' }}>Votre réservation a bien été enregistrée. L'administrateur vérifiera votre paiement Wave et validera votre billet.</p>
          <p>Vous pourrez suivre l'état et télécharger votre billet directement depuis l'onglet <strong>Mes Réservations</strong> une fois validé.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>
            Voir mes réservations
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;

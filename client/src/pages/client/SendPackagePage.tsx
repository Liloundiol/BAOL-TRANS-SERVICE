import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { Package, ArrowRight, User, Phone, Weight } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import './SendPackagePage.css';

const SendPackagePage: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTripId, setSelectedTripId] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [packageType, setPackageType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await apiFetch('/trips');
        if (response.success && response.trips) {
          // Filter only upcoming active trips
          const upcomingTrips = response.trips.filter((t: any) => 
            new Date(t.date) >= new Date(new Date().setHours(0,0,0,0)) && t.status === 'ACTIVE'
          );
          setTrips(upcomingTrips);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const calculatePrice = () => {
    if (packageType === 'VALISE_SAC') return 4000;
    if (packageType === 'DOCUMENT') return 2500;
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) {
      setError('Veuillez sélectionner un trajet.');
      return;
    }
    if (!packageType) {
      setError('Veuillez sélectionner un type de colis.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiFetch('/packages', {
        method: 'POST',
        body: JSON.stringify({
          tripId: selectedTripId,
          receiverName,
          receiverPhone,
          description: packageType === 'VALISE_SAC' ? `Valise/Sac : ${description}` : `Document : ${description}`,
          packageType, // Send package type to backend for price validation
          weight: 0, // Keep weight to 0 to avoid breaking schema
        })
      });

      if (response.success) {
        // Open Wave link like reservations
        if (import.meta.env.VITE_WAVE_MERCHANT_LINK) {
          window.open(import.meta.env.VITE_WAVE_MERCHANT_LINK, '_blank');
        }
        setStep(2); // Go to success step
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du colis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 2) {
    return (
      <div className="send-package-page">
        <div className="package-hero">
          <Package size={48} className="package-hero-icon" />
          <h1>Colis en attente !</h1>
        </div>
        <div className="package-form-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#0B6E2E', marginBottom: '1rem' }}>Votre demande a bien été enregistrée.</h2>
          <p style={{ marginBottom: '1rem', color: '#374151' }}>
            Payez <strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(calculatePrice())}</strong> sur Wave au numéro : <br/>
            <strong style={{color: '#111827', fontSize: '1.2em'}}>{import.meta.env.VITE_WAVE_MERCHANT_PHONE || '77 340 24 25'}</strong>
          </p>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
            L'administrateur vérifiera votre paiement Wave et validera votre colis.
          </p>
          <Button variant="primary" onClick={() => navigate('/my-packages')} style={{ marginTop: '1rem' }}>
            Voir mes colis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="send-package-page">
      <div className="package-hero">
        <Package size={48} className="package-hero-icon" />
        <h1>Envoyer un Colis</h1>
        <p>Expédiez vos documents et bagages en toute sécurité via nos bus.</p>
      </div>

      <div className="package-form-container">
        <div className="auth-alert" style={{backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #F87171', marginBottom: '1.5rem'}}>
          <strong>⚠️ Attention :</strong> Les objets sensibles (ordinateur, téléphone, etc.) ne sont pas acceptés.
        </div>

        <form onSubmit={handleSubmit} className="package-form">
          {error && <div className="error-alert">{error}</div>}
          
          <div className="form-section">
            <h3>1. Choisir le trajet</h3>
            {loading ? (
              <p>Chargement des trajets...</p>
            ) : (
              <div className="trip-selector">
                {trips.length === 0 ? (
                  <p>Aucun trajet disponible pour le moment.</p>
                ) : (
                  trips.map(trip => (
                    <div 
                      key={trip.id} 
                      className={`trip-option ${selectedTripId === trip.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTripId(trip.id)}
                    >
                      <div className="trip-route">
                        <span>{trip.departure}</span>
                        <ArrowRight size={16} />
                        <span>{trip.destination}</span>
                      </div>
                      <div className="trip-date">
                        {new Date(trip.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à {new Date(trip.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>2. Informations du Destinataire</h3>
            <Input 
              label="Nom complet du destinataire" 
              id="receiverName" 
              value={receiverName} 
              onChange={e => setReceiverName(e.target.value)} 
              required 
              placeholder="Ex: Modou Fall"
              icon={<User size={18} />}
            />
            <Input 
              label="Numéro de téléphone" 
              id="receiverPhone" 
              value={receiverPhone} 
              onChange={e => setReceiverPhone(e.target.value)} 
              required 
              placeholder="Ex: 771234567"
              icon={<Phone size={18} />}
            />
          </div>

          <div className="form-section">
            <h3>3. Détails du Colis</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Type de colis</label>
              <select 
                id="packageType"
                value={packageType} 
                onChange={e => setPackageType(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
              >
                <option value="" disabled>Sélectionnez le type de colis</option>
                <option value="VALISE_SAC">Valise / Sac (4000 FCFA)</option>
                <option value="DOCUMENT">Document (2500 FCFA)</option>
              </select>
            </div>

            <Input 
              label="Description détaillée (Optionnel)" 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Ex: Vêtements, papiers administratifs..."
            />
            
            {packageType && (
              <div className="price-estimation">
                <span className="price-label">Tarif :</span>
                <span className="price-value">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(calculatePrice())}</span>
              </div>
            )}
          </div>

          <Button type="submit" fullWidth isLoading={isSubmitting} className="submit-package-btn" disabled={!selectedTripId}>
            Confirmer et Payer
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SendPackagePage;

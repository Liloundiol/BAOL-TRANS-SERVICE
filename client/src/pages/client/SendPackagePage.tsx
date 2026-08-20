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
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return 0;
    return Math.max(1000, w * 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) {
      setError('Veuillez sélectionner un trajet.');
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
          description,
          weight: parseFloat(weight),
        })
      });

      if (response.success) {
        // Rediriger vers la page de paiement ou de succès
        navigate(`/payment-mock?pkg=${response.package.id}&amt=${calculatePrice()}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du colis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="send-package-page">
      <div className="package-hero">
        <Package size={48} className="package-hero-icon" />
        <h1>Envoyer un Colis</h1>
        <p>Expédiez vos documents et bagages en toute sécurité via nos bus.</p>
      </div>

      <div className="package-form-container">
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
            <Input 
              label="Description du contenu" 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              placeholder="Ex: Ordinateur portable, Valise de vêtements..."
            />
            <Input 
              label="Poids estimé (en kg)" 
              id="weight" 
              type="number"
              step="0.1"
              value={weight} 
              onChange={e => setWeight(e.target.value)} 
              required 
              placeholder="Ex: 2.5"
              icon={<Weight size={18} />}
            />
            
            <div className="price-estimation">
              <span className="price-label">Tarif estimé :</span>
              <span className="price-value">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(calculatePrice())}</span>
              <small>(500 FCFA/kg - Minimum 1000 FCFA)</small>
            </div>
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

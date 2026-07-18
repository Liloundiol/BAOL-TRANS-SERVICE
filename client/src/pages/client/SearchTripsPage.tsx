import React, { useState } from 'react';
import { Search, Calendar, MapPin } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Select } from '../../components/shared/Select';
import { TripCard } from '../../components/cards/TripCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './SearchTripsPage.css';

const SearchTripsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { departure?: string; destination?: string } | null;

  const [departure, setDeparture] = useState(state?.departure || 'UGB');
  const [destination, setDestination] = useState(state?.destination || 'Dakar');
  const [date, setDate] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial trips (popular) on mount or perform search if state is provided
  React.useEffect(() => {
    if (state?.departure && state?.destination) {
      setHasSearched(true);
      fetchTrips({ departure: state.departure, destination: state.destination });
    } else {
      fetchTrips();
    }
  }, []);

  const fetchTrips = async (params: { departure?: string; destination?: string; date?: string } = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (params.departure) queryParams.append('departure', params.departure);
      if (params.destination) queryParams.append('destination', params.destination);
      if (params.date) queryParams.append('date', params.date);

      const data = await apiFetch(`/trips?${queryParams.toString()}`);
      setSearchResults(data.trips);
    } catch (err: any) {
      setError(err.message || 'Impossible de récupérer les trajets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    fetchTrips({ departure, destination, date });
  };

  return (
    <div className="search-trips-page">
      <div className="search-header">
        <h1>Où allez-vous ?</h1>
        <p>Trouvez votre prochain trajet avec BTS</p>
      </div>

      <div className="search-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-group" style={{ flex: 1, position: 'relative' }}>
            <Select
              id="departure"
              label=""
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              options={[
                { value: 'UGB', label: 'UGB' },
                { value: 'Dakar', label: 'Dakar' },
                { value: 'Thiès', label: 'Thiès' },
                { value: 'Touba', label: 'Touba' },
                { value: 'Mbacké', label: 'Mbacké' },
                { value: 'Diourbel', label: 'Diourbel' },
              ]}
              style={{ paddingLeft: '2.5rem' }}
            />
            <MapPin size={20} className="input-icon" style={{ position: 'absolute', left: '12px', top: '24px', zIndex: 1, color: 'var(--color-primary)' }} />
          </div>

          <div className="input-group" style={{ flex: 1, position: 'relative' }}>
            <Select
              id="destination"
              label=""
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              options={[
                { value: 'Dakar', label: 'Dakar' },
                { value: 'UGB', label: 'UGB' },
                { value: 'Thiès', label: 'Thiès' },
                { value: 'Touba', label: 'Touba' },
                { value: 'Mbacké', label: 'Mbacké' },
                { value: 'Diourbel', label: 'Diourbel' },
              ]}
              style={{ paddingLeft: '2.5rem' }}
            />
            <MapPin size={20} className="input-icon" style={{ position: 'absolute', left: '12px', top: '24px', zIndex: 1, color: 'var(--color-primary)' }} />
          </div>

          <div className="input-group" style={{ position: 'relative' }}>
            <Calendar size={20} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'var(--color-primary)' }} />
            <Input 
              id="date"
              label=""
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <Button variant="primary" type="submit" fullWidth>
            <Search size={18} style={{ marginRight: '8px' }} />
            Rechercher
          </Button>
        </form>
      </div>

      <div className="search-results">
        <h3>{hasSearched ? 'Résultats de recherche' : 'Trajets populaires'}</h3>
        
        {error && <div className="auth-alert error">{error}</div>}
        {isLoading && <p>Chargement des trajets...</p>}
        
        {!isLoading && <div className="trips-list">
          {searchResults.length > 0 ? (
            searchResults.map(trip => (
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
            <div className="empty-search-state" style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
              <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>Aucun trajet disponible</h3>
              <p style={{ color: 'var(--color-gray-disabled)' }}>Désolé, ce trajet n'est pas disponible pour le moment.</p>
              <p style={{ color: 'var(--color-primary)', marginTop: '1rem', fontWeight: '500' }}>Vérifiez les destinations "Disponibles Prochainement" sur l'accueil !</p>
            </div>
          )}
        </div>}
      </div>
    </div>
  );
};

export default SearchTripsPage;

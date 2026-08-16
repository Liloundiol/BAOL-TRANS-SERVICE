import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '../shared/Button';
import './TripCard.css';

interface TripCardProps {
  id: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  availableSeats: number;
  onReserve: (id: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  id,
  departure,
  destination,
  date,
  time,
  price,
  availableSeats,
  onReserve
}) => {
  const isFewSeats = availableSeats <= 3 && availableSeats > 0;
  const isFull = availableSeats === 0;

  return (
    <div className="bts-trip-card">
      <div className="bts-trip-badges">
        <div className="bts-badge neutral-badge">
          🗓️ {date}
        </div>
        <div className="bts-badge neutral-badge">
          ⏰ {time}
        </div>
        <div className={`bts-badge status-badge ${isFull ? 'full' : isFewSeats ? 'warning' : 'available'}`}>
          {isFull ? 'COMPLET' : isFewSeats ? 'VITE !' : 'DISPO'}
        </div>
      </div>

      <div className="bts-trip-header">
        <div className="bts-trip-route">
          {departure} <span className="route-arrow">→</span> {destination}
        </div>
      </div>

      <div className="bts-trip-main">
        <div className="bts-trip-price-block">
          <span className="price-label">Prix par place</span>
          <div className="bts-trip-price">
            {price.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
        
        <div className="bts-trip-seats-info">
          <Users size={16} className="seats-icon" />
          <span>{availableSeats} places restantes</span>
        </div>
      </div>

      <div className="bts-trip-footer">
        <Button 
          variant="primary" 
          onClick={() => onReserve(id)} 
          disabled={isFull}
          className="btn-full-width"
        >
          {isFull ? 'Complet' : 'Réserver ce trajet'}
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { MapPin, Clock, Calendar, Users } from 'lucide-react';
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
  totalSeats?: number;
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
  totalSeats = 13,
  onReserve
}) => {
  const isFewSeats = availableSeats <= 3;
  const isFull = availableSeats === 0;

  return (
    <div className="bts-trip-card">
      <div className="bts-trip-header">
        <div className="bts-trip-route">
          {departure} <span className="route-arrow">→</span> {destination}
        </div>
        <div className="bts-trip-price">
          {price.toLocaleString('fr-FR')} FCFA
        </div>
      </div>

      <div className="bts-trip-details">
        <div className="bts-trip-detail-item">
          <Calendar size={16} color="var(--color-primary)" />
          <span>{date}</span>
        </div>
        <div className="bts-trip-detail-item">
          <Clock size={16} color="var(--color-primary)" />
          <span>{time}</span>
        </div>
        <div className="bts-trip-detail-item">
          <MapPin size={16} color="var(--color-primary)" />
          <span>Départ: {departure}</span>
        </div>
      </div>

      <div className="bts-trip-footer">
        <div className={`bts-trip-seats ${isFull ? 'full' : 'available'}`}>
          <Users size={16} className="seats-icon" />
          <span>{isFull ? 'Complet' : 'Disponible'}</span>
        </div>
        <Button 
          variant="primary" 
          onClick={() => onReserve(id)} 
          disabled={isFull}
        >
          Réserver
        </Button>
      </div>
    </div>
  );
};

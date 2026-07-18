import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { Modal } from '../../components/shared/Modal';
import { apiFetch } from '../../services/api';
import './AdminPages.css';

interface Trip {
  id: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

const TripsManagementPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  
  // Form state
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('13'); // Default to 13
  const [boardingPoints, setBoardingPoints] = useState([{ name: '', time: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/trips');
      setTrips(data.trips || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingTripId) {
        await apiFetch(`/trips/${editingTripId}`, {
          method: 'PUT',
          body: JSON.stringify({ departure, destination, date, time, price })
        });
      } else {
        await apiFetch('/trips', {
          method: 'POST',
          body: JSON.stringify({
            departure, destination, date, time, price, capacity: Number(capacity),
            boardingPoints: boardingPoints.filter(bp => bp.name && bp.time)
          })
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchTrips();
    } catch (error: any) {
      setFormError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deletingTripId) return;
    try {
      await apiFetch(`/trips/${deletingTripId}`, { method: 'DELETE' });
      setDeletingTripId(null);
      fetchTrips();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleEditClick = (trip: Trip) => {
    setEditingTripId(trip.id);
    setDeparture(trip.departure);
    setDestination(trip.destination);
    setDate(trip.date ? trip.date.split('T')[0] : '');
    
    // Extract time (HH:mm)
    let timeStr = '';
    if (trip.time) {
      const d = new Date(trip.time);
      if (!isNaN(d.getTime())) {
        timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    }
    setTime(timeStr);
    
    setPrice(String(trip.price));
    setCapacity('13'); // Editing capacity might not be fully supported by backend easily without updating all buses, so we leave it default
    setBoardingPoints([{ name: '', time: '' }]); // Simplified for edit
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTripId(null);
    setDeparture('');
    setDestination('');
    setDate('');
    setTime('');
    setPrice('');
    setCapacity('13');
    setBoardingPoints([{ name: '', time: '' }]);
    setFormError('');
  };

  const addBoardingPoint = () => {
    setBoardingPoints([...boardingPoints, { name: '', time: '' }]);
  };

  const removeBoardingPoint = (index: number) => {
    const newPoints = [...boardingPoints];
    newPoints.splice(index, 1);
    setBoardingPoints(newPoints);
  };

  const updateBoardingPoint = (index: number, field: 'name' | 'time', value: string) => {
    const newPoints = [...boardingPoints];
    newPoints[index][field] = value;
    setBoardingPoints(newPoints);
  };

  const filteredTrips = (trips || []).filter(trip => {
    if (!trip) return false;
    const dep = trip.departure || '';
    const dest = trip.destination || '';
    return dep.toLowerCase().includes((searchQuery || '').toLowerCase()) || 
           dest.toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  const formatSafeDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
    } catch (e) { return '-'; }
  };

  const formatSafeTime = (timeString: string) => {
    if (!timeString) return '-';
    try {
      const d = new Date(timeString);
      return isNaN(d.getTime()) ? timeString : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return timeString; }
  };

  const columns: Column<Trip>[] = [
    { header: 'Départ', accessor: (row) => <strong>{row.departure || '-'}</strong>, sortAccessor: (row) => row.departure || '' },
    { header: 'Destination', accessor: (row) => <strong>{row.destination || '-'}</strong>, sortAccessor: (row) => row.destination || '' },
    { header: 'Date', accessor: (row) => formatSafeDate(row.date), sortAccessor: (row) => new Date(row.date || 0).getTime() },
    { header: 'Heure', accessor: (row) => formatSafeTime(row.time) },
    { header: 'Prix', accessor: (row) => `${row.price || 0} FCFA`, sortAccessor: (row) => Number(row.price || 0) },
    { 
      header: 'Statut', 
      accessor: (row) => {
        let badgeClass = 'badge-warning';
        let statusText = 'En attente';
        if (row.status === 'ACTIVE') { badgeClass = 'badge-success'; statusText = 'Actif'; }
        if (row.status === 'ARCHIVED') { badgeClass = 'badge-warning'; statusText = 'Archivé'; }
        return <span className={`badge ${badgeClass}`}>{statusText}</span>;
      },
      sortAccessor: (row) => row.status
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => handleEditClick(row)}
            style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
            title="Modifier"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => setDeletingTripId(row.id)}
            style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>Gestion des Trajets</h2>
          <p style={{ color: 'var(--color-gray-disabled)', marginTop: '0.25rem' }}>Créez et gérez les itinéraires de bus</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Nouveau Trajet
        </Button>
      </div>

      <div className="card">
        <div className="table-actions" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-disabled)' }} />
            <input 
              type="text" 
              placeholder="Rechercher un trajet (ex: Dakar)..." 
              className="bts-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }} 
            />
          </div>
        </div>
        
        <DataTable 
          columns={columns} 
          data={filteredTrips} 
          keyField="id" 
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingTripId ? "Modifier le trajet" : "Créer un nouveau trajet"}
      >
        <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px' }}>
              {formError}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Départ</label>
              <Input 
                value={departure} 
                onChange={e => setDeparture(e.target.value)} 
                placeholder="Ex: UGB (Saint-Louis)" 
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Destination</label>
              <Input 
                value={destination} 
                onChange={e => setDestination(e.target.value)} 
                placeholder="Ex: Dakar" 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
              <Input 
                type="date"
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Heure de départ</label>
              <Input 
                type="time"
                value={time} 
                onChange={e => setTime(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Prix (FCFA)</label>
              <Input 
                type="number"
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                placeholder="Ex: 5000" 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Capacité (Places)</label>
              <Input 
                type="number"
                value={capacity} 
                onChange={e => setCapacity(e.target.value)} 
                placeholder="Ex: 13, 30, 50..." 
                required 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Points d'embarquement</label>
            {boardingPoints.map((bp, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div style={{ flex: 2 }}>
                  <Input 
                    value={bp.name}
                    onChange={(e) => updateBoardingPoint(index, 'name', e.target.value)}
                    placeholder="Lieu (ex: Village M)"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input 
                    type="time"
                    value={bp.time}
                    onChange={(e) => updateBoardingPoint(index, 'time', e.target.value)}
                  />
                </div>
                {boardingPoints.length > 1 && (
                  <button type="button" onClick={() => removeBoardingPoint(index)} style={{ padding: '0.7rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <Button variant="outline" type="button" onClick={addBoardingPoint} style={{ width: '100%', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <Plus size={16} style={{ marginRight: '4px' }} /> Ajouter un point
            </Button>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : (editingTripId ? 'Mettre à jour' : 'Créer le trajet')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deletingTripId} 
        onClose={() => setDeletingTripId(null)}
        title="Confirmer l'archivage"
      >
        <div style={{ padding: '1rem 0' }}>
          <p>Êtes-vous sûr de vouloir archiver ce trajet ? Cette action retirera le trajet de la liste active, mais conservera toutes les réservations, les billets et l'historique financier intacts pour votre comptabilité.</p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeletingTripId(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDeleteTrip}>Oui, archiver</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TripsManagementPage;

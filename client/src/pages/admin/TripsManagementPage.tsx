import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Power, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Select } from '../../components/shared/Select';
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
  status: 'ACTIVE' | 'CANCELLED' | 'ARCHIVED';
  boardingPoints?: { id: string; name: string; time: string }[];
  dropoffPoints?: { id: string; name: string; time: string }[];
}

const TripsManagementPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'ACTIVE' | 'CANCELLED' | 'ARCHIVED'>('ALL');
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [togglingTripId, setTogglingTripId] = useState<string | null>(null);

  // Form state
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'CANCELLED' | 'ARCHIVED'>('ACTIVE');
  const [capacity, setCapacity] = useState('13'); // Default to 13
  const [boardingPoints, setBoardingPoints] = useState([{ name: '', time: '' }]);
  const [dropoffPoints, setDropoffPoints] = useState([{ name: '', time: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTrips = async () => {
    try {
      const data = await apiFetch('/trips?status=ALL');
      setTrips(data.trips || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingTripId) {
        await apiFetch(`/trips/${editingTripId}`, {
          method: 'PUT',
          body: JSON.stringify({
            departure, destination, date, time, price, status,
            boardingPoints: boardingPoints.filter(bp => bp.name.trim() !== ''),
            dropoffPoints: dropoffPoints.filter(dp => dp.name.trim() !== '')
          })
        });
        setToastMessage({ type: 'success', text: 'Trajet mis à jour avec succès.' });
      } else {
        await apiFetch('/trips', {
          method: 'POST',
          body: JSON.stringify({
            departure, destination, date, time, price, capacity: Number(capacity),
            boardingPoints: boardingPoints.filter(bp => bp.name.trim() !== ''),
            dropoffPoints: dropoffPoints.filter(dp => dp.name.trim() !== '')
          })
        });
        setToastMessage({ type: 'success', text: 'Nouveau trajet créé avec succès.' });
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

  const handleToggleStatus = async (trip: Trip) => {
    try {
      setTogglingTripId(trip.id);
      const isCurrentlyActive = trip.status === 'ACTIVE';
      const targetStatus = isCurrentlyActive ? 'CANCELLED' : 'ACTIVE';

      const response = await apiFetch(`/trips/${trip.id}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: targetStatus })
      });

      setToastMessage({
        type: 'success',
        text: response.message || (isCurrentlyActive ? 'Trajet désactivé avec succès.' : 'Trajet activé avec succès.')
      });
      fetchTrips();
    } catch (error: any) {
      setToastMessage({
        type: 'error',
        text: error.message || 'Erreur lors de la modification du statut'
      });
    } finally {
      setTogglingTripId(null);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deletingTripId) return;
    try {
      const response = await apiFetch(`/trips/${deletingTripId}`, { method: 'DELETE' });
      setDeletingTripId(null);
      setToastMessage({
        type: 'success',
        text: response.message || 'Trajet supprimé ou archivé avec succès.'
      });
      fetchTrips();
    } catch (error: any) {
      setToastMessage({
        type: 'error',
        text: error.message || 'Erreur lors de la suppression'
      });
    }
  };

  const handleEditClick = (trip: Trip) => {
    setEditingTripId(trip.id);
    setDeparture(trip.departure);
    setDestination(trip.destination);
    setDate(trip.date ? trip.date.split('T')[0] : '');
    setStatus(trip.status || 'ACTIVE');
    
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
    setCapacity('13');
    setBoardingPoints(trip.boardingPoints && trip.boardingPoints.length > 0 ? trip.boardingPoints.map(bp => ({ name: bp.name, time: bp.time })) : [{ name: '', time: '' }]);
    setDropoffPoints(trip.dropoffPoints && trip.dropoffPoints.length > 0 ? trip.dropoffPoints.map(dp => ({ name: dp.name, time: dp.time })) : [{ name: '', time: '' }]);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTripId(null);
    setDeparture('');
    setDestination('');
    setDate('');
    setTime('');
    setPrice('');
    setStatus('ACTIVE');
    setCapacity('13');
    setBoardingPoints([{ name: '', time: '' }]);
    setDropoffPoints([{ name: '', time: '' }]);
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

  const addDropoffPoint = () => {
    setDropoffPoints([...dropoffPoints, { name: '', time: '' }]);
  };

  const removeDropoffPoint = (index: number) => {
    const newPoints = [...dropoffPoints];
    newPoints.splice(index, 1);
    setDropoffPoints(newPoints);
  };

  const updateDropoffPoint = (index: number, field: 'name' | 'time', value: string) => {
    const newPoints = [...dropoffPoints];
    newPoints[index][field] = value;
    setDropoffPoints(newPoints);
  };

  // Counts for tabs
  const totalCount = trips.length;
  const activeCount = trips.filter(t => t.status === 'ACTIVE').length;
  const cancelledCount = trips.filter(t => t.status === 'CANCELLED').length;
  const archivedCount = trips.filter(t => t.status === 'ARCHIVED').length;

  const filteredTrips = (trips || []).filter(trip => {
    if (!trip) return false;

    // Filter by tab
    if (selectedStatusTab !== 'ALL' && trip.status !== selectedStatusTab) {
      return false;
    }

    const dep = trip.departure || '';
    const dest = trip.destination || '';
    const date = trip.date ? new Date(trip.date).toLocaleDateString('fr-FR') : '';
    const time = trip.time ? new Date(trip.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const statusText = trip.status || '';
    const bus = (trip as any).buses && (trip as any).buses.length > 0 ? (trip as any).buses.find((b:any) => b.status === 'AVAILABLE')?.busNumber || '' : '';
    
    const term = (searchQuery || '').toLowerCase();
    
    return dep.toLowerCase().includes(term) || 
           dest.toLowerCase().includes(term) ||
           date.includes(term) ||
           time.includes(term) ||
           statusText.toLowerCase().includes(term) ||
           bus.toLowerCase().includes(term);
  });

  const formatSafeDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
    } catch { return '-'; }
  };

  const formatSafeTime = (timeString: string) => {
    if (!timeString) return '-';
    try {
      const d = new Date(timeString);
      return isNaN(d.getTime()) ? timeString : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return timeString; }
  };

  const columns: Column<Trip>[] = [
    { 
      header: 'Itinéraire', 
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {row.departure || '-'} ➔ {row.destination || '-'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-disabled)', marginTop: '2px' }}>
            {row.boardingPoints?.length ? `${row.boardingPoints.length} point(s) de montée` : 'Direct'}
          </div>
        </div>
      ), 
      sortAccessor: (row) => `${row.departure} ${row.destination}` 
    },
    { header: 'Date', accessor: (row) => formatSafeDate(row.date), sortAccessor: (row) => new Date(row.date || 0).getTime() },
    { header: 'Heure', accessor: (row) => formatSafeTime(row.time), sortAccessor: (row) => row.time || '' },
    { header: 'Prix', accessor: (row) => <strong>{Number(row.price || 0).toLocaleString('fr-FR')} FCFA</strong>, sortAccessor: (row) => Number(row.price || 0) },
    { 
      header: 'Statut', 
      sortAccessor: (row) => row.status || '',
      accessor: (row) => {
        if (row.status === 'ACTIVE') {
          return (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(11, 110, 46, 0.1)',
              color: 'var(--color-primary)'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
              Actif
            </span>
          );
        }
        if (row.status === 'CANCELLED') {
          return (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: '#FEF3C7',
              color: '#B45309'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B' }}></span>
              Désactivé
            </span>
          );
        }
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: '#F3F4F6',
            color: '#6B7280'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF' }}></span>
            Archivé
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row) => {
        const isActive = row.status === 'ACTIVE';
        const isToggling = togglingTripId === row.id;

        return (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Activer / Désactiver Toggle Button */}
            <button 
              onClick={() => handleToggleStatus(row)}
              disabled={isToggling}
              style={{ 
                padding: '0.42rem 0.75rem', 
                borderRadius: '6px',
                border: isActive ? '1px solid #FCD34D' : '1px solid #A7F3D0',
                background: isActive ? '#FFFBEB' : '#ECFDF5', 
                color: isActive ? '#B45309' : 'var(--color-primary)', 
                cursor: isToggling ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                opacity: isToggling ? 0.6 : 1
              }}
              title={isActive ? "Désactiver le trajet (masqué aux clients)" : "Activer le trajet (visible aux clients)"}
            >
              <Power size={14} />
              {isActive ? 'Désactiver' : 'Activer'}
            </button>

            {/* Modifier Button */}
            <button 
              onClick={() => handleEditClick(row)}
              style={{ 
                padding: '0.45rem', 
                background: '#F0FDF4', 
                border: '1px solid #DCFCE7', 
                borderRadius: '6px', 
                color: 'var(--color-primary)', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Modifier le trajet"
            >
              <Edit2 size={15} />
            </button>

            {/* Supprimer Button */}
            <button 
              onClick={() => setDeletingTripId(row.id)}
              style={{ 
                padding: '0.45rem', 
                background: '#FEF2F2', 
                border: '1px solid #FEE2E2', 
                borderRadius: '6px', 
                color: '#EF4444', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Supprimer ou archiver le trajet"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="admin-page">
      {/* Toast feedback banner */}
      {toastMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          background: toastMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: toastMessage.type === 'success' ? '#065F46' : '#991B1B',
          border: `1px solid ${toastMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gestion des Trajets</h2>
          <p style={{ color: 'var(--color-gray-disabled)', marginTop: '0.25rem' }}>
            Activez, désactivez ou supprimez les itinéraires de bus en toute simplicité
          </p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Nouveau Trajet
        </Button>
      </div>

      <div className="card" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-gray-border)' }}>
        {/* Top actions & Status filters */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--color-gray-border)', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <button
              onClick={() => setSelectedStatusTab('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: selectedStatusTab === 'ALL' ? '#FFFFFF' : 'transparent',
                color: selectedStatusTab === 'ALL' ? 'var(--color-primary)' : '#64748B',
                fontWeight: selectedStatusTab === 'ALL' ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: selectedStatusTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Tous ({totalCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('ACTIVE')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: selectedStatusTab === 'ACTIVE' ? '#FFFFFF' : 'transparent',
                color: selectedStatusTab === 'ACTIVE' ? 'var(--color-primary)' : '#64748B',
                fontWeight: selectedStatusTab === 'ACTIVE' ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: selectedStatusTab === 'ACTIVE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Actifs ({activeCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('CANCELLED')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: selectedStatusTab === 'CANCELLED' ? '#FFFFFF' : 'transparent',
                color: selectedStatusTab === 'CANCELLED' ? '#B45309' : '#64748B',
                fontWeight: selectedStatusTab === 'CANCELLED' ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: selectedStatusTab === 'CANCELLED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Désactivés ({cancelledCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('ARCHIVED')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: selectedStatusTab === 'ARCHIVED' ? '#FFFFFF' : 'transparent',
                color: selectedStatusTab === 'ARCHIVED' ? '#374151' : '#64748B',
                fontWeight: selectedStatusTab === 'ARCHIVED' ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: selectedStatusTab === 'ARCHIVED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Archivés ({archivedCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-disabled)' }} />
            <input 
              type="text" 
              placeholder="Rechercher départ, destination..." 
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
          emptyMessage="Aucun trajet trouvé dans cette catégorie"
        />
      </div>

      {/* Modal Créer / Modifier Trajet */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingTripId ? "Modifier le trajet" : "Créer un nouveau trajet"}
      >
        <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', fontSize: '0.9rem' }}>
              {formError}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Départ</label>
              <Input
                id="trip-departure"
                label=""
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Ex: UGB (Saint-Louis)"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Destination</label>
              <Input
                id="trip-destination"
                label=""
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Dakar"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
              <Input 
                id="trip-date"
                label=""
                type="date"
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Heure de départ</label>
              <Input 
                id="trip-time"
                label=""
                type="time"
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Prix (FCFA)</label>
              <Input 
                id="trip-price"
                label=""
                type="number"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="Ex: 5000" 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Capacité (Places)</label>
              <Input 
                id="trip-capacity"
                label=""
                type="number"
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                placeholder="Ex: 13, 30, 50..." 
                required 
              />
            </div>
          </div>

          {editingTripId && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Statut du trajet</label>
              <Select
                id="trip-status"
                label=""
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { value: 'ACTIVE', label: 'Actif (Visible et réservable par les clients)' },
                  { value: 'CANCELLED', label: 'Désactivé (Masqué de la réservation publique)' },
                  { value: 'ARCHIVED', label: 'Archivé (Conservé pour l’historique)' }
                ]}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Points d'embarquement</label>
            {boardingPoints.map((bp, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div style={{ flex: 2 }}>
                  <Input 
                    id={`bp-name-${index}`}
                    label=""
                    value={bp.name}
                    onChange={(e) => updateBoardingPoint(index, 'name', e.target.value)}
                    placeholder="Nom du point (ex: Arrêt 1)"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input 
                    id={`bp-time-${index}`}
                    label=""
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
              <Plus size={16} style={{ marginRight: '4px' }} /> Ajouter un point de montée
            </Button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Points de descente</label>
            {dropoffPoints.map((dp, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div style={{ flex: 2 }}>
                  <Input 
                    id={`dp-name-${index}`}
                    label=""
                    value={dp.name}
                    onChange={(e) => updateDropoffPoint(index, 'name', e.target.value)}
                    placeholder="Nom du point (ex: Arrêt Kébémer)"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input 
                    id={`dp-time-${index}`}
                    label=""
                    type="time"
                    value={dp.time}
                    onChange={(e) => updateDropoffPoint(index, 'time', e.target.value)}
                  />
                </div>
                {dropoffPoints.length > 1 && (
                  <button type="button" onClick={() => removeDropoffPoint(index)} style={{ padding: '0.7rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <Button variant="outline" type="button" onClick={addDropoffPoint} style={{ width: '100%', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <Plus size={16} style={{ marginRight: '4px' }} /> Ajouter un point de descente
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

      {/* Modal de Confirmation de Suppression */}
      <Modal 
        isOpen={!!deletingTripId} 
        onClose={() => setDeletingTripId(null)}
        title="Supprimer ou archiver le trajet"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ background: '#FEE2E2', padding: '10px', borderRadius: '50%', color: '#EF4444', flexShrink: 0 }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)', fontSize: '1rem' }}>
                Confirmation d'action
              </h4>
              <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 0.5rem 0' }}>
                • <strong>Suppression définitive :</strong> si aucune réservation ni colis n'est associé à ce trajet, il sera retiré de la base de données.
              </p>
              <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                • <strong>Archivage automatique :</strong> si des réservations ou colis existent déjà, le trajet sera automatiquement archivé pour sécuriser les billets et l'historique comptable.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeletingTripId(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDeleteTrip}>Confirmer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TripsManagementPage;

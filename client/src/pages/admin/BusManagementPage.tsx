import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { Select } from '../../components/shared/Select';
import { apiFetch } from '../../services/api';
import './AdminPages.css';

interface Bus {
  id: string;
  busNumber: string;
  trip: string;
  tripId?: string; // We'll need this for editing if it's provided
  capacity: number;
  occupied: number;
  status: 'FULL' | 'AVAILABLE';
}

interface TripOption {
  id: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
}

const BusManagementPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feedback state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  // Form State
  const [busNumber, setBusNumber] = useState('');
  const [tripId, setTripId] = useState('');
  const [capacity, setCapacity] = useState('13');
  const [status, setStatus] = useState('AVAILABLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBusesAndTrips = async () => {
    setIsLoading(true);
    try {
      const [busesData, tripsData] = await Promise.all([
        apiFetch('/buses/all'),
        apiFetch('/trips')
      ]);
      setBuses(busesData.buses);
      setTrips(tripsData.trips);
      setErrorMsg('');
    } catch (error: any) {
      setErrorMsg(error.message || "Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusesAndTrips();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setBusNumber('');
    setTripId('');
    setCapacity('13');
    setStatus('AVAILABLE');
    setSelectedBusId(null);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (bus: Bus) => {
    setModalMode('edit');
    setSelectedBusId(bus.id);
    setBusNumber(bus.busNumber);
    // Find the trip ID from the trips list if backend didn't provide tripId directly
    const matchingTrip = trips.find(t => `${t.departure} → ${t.destination}` === bus.trip);
    setTripId(bus.tripId || (matchingTrip ? matchingTrip.id : ''));
    setCapacity(bus.capacity.toString());
    setStatus(bus.status);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busNumber || !tripId) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (modalMode === 'create') {
        await apiFetch('/buses', {
          method: 'POST',
          body: JSON.stringify({ busNumber, tripId, capacity })
        });
        setSuccessMsg('Bus créé avec succès');
      } else if (modalMode === 'edit' && selectedBusId) {
        await apiFetch(`/buses/${selectedBusId}`, {
          method: 'PUT',
          body: JSON.stringify({ busNumber, tripId, capacity, status })
        });
        setSuccessMsg('Bus mis à jour avec succès');
      }
      
      setIsModalOpen(false);
      fetchBusesAndTrips();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || 'Une erreur est survenue lors de la sauvegarde du bus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBus = async (id: string, number: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le bus ${number} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await apiFetch(`/buses/${id}`, {
        method: 'DELETE'
      });
      setSuccessMsg('Bus supprimé avec succès');
      fetchBusesAndTrips();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || 'Impossible de supprimer ce bus (vérifiez s\'il contient des réservations actives).');
    }
  };

  const filteredBuses = buses.filter(bus => 
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.trip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tripOptions = trips.map(t => ({
    value: t.id,
    label: `${t.departure} → ${t.destination} (${new Date(t.date).toLocaleDateString('fr-FR')})`
  }));

  const columns: Column<Bus>[] = [
    { header: 'Numéro', accessor: (row) => <strong>{row.busNumber}</strong> },
    { header: 'Trajet Assigné', accessor: 'trip' },
    { header: 'Capacité', accessor: (row) => `${row.capacity} places` },
    { 
      header: 'Occupé', 
      accessor: (row) => (
        <span style={{ 
          color: row.occupied >= row.capacity ? '#DC2626' : 'var(--color-primary)',
          fontWeight: 'bold'
        }}>
          {row.occupied} / {row.capacity}
        </span>
      )
    },
    { 
      header: 'Statut', 
      accessor: (row) => (
        <span className={`badge ${row.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}>
          {row.status === 'FULL' ? 'COMPLET' : 'DISPONIBLE'}
        </span>
      ) 
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>Gestion des Bus</h2>
          <p style={{ color: 'var(--color-gray-disabled)', marginTop: '0.25rem' }}>Supervisez les bus et leur capacité de remplissage</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Nouveau Bus
        </Button>
      </div>

      {errorMsg && !isModalOpen && (
        <div className="auth-alert error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {errorMsg}
        </div>
      )}
      
      {successMsg && !isModalOpen && (
        <div className="auth-alert success" style={{ marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      <div className="card">
        <div className="table-actions" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-disabled)' }} />
            <input 
              type="text" 
              placeholder="Rechercher un bus par numéro..." 
              className="bts-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }} 
            />
          </div>
        </div>
        
        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement en cours...</p>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredBuses} 
            keyField="id" 
            actions={(row) => (
              <>
                <button 
                  className="icon-btn" 
                  title="Modifier" 
                  style={{ color: 'var(--color-primary)' }}
                  onClick={() => openEditModal(row)}
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="icon-btn" 
                  title="Supprimer" 
                  style={{ color: '#DC2626' }}
                  onClick={() => handleDeleteBus(row.id, row.busNumber)}
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          />
        )}
      </div>

      {/* Modal d'ajout/modification */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === 'create' ? "Créer un nouveau bus" : "Modifier le bus"}
      >
        <form onSubmit={handleSaveBus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {errorMsg && isModalOpen && (
             <div className="auth-alert error" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{errorMsg}</div>
          )}

          <Input 
            label="Numéro du Bus *" 
            placeholder="Ex: BUS-1234" 
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            required
          />
          
          <Select 
            label="Trajet Assigné *"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            options={[{ value: '', label: 'Sélectionner un trajet' }, ...tripOptions]}
          />
          
          <Input 
            label="Capacité totale" 
            type="number"
            min="1"
            max="100"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />

          {modalMode === 'edit' && (
             <Select 
               label="Statut du Bus"
               value={status}
               onChange={(e) => setStatus(e.target.value)}
               options={[
                 { value: 'AVAILABLE', label: 'Disponible' },
                 { value: 'FULL', label: 'Complet' }
               ]}
             />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {modalMode === 'create' ? 'Créer le bus' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BusManagementPage;

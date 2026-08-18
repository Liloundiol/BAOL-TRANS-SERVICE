import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { apiFetch } from '../../services/api';
import './AdminPages.css';

interface Reservation {
  id: string;
  user: { phoneNumber: string, firstName?: string, lastName?: string };
  bus: { trip: { departure: string, destination: string, date: string, time: string, price: string } };
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentProofUrl?: string;
  createdAt: string;
}

const ReservationsManagementPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'CANCELLED'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'TRIP_ASC'>('DATE_DESC');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await apiFetch('/reservations/all');
        setReservations(data.reservations);
      } catch (error: any) {
        setErrorMsg(error.message || "Erreur lors du chargement des réservations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
      if (newStatus === 'PAID') {
        alert('Réservation validée, billet généré et SMS envoyé !');
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const columns: Column<Reservation>[] = [
    { 
      header: 'Client', 
      accessor: (row) => <strong>{row.user?.firstName} {row.user?.lastName} ({row.user?.phoneNumber})</strong> 
    },
    { 
      header: 'Trajet', 
      accessor: (row) => `${row.bus?.trip?.departure} ⇄ ${row.bus?.trip?.destination}` 
    },
    { 
      header: 'Date', 
      accessor: (row) => new Date(row.bus?.trip?.date).toLocaleDateString('fr-FR')
    },
    { 
      header: 'Montant', 
      accessor: (row) => `${row.bus?.trip?.price} FCFA` 
    },
    { 
      header: 'Statut', 
      accessor: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
          <span className={`badge ${
            row.status === 'PAID' ? 'badge-success' : 
            row.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
          }`}>
            {row.status === 'PAID' ? 'Payé' : row.status === 'PENDING' ? 'En attente' : 'Annulé'}
          </span>
          {row.paymentProofUrl && (
            <button 
              onClick={() => {
                const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
                window.open(`${baseUrl}${row.paymentProofUrl}`, '_blank');
              }}
              style={{ fontSize: '0.7rem', color: '#1E4ED8', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              Voir preuve
            </button>
          )}
        </div>
      ) 
    },
    { 
      header: 'Actions', 
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.status === 'PENDING' && (
            <button 
              className="bts-button bts-button-primary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minHeight: 'auto', borderRadius: '4px' }}
              onClick={() => handleStatusChange(row.id, 'PAID')}
            >
              Valider
            </button>
          )}
          {row.status !== 'CANCELLED' && (
            <button 
              className="bts-button bts-button-danger" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minHeight: 'auto', borderRadius: '4px', backgroundColor: 'var(--color-danger)' }}
              onClick={() => {
                if(window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
                  handleStatusChange(row.id, 'CANCELLED');
                }
              }}
            >
              Annuler
            </button>
          )}
        </div>
      ) 
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>Gestion des Réservations</h2>
          <p style={{ color: 'var(--color-gray-disabled)', marginTop: '0.25rem' }}>Consultez toutes les réservations des clients</p>
        </div>
        <Button variant="secondary">
          <Download size={18} style={{ marginRight: '8px' }} />
          Exporter
        </Button>
      </div>

      {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

      <div className="card">
        {/* Filtres par statut */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-gray-border)' }}>
          <button 
            className={`bts-button ${statusFilter === 'ALL' ? 'bts-button-primary' : 'bts-button-ghost'}`}
            onClick={() => setStatusFilter('ALL')}
            style={{ borderRadius: '20px', minHeight: '36px', padding: '0.5rem 1.5rem' }}
          >Toutes</button>
          <button 
            className={`bts-button ${statusFilter === 'PAID' ? 'bts-button-primary' : 'bts-button-ghost'}`}
            onClick={() => setStatusFilter('PAID')}
            style={{ borderRadius: '20px', minHeight: '36px', padding: '0.5rem 1.5rem' }}
          >Payées</button>
          <button 
            className={`bts-button ${statusFilter === 'PENDING' ? 'bts-button-primary' : 'bts-button-ghost'}`}
            onClick={() => setStatusFilter('PENDING')}
            style={{ borderRadius: '20px', minHeight: '36px', padding: '0.5rem 1.5rem' }}
          >En attente</button>
          <button 
            className={`bts-button ${statusFilter === 'CANCELLED' ? 'bts-button-primary' : 'bts-button-ghost'}`}
            onClick={() => setStatusFilter('CANCELLED')}
            style={{ borderRadius: '20px', minHeight: '36px', padding: '0.5rem 1.5rem' }}
          >Annulées</button>
        </div>

        <div className="table-actions" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-disabled)' }} />
            <input 
              type="text" 
              placeholder="Rechercher une réservation (nom, téléphone)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-gray-border)', outline: 'none' }}
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bts-input"
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--color-gray-border)', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}
          >
            <option value="DATE_DESC">Trier par date (Plus récent)</option>
            <option value="DATE_ASC">Trier par date (Plus ancien)</option>
            <option value="TRIP_ASC">Trier par trajet (A-Z)</option>
          </select>
        </div>

        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement en cours...</p>
        ) : (
          (() => {
            const filteredAndSortedData = reservations.filter(res => {
              const matchesFilter = statusFilter === 'ALL' || res.status === statusFilter;
              const searchTerm = searchQuery.toLowerCase();
              const matchesSearch = 
                (res.user?.firstName || '').toLowerCase().includes(searchTerm) ||
                (res.user?.lastName || '').toLowerCase().includes(searchTerm) ||
                (res.user?.phoneNumber || '').includes(searchTerm);
              return matchesFilter && matchesSearch;
            }).sort((a, b) => {
              if (sortBy === 'DATE_DESC') {
                return new Date(b.bus?.trip?.date || 0).getTime() - new Date(a.bus?.trip?.date || 0).getTime();
              }
              if (sortBy === 'DATE_ASC') {
                return new Date(a.bus?.trip?.date || 0).getTime() - new Date(b.bus?.trip?.date || 0).getTime();
              }
              if (sortBy === 'TRIP_ASC') {
                const tripA = `${a.bus?.trip?.departure} ${a.bus?.trip?.destination}`;
                const tripB = `${b.bus?.trip?.departure} ${b.bus?.trip?.destination}`;
                return tripA.localeCompare(tripB);
              }
              return 0;
            });

            const groupedData = filteredAndSortedData.reduce((acc, res) => {
              const dateStr = res.bus?.trip?.date ? new Date(res.bus?.trip?.date).toLocaleDateString('fr-FR') : 'Inconnue';
              const tripKey = `${res.bus?.trip?.departure || 'Inconnu'} ⇄ ${res.bus?.trip?.destination || 'Inconnu'} - ${dateStr}`;
              if (!acc[tripKey]) acc[tripKey] = [];
              acc[tripKey].push(res);
              return acc;
            }, {} as Record<string, Reservation[]>);

            return (
              <div>
                {Object.entries(groupedData).map(([tripKey, groupReservations]) => (
                  <div key={tripKey} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-gray-bg)', borderTop: '1px solid var(--color-gray-border)', borderBottom: '1px solid var(--color-gray-border)', margin: 0, fontSize: '1rem', color: 'var(--color-black)' }}>
                      {tripKey} ({groupReservations.length} réservation{groupReservations.length > 1 ? 's' : ''})
                    </h3>
                    <DataTable columns={columns} data={groupReservations} keyField="id" />
                  </div>
                ))}
                {Object.keys(groupedData).length === 0 && (
                  <p style={{ padding: '2rem', textAlign: 'center' }}>Aucune réservation trouvée.</p>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default ReservationsManagementPage;

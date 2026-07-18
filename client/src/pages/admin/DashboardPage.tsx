import React, { useState, useEffect } from 'react';
import { Eye, CreditCard, Users, Download, Bell, Check } from 'lucide-react';
import { StatsCard } from '../../components/admin/StatsCard';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { Input } from '../../components/shared/Input';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DashboardPage.css';

interface Reservation {
  id: string;
  client: string;
  trip: string;
  amount: string;
  status: 'Payé' | 'En attente' | 'Annulé';
}

const DashboardPage: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterTripId, setFilterTripId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRes, setSelectedRes] = useState<any | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    // Fetch trips for filter
    apiFetch('/trips').then(data => setTrips(data.trips)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        let url = '/reservations/all?';
        if (filterDate) url += `date=${filterDate}&`;
        if (filterTripId) url += `tripId=${filterTripId}&`;
        
        const data = await apiFetch(url);
        setReservations(data.reservations);
        setErrorMsg('');
      } catch (error: any) {
        console.error(error);
        setErrorMsg(error.message || "Impossible de récupérer les réservations.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReservations();
  }, [filterDate, filterTripId]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiFetch('/notifications');
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate real metrics
  const totalRevenue = reservations
    .filter(r => r.status === 'PAID')
    .reduce((sum, r) => sum + Number(r.bus.trip.price), 0);
  
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(11, 110, 46); // BTS Green
    doc.text('BAOL TRANS SERVICES (BTS)', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Liste des Réservations', 14, 30);
    
    if (filterDate) {
      doc.setFontSize(10);
      doc.text(`Date filtrée: ${filterDate}`, 14, 38);
    }

    const tableColumn = ["ID", "Client", "Trajet", "Date", "Siège", "Montant"];
    const tableRows: any[] = [];

    const paidReservations = reservations.filter(r => r.status === 'PAID');
    paidReservations.forEach(r => {
      const rowData = [
        r.id.split('-')[0],
        r.user.phoneNumber,
        `${r.bus.trip.departure} -> ${r.bus.trip.destination}`,
        new Date(r.bus.trip.date).toLocaleDateString('fr-FR'),
        r.seatNumber.toString(),
        `${r.bus.trip.price} FCFA`
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: filterDate ? 42 : 36,
      theme: 'grid',
      headStyles: { fillColor: [11, 110, 46] }, // BTS Green header
    });

    doc.save('bts_reservations.pdf');
  };

  const metrics = [
    { title: 'Revenus (Filtre)', value: `${totalRevenue} FCFA`, icon: <CreditCard size={24} />, color: 'primary' as const },
    { title: 'Réservations (Filtre)', value: reservations.length.toString(), icon: <Users size={24} />, color: 'secondary' as const },
  ];

  const columns: Column<any>[] = [
    { header: 'ID Réservation', accessor: (row) => row.id.split('-')[0], sortAccessor: (row) => row.id },
    { header: 'Client', accessor: (row) => row.user.phoneNumber },
    { header: 'Trajet', accessor: (row) => `${row.bus.trip.departure} → ${row.bus.trip.destination}` },
    { header: 'Date', accessor: (row) => new Date(row.bus.trip.date).toLocaleDateString('fr-FR'), sortAccessor: (row) => new Date(row.bus.trip.date).getTime() },
    { header: 'Montant', accessor: (row) => `${row.bus.trip.price} FCFA`, sortAccessor: (row) => Number(row.bus.trip.price) },
    { 
      header: 'Statut', 
      accessor: (row) => {
        let badgeClass = 'badge-warning';
        let statusText = 'En attente';
        if (row.status === 'PAID') { badgeClass = 'badge-success'; statusText = 'Payé'; }
        if (row.status === 'CANCELLED') { badgeClass = 'badge-danger'; statusText = 'Annulé'; }
        return <span className={`badge ${badgeClass}`}>{statusText}</span>;
      },
      sortAccessor: (row) => row.status
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Tableau de bord</h2>
          <p style={{ color: 'var(--color-gray-disabled)', marginTop: '0.25rem' }}>Aperçu des performances d'aujourd'hui</p>
        </div>
        
        <div className="notification-wrapper">
          <button className="icon-btn notification-btn" onClick={() => setShowNotifMenu(!showNotifMenu)}>
            <Bell size={24} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifMenu && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="btn-text" onClick={markAllAsRead}>Tout marquer comme lu</button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">Aucune notification</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                    >
                      <div className="notification-content">
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <span className="notification-time">{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                      {!notif.isRead && <div className="unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <StatsCard key={index} {...metric} />
        ))}
      </div>

      <div className="dashboard-content">
        <div className="card">
          <div className="card-header dashboard-table-header">
            <h3>Réservations {isLoading && <small>(chargement...)</small>}</h3>
            
            <div className="dashboard-filters">
              <button className="btn btn-secondary export-btn" onClick={generatePDF}>
                <Download size={18} />
                <span>Exporter PDF</span>
              </button>
              
              <div className="filter-input-wrapper">
                <Input 
                  id="dateFilter"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{ margin: 0 }}
                />
              </div>
              
              <div className="filter-input-wrapper">
                <select
                  id="tripFilter"
                  value={filterTripId}
                  onChange={(e) => setFilterTripId(e.target.value)}
                  className="input-field"
                  style={{ margin: 0 }}
                >
                  <option value="">Tous les trajets</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{`${t.departure} → ${t.destination}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderBottom: '1px solid #fecaca' }}>
              <strong>Erreur : </strong> {errorMsg}
            </div>
          )}

          <DataTable 
            columns={columns} 
            data={reservations} 
            keyField="id" 
            actions={(row) => (
              <button className="icon-btn" title="Voir les détails" style={{ color: 'var(--color-info)' }} onClick={() => setSelectedRes(row)}>
                <Eye size={18} />
              </button>
            )}
          />
        </div>
      </div>

      <Modal
        isOpen={!!selectedRes}
        onClose={() => setSelectedRes(null)}
        title="Détails de la réservation"
      >
        {selectedRes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-gray-text)' }}>Informations Client</h4>
              <p style={{ margin: 0 }}><strong>Téléphone :</strong> {selectedRes.user.phoneNumber}</p>
            </div>
            
            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-gray-text)' }}>Trajet</h4>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Ligne :</strong> {selectedRes.bus.trip.departure} → {selectedRes.bus.trip.destination}</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Date :</strong> {new Date(selectedRes.bus.trip.date).toLocaleDateString('fr-FR')}</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Heure :</strong> {selectedRes.bus.trip.departureTime}</p>
              <p style={{ margin: 0 }}><strong>Lieu d'embarquement :</strong> {selectedRes.boardingPoint}</p>
            </div>

            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-gray-text)' }}>Détails Billet</h4>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Siège :</strong> N° {selectedRes.seatNumber}</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Montant Payé :</strong> {selectedRes.bus.trip.price} FCFA</p>
              <p style={{ margin: 0 }}><strong>Code Billet :</strong> {selectedRes.ticket?.ticketCode || 'Non généré'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;

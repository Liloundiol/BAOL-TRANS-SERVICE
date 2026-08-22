import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { apiFetch } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminPages.css';

interface FinanceStats {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  transactionsCount: number;
}

interface Payment {
  id: string;
  waveTransactionId: string;
  amount: string;
  status: string;
  paidAt: string;
  reservation?: {
    user: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string;
    };
    bus: {
      trip: {
        departure: string;
        destination: string;
      };
    };
  };
  package?: {
    sender: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string;
    };
    trip: {
      departure: string;
      destination: string;
    };
  };
}

const FinanceManagementPage: React.FC = () => {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const [statsData, paymentsData] = await Promise.all([
          apiFetch('/finance/stats'),
          apiFetch('/finance/payments')
        ]);
        setStats(statsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Erreur lors du chargement des finances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(Number(amount));
  };

  const handleExport = () => {
    if (payments.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    const doc = new jsPDF();
    doc.text("Rapport des Finances - BTS", 14, 15);

    const tableData = payments.map(p => {
      const date = new Date(p.paidAt).toLocaleString('fr-FR');
      const waveId = p.waveTransactionId || '';
      let name = '';
      let phone = '';
      let type = '';
      let trip = '';
      
      if (p.reservation) {
        type = 'Reservation';
        name = `${p.reservation.user.firstName || ''} ${p.reservation.user.lastName || ''}`.trim() || 'N/A';
        phone = p.reservation.user.phoneNumber || '';
        trip = `${p.reservation.bus.trip.departure} - ${p.reservation.bus.trip.destination}`;
      } else if (p.package) {
        type = 'Colis';
        name = `${p.package.sender.firstName || ''} ${p.package.sender.lastName || ''}`.trim() || 'N/A';
        phone = p.package.sender.phoneNumber || '';
        trip = `${p.package.trip.departure} - ${p.package.trip.destination}`;
      }
      
      const amount = p.amount;
      const status = p.status === 'COMPLETED' ? 'Payé' : p.status;
      
      return [date, waveId, name, phone, type, trip, amount, status];
    });

    autoTable(doc, {
      head: [['Date', 'ID Wave', 'Client', 'Téléphone', 'Type', 'Trajet', 'Montant', 'Statut']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [11, 110, 46] }
    });

    doc.save(`rapport_finances_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const columns: Column<Payment>[] = [
    { 
      header: 'Date', 
      accessor: (row) => new Date(row.paidAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
    },
    { 
      header: 'ID Wave', 
      accessor: (row) => <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{row.waveTransactionId}</span> 
    },
    { 
      header: 'Passager', 
      accessor: (row) => {
        if (row.reservation) {
          const { firstName, lastName, phoneNumber } = row.reservation.user;
          const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : phoneNumber;
          return <strong>{name}</strong>;
        }
        if (row.package) {
          const { firstName, lastName, phoneNumber } = row.package.sender;
          const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : phoneNumber;
          return <strong>{name} <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginLeft: '0.25rem' }}>COLIS</span></strong>;
        }
        return <span style={{ color: 'var(--color-gray-disabled)' }}>N/A</span>;
      }
    },
    { 
      header: 'Trajet', 
      accessor: (row) => {
        if (row.reservation) return `${row.reservation.bus.trip.departure} ➔ ${row.reservation.bus.trip.destination}`;
        if (row.package) return `${row.package.trip.departure} ➔ ${row.package.trip.destination}`;
        return <span style={{ color: 'var(--color-gray-disabled)' }}>N/A</span>;
      }
    },
    { 
      header: 'Montant', 
      accessor: (row) => <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(row.amount)}</strong> 
    },
    { 
      header: 'Statut', 
      accessor: (row) => (
        <span className={`badge ${row.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
          {row.status === 'COMPLETED' ? 'Payé' : row.status}
        </span>
      ) 
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>Gestion des Finances</h2>
          <p style={{ color: 'var(--color-gray-disabled)', marginTop: '0.25rem' }}>Aperçu des revenus et paiements Wave</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Exporter (PDF)
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-disabled)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p>Chargement des données financières...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="stat-card card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', padding: '1rem', borderRadius: '12px' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--color-gray-disabled)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Revenu du Jour</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{formatCurrency(stats?.todayRevenue || 0)}</h3>
              </div>
            </div>
            
            <div className="stat-card card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={{ backgroundColor: '#DCFCE7', color: 'var(--color-primary)', padding: '1rem', borderRadius: '12px' }}>
                <Calendar size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--color-gray-disabled)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Revenu du Mois</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{formatCurrency(stats?.monthRevenue || 0)}</h3>
              </div>
            </div>

            <div className="stat-card card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={{ backgroundColor: '#FEF9C3', color: '#CA8A04', padding: '1rem', borderRadius: '12px' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--color-gray-disabled)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Revenu Total</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{formatCurrency(stats?.totalRevenue || 0)}</h3>
              </div>
            </div>

            <div className="stat-card card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '1rem', borderRadius: '12px' }}>
                <Activity size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--color-gray-disabled)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Transactions</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats?.transactionsCount || 0}</h3>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-border)' }}>
              <h3 style={{ margin: 0 }}>Historique des Transactions (100 dernières)</h3>
            </div>
            <DataTable 
              columns={columns} 
              data={payments} 
              keyField="id" 
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceManagementPage;

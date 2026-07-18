import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { apiFetch } from '../../services/api';
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
        if (!row.reservation) return <span style={{ color: 'var(--color-gray-disabled)' }}>N/A</span>;
        const { firstName, lastName, phoneNumber } = row.reservation.user;
        const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : phoneNumber;
        return <strong>{name}</strong>;
      }
    },
    { 
      header: 'Trajet', 
      accessor: (row) => {
        if (!row.reservation) return <span style={{ color: 'var(--color-gray-disabled)' }}>N/A</span>;
        return `${row.reservation.bus.trip.departure} ➔ ${row.reservation.bus.trip.destination}`;
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
        <Button variant="secondary">
          <Download size={18} style={{ marginRight: '8px' }} />
          Exporter le rapport
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

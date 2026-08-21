import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export const ComplaintsManagementPage: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/complaints');
      if (response.success) {
        setComplaints(response.complaints);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await apiFetch(`/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (response.success) {
        fetchComplaints();
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const columns: Column<any>[] = [
    { header: 'Client', accessor: (row) => `${row.user.firstName || ''} ${row.user.lastName || ''} (${row.user.phoneNumber})` },
    { header: 'Sujet', accessor: 'subject' },
    { header: 'Message', accessor: 'message' },
    { header: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString('fr-FR'), sortAccessor: (row) => new Date(row.createdAt).getTime() },
    { 
      header: 'Statut', 
      accessor: (row) => {
        if (row.status === 'RESOLVED') return <span className="badge badge-success">Résolu</span>;
        if (row.status === 'IN_PROGRESS') return <span className="badge" style={{ backgroundColor: '#1E4ED8', color: 'white' }}>Prise en compte</span>;
        return <span className="badge badge-warning">En attente</span>;
      },
      sortAccessor: (row) => row.status
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gestion des Réclamations</h2>
          <p style={{ color: 'var(--color-gray-disabled)' }}>Consultez et traitez les réclamations des clients concernant leurs colis.</p>
        </div>
      </div>

      <div className="card">
        <DataTable 
          columns={columns} 
          data={complaints} 
          keyField="id" 
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {row.status === 'PENDING' && (
                <>
                  <button 
                    className="icon-btn" 
                    title="Prendre en compte" 
                    style={{ color: '#1E4ED8' }} 
                    onClick={() => updateStatus(row.id, 'IN_PROGRESS')}
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button 
                    className="icon-btn" 
                    title="Marquer comme résolu" 
                    style={{ color: 'var(--color-success)' }} 
                    onClick={() => updateStatus(row.id, 'RESOLVED')}
                  >
                    <CheckCircle size={18} fill="currentColor" color="white" />
                  </button>
                </>
              )}
              {row.status === 'IN_PROGRESS' && (
                <button 
                  className="icon-btn" 
                  title="Marquer comme résolu" 
                  style={{ color: 'var(--color-success)' }} 
                  onClick={() => updateStatus(row.id, 'RESOLVED')}
                >
                  <CheckCircle size={18} />
                </button>
              )}
              {row.status === 'RESOLVED' && (
                <button 
                  className="icon-btn" 
                  title="Rouvrir la réclamation" 
                  style={{ color: 'var(--color-warning)' }} 
                  onClick={() => updateStatus(row.id, 'PENDING')}
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ComplaintsManagementPage;

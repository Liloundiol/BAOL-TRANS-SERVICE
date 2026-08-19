import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';

interface Review {
  id: string;
  rating: number;
  comment: string;
  isPublished: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

const ReviewsManagementPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/reviews/admin');
      if (data.success) {
        setReviews(data.reviews);
      } else {
        setError(data.message || 'Erreur lors du chargement des avis');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des avis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      const data = await apiFetch(`/reviews/${id}/publish`, { method: 'PATCH' });
      if (data.success) {
        setReviews(reviews.map(r => r.id === id ? { ...r, isPublished: true } : r));
      } else {
        alert(data.message || 'Erreur lors de la publication');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la publication');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    try {
      const data = await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
      if (data.success) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        alert(data.message || 'Erreur lors de la suppression');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return <div className="page-loading">Chargement des avis...</div>;
  }

  const columns: Column<Review>[] = [
    { 
      header: 'Date', 
      accessor: (row) => new Date(row.createdAt).toLocaleDateString('fr-FR') 
    },
    { 
      header: 'Client', 
      accessor: (row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim() 
    },
    { 
      header: 'Note', 
      accessor: (row) => (
        <div className="d-flex align-items-center" style={{ gap: '0.2rem', color: '#F4C430' }}>
          {row.rating} <Star size={14} fill="#F4C430" />
        </div>
      ) 
    },
    { 
      header: 'Commentaire', 
      accessor: (row) => (
        <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.comment}>
          <MessageSquare size={14} className="mr-2" style={{ marginRight: '8px', color: '#94A3B8' }} />
          {row.comment}
        </div>
      ) 
    },
    { 
      header: 'Statut', 
      accessor: (row) => (
        row.isPublished ? (
          <span className="status-badge status-success">Publié</span>
        ) : (
          <span className="status-badge status-warning">En attente</span>
        )
      ) 
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Gestion des Avis Clients</h2>
          <p className="admin-page-description">Modérez les avis laissés par les clients avant publication.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <DataTable 
          columns={columns} 
          data={reviews} 
          keyField="id" 
          emptyMessage="Aucun avis à modérer."
          actions={(row) => (
            <>
              {!row.isPublished && (
                <button 
                  className="icon-btn text-success" 
                  title="Publier" 
                  onClick={() => handlePublish(row.id)}
                  style={{ color: '#2FAE61' }}
                >
                  <CheckCircle size={18} />
                </button>
              )}
              <button 
                className="icon-btn text-danger" 
                title="Supprimer" 
                onClick={() => handleDelete(row.id)}
                style={{ color: '#EF4444' }}
              >
                <XCircle size={18} />
              </button>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default ReviewsManagementPage;

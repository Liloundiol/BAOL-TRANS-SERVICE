import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import { apiFetch } from '../../services/api';
import '../../components/admin/DataTable.css';

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
        // Update local state
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
        // Remove from local state
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
        <div className="datatable-container">
          <table className="datatable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Note</th>
                <th>Commentaire</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucun avis à modérer.</td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id}>
                    <td>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>{review.user?.firstName} {review.user?.lastName}</td>
                    <td>
                      <div className="d-flex align-items-center" style={{ gap: '0.2rem', color: '#F4C430' }}>
                        {review.rating} <Star size={14} fill="#F4C430" />
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={review.comment}>
                        <MessageSquare size={14} className="mr-2" style={{ marginRight: '8px', color: '#94A3B8' }} />
                        {review.comment}
                      </div>
                    </td>
                    <td>
                      {review.isPublished ? (
                        <span className="status-badge status-success">Publié</span>
                      ) : (
                        <span className="status-badge status-warning">En attente</span>
                      )}
                    </td>
                    <td>
                      <div className="datatable-actions">
                        {!review.isPublished && (
                          <button 
                            className="btn-icon text-success" 
                            title="Publier" 
                            onClick={() => handlePublish(review.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2FAE61' }}
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}
                        <button 
                          className="btn-icon text-danger" 
                          title="Supprimer" 
                          onClick={() => handleDelete(review.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewsManagementPage;

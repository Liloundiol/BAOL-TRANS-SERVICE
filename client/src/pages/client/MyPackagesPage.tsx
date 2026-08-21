import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Package, ArrowRight } from 'lucide-react';
import './MyPackagesPage.css';

interface PackageType {
  id: string;
  receiverName: string;
  receiverPhone: string;
  description: string;
  weight: number;
  price: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  trip?: {
    departure: string;
    destination: string;
    date: string;
  };
  complaints?: { id: string; subject: string; message: string; status: string; createdAt: string }[];
}

import { useNavigate } from 'react-router-dom';

const MyPackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Complaint state
  const [selectedPackageForComplaint, setSelectedPackageForComplaint] = useState<string | null>(null);
  const [complaintSubject, setComplaintSubject] = useState('Colis non reçu');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintError, setComplaintError] = useState('');

  const navigate = useNavigate();

  const openComplaintModal = (packageId: string) => {
    setSelectedPackageForComplaint(packageId);
    setComplaintSubject('Colis non reçu');
    setComplaintMessage('');
    setComplaintError('');
  };

  const submitComplaint = async () => {
    if (!selectedPackageForComplaint) return;
    setIsSubmittingComplaint(true);
    setComplaintError('');

    try {
      const response = await apiFetch('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          packageId: selectedPackageForComplaint,
          subject: complaintSubject,
          message: complaintMessage
        })
      });

      if (response.success) {
        alert('Votre réclamation a bien été envoyée. Nous vous contacterons bientôt.');
        setSelectedPackageForComplaint(null);
      } else {
        setComplaintError(response.message || 'Erreur lors de l\'envoi de la réclamation.');
      }
    } catch (err) {
      setComplaintError('Une erreur réseau est survenue.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await apiFetch('/packages');
        if (response.success && response.packages) {
          setPackages(response.packages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="pkg-status pending">En attente</span>;
      case 'IN_TRANSIT': return <span className="pkg-status transit">En transit</span>;
      case 'DELIVERED': return <span className="pkg-status delivered">Livré</span>;
      case 'CANCELLED': return <span className="pkg-status cancelled">Annulé</span>;
      default: return <span className="pkg-status">{status}</span>;
    }
  };

  return (
    <div className="my-packages-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Package size={32} className="header-icon" />
          <h2>Mes Colis Envoyés</h2>
        </div>
        <button 
          onClick={() => navigate('/send-package')} 
          style={{ background: 'var(--color-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Envoyer un colis
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Chargement de vos colis...</div>
      ) : packages.length === 0 ? (
        <div className="empty-state">
          <Package size={48} className="empty-icon" />
          <h3>Aucun colis envoyé</h3>
          <p>Vous n'avez pas encore envoyé de colis avec nous.</p>
        </div>
      ) : (
        <div className="packages-list">
          {packages.map(pkg => (
            <div key={pkg.id} className="package-card">
              <div className="pkg-header">
                <span className="pkg-date">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</span>
                {getStatusBadge(pkg.status)}
              </div>
              <div className="pkg-route">
                {pkg.trip ? (
                  <>
                    <span>{pkg.trip.departure}</span>
                    <ArrowRight size={16} />
                    <span>{pkg.trip.destination}</span>
                  </>
                ) : (
                  <span>Trajet inconnu</span>
                )}
              </div>
              <div className="pkg-details">
                <div className="detail-group">
                  <label>Destinataire</label>
                  <p>{pkg.receiverName}</p>
                  <p className="phone">{pkg.receiverPhone}</p>
                </div>
                <div className="detail-group">
                  <label>Contenu</label>
                  <p>{pkg.description}</p>
                  <p className="weight">{pkg.weight} kg</p>
                </div>
                <div className="detail-group price-group">
                  <label>Prix Payé</label>
                  <p className="price">{pkg.price} FCFA</p>
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pkg.complaints && pkg.complaints.length > 0 && (
                  <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#374151' }}>Vos réclamations :</p>
                    {pkg.complaints.map((complaint: any) => (
                      <div key={complaint.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>{complaint.subject}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '4px', 
                          background: complaint.status === 'RESOLVED' ? '#d1fae5' : complaint.status === 'IN_PROGRESS' ? '#dbeafe' : '#fef3c7',
                          color: complaint.status === 'RESOLVED' ? '#065f46' : complaint.status === 'IN_PROGRESS' ? '#1e40af' : '#92400e'
                        }}>
                          {complaint.status === 'RESOLVED' ? 'Résolu' : complaint.status === 'IN_PROGRESS' ? 'Prise en compte' : 'En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => openComplaintModal(pkg.id)}
                    style={{ background: 'none', color: '#B91C1C', border: '1px solid #B91C1C', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                  >
                    Signaler un problème
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Modal */}
      {selectedPackageForComplaint && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1F1F1F' }}>Signaler un problème avec votre colis</h3>
            {complaintError && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{complaintError}</div>}
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Sujet de la réclamation</label>
              <select 
                value={complaintSubject} 
                onChange={(e) => setComplaintSubject(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
              >
                <option value="Colis non reçu">Je n'ai pas reçu mon colis</option>
                <option value="Colis endommagé">Mon colis est endommagé</option>
                <option value="Retard de livraison">Retard de livraison</option>
                <option value="Autre problème">Autre problème</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Détails (Optionnel)</label>
              <textarea 
                value={complaintMessage} 
                onChange={(e) => setComplaintMessage(e.target.value)}
                placeholder="Précisez votre problème..."
                rows={4}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', resize: 'vertical' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedPackageForComplaint(null)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 500 }}
              >
                Annuler
              </button>
              <button 
                onClick={submitComplaint}
                disabled={isSubmittingComplaint}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#0B6E2E', color: 'white', cursor: 'pointer', fontWeight: 500, opacity: isSubmittingComplaint ? 0.7 : 1 }}
              >
                {isSubmittingComplaint ? 'Envoi...' : 'Envoyer la réclamation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPackagesPage;

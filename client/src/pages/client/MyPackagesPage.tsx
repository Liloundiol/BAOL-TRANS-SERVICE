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
}

import { useNavigate } from 'react-router-dom';

const MyPackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPackagesPage;

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package as PackageIcon, MessageSquare } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { Modal } from '../../components/shared/Modal';
import { apiFetch } from '../../services/api';
import './AdminPages.css';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface Trip {
  id: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
}

interface Package {
  id: string;
  senderId: string;
  tripId: string;
  receiverPhone: string;
  receiverName: string;
  description: string;
  weight: number;
  price: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  sender?: User;
  trip?: Trip;
}

const PackagesManagementPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

  // Form state
  const [senderId, setSenderId] = useState('');
  const [tripId, setTripId] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'>('PENDING');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      const [packagesData, tripsData, usersData] = await Promise.all([
        apiFetch('/packages'),
        apiFetch('/trips'),
        apiFetch('/users')
      ]);
      setPackages(packagesData.packages || []);
      setTrips(tripsData.trips || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setSenderId('');
    setTripId('');
    setReceiverPhone('');
    setReceiverName('');
    setDescription('');
    setWeight('');
    setPrice('');
    setStatus('PENDING');
    setEditingPackageId(null);
    setFormError('');
  };

  const handleOpenModal = (pkg?: Package) => {
    resetForm();
    if (pkg) {
      setEditingPackageId(pkg.id);
      setSenderId(pkg.senderId);
      setTripId(pkg.tripId);
      setReceiverPhone(pkg.receiverPhone);
      setReceiverName(pkg.receiverName);
      setDescription(pkg.description);
      setWeight(pkg.weight.toString());
      setPrice(pkg.price.toString());
      setStatus(pkg.status);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const payload = {
        senderId,
        tripId,
        receiverPhone,
        receiverName,
        description,
        weight: parseFloat(weight),
        price: parseFloat(price)
      };

      if (editingPackageId) {
        // Just update status for now, or update full package if needed
        await apiFetch(`/packages/${editingPackageId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      } else {
        await apiFetch('/packages', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      setFormError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPackageId) return;
    try {
      await apiFetch(`/packages/${deletingPackageId}`, { method: 'DELETE' });
      setDeletingPackageId(null);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/packages/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.receiverPhone.includes(searchQuery) ||
    pkg.sender?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.sender?.phoneNumber.includes(searchQuery)
  );

  const columns: Column<Package>[] = [
    {
      header: 'Date',
      accessor: (pkg) => new Date(pkg.createdAt).toLocaleDateString('fr-FR')
    },
    {
      header: 'Expéditeur',
      accessor: (pkg) => pkg.sender ? `${pkg.sender.firstName} ${pkg.sender.lastName} (${pkg.sender.phoneNumber})` : 'N/A'
    },
    {
      header: 'Destinataire',
      accessor: (pkg) => `${pkg.receiverName} (${pkg.receiverPhone})`
    },
    {
      header: 'Description',
      accessor: (pkg) => `${pkg.description} (${pkg.weight} kg)`
    },
    {
      header: 'Trajet',
      accessor: (pkg) => pkg.trip ? `${pkg.trip.departure} - ${pkg.trip.destination}` : 'N/A'
    },
    {
      header: 'Prix',
      accessor: (pkg) => `${pkg.price} FCFA`
    },
    {
      header: 'Statut',
      accessor: (pkg) => (
        <select 
          value={pkg.status}
          onChange={(e) => handleStatusChange(pkg.id, e.target.value)}
          className={`status-badge status-${pkg.status.toLowerCase()}`}
          style={{ border: 'none', background: 'transparent', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <option value="PENDING">En attente</option>
          <option value="IN_TRANSIT">En transit</option>
          <option value="DELIVERED">Livré</option>
          <option value="CANCELLED">Annulé</option>
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: (pkg) => (
        <div className="action-buttons">
          <button className="action-btn edit" onClick={() => handleOpenModal(pkg)}>
            <Edit2 size={16} />
          </button>
          <button className="action-btn delete" onClick={() => setDeletingPackageId(pkg.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-title">
          <PackageIcon size={24} className="header-icon" />
          <h2>Gestion des Colis</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={() => window.location.href = '/admin/complaints'} className="btn-secondary" style={{ background: '#fef3c7', color: '#92400e', border: 'none' }}>
            <MessageSquare size={20} style={{ marginRight: '0.5rem' }} />
            <span>Voir les Réclamations</span>
          </Button>
          <Button onClick={() => handleOpenModal()} className="add-btn">
            <Plus size={20} />
            <span>Nouveau Colis</span>
          </Button>
        </div>
      </div>

      <div className="page-controls">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou numéro..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <DataTable 
          columns={columns} 
          data={filteredPackages} 
          keyField="id"
          emptyMessage="Aucun colis trouvé"
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingPackageId ? "Modifier le Colis" : "Enregistrer un Colis"}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          {formError && <div className="form-error-alert">{formError}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>Expéditeur (Client)</label>
              <select 
                value={senderId} 
                onChange={(e) => setSenderId(e.target.value)} 
                required 
                className="input-field"
              >
                <option value="">Sélectionner un expéditeur</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.phoneNumber})</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Trajet d'expédition</label>
              <select 
                value={tripId} 
                onChange={(e) => setTripId(e.target.value)} 
                required 
                className="input-field"
              >
                <option value="">Sélectionner un trajet</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.departure} - {t.destination} ({new Date(t.date).toLocaleDateString('fr-FR')} à {t.time})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <Input 
              label="Nom du Destinataire" 
              id="receiverName" 
              value={receiverName} 
              onChange={(e) => setReceiverName(e.target.value)} 
              required 
            />
            <Input 
              label="Téléphone du Destinataire" 
              id="receiverPhone" 
              value={receiverPhone} 
              onChange={(e) => setReceiverPhone(e.target.value)} 
              required 
            />
          </div>

          <Input 
            label="Description du Colis" 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            placeholder="Ex: Ordinateur portable, Documents..."
          />

          <div className="form-row">
            <Input 
              label="Poids (kg)" 
              id="weight" 
              type="number"
              step="0.1"
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              required 
            />
            <Input 
              label="Prix (FCFA)" 
              id="price" 
              type="number"
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
            />
          </div>

          {editingPackageId && (
            <div className="form-group">
              <label>Statut</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)} 
                className="input-field"
              >
                <option value="PENDING">En attente</option>
                <option value="IN_TRANSIT">En transit</option>
                <option value="DELIVERED">Livré</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingPackageId ? 'Enregistrer les modifications' : 'Créer le colis'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!deletingPackageId} 
        onClose={() => setDeletingPackageId(null)}
        title="Confirmer la suppression"
      >
        <div className="delete-confirmation">
          <p>Êtes-vous sûr de vouloir supprimer ce colis ? Cette action est irréversible.</p>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setDeletingPackageId(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PackagesManagementPage;

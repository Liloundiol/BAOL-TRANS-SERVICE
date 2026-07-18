import React, { useState, useEffect } from 'react';
import { Shield, Edit2, Trash2, Search, X } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Select } from '../../components/shared/Select';
import { DataTable } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { apiFetch } from '../../services/api';
import './AdminPages.css';

interface User {
  id: string;
  phoneNumber: string;
  role: 'STUDENT' | 'ADMIN' | 'AGENT' | 'CONTROLLER';
  email?: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
}

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        phoneNumber: user.phoneNumber || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        phoneNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'AGENT' // Default to AGENT when creating personnel
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingUser) {
        await apiFetch(`/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      handleCloseModal();
      await fetchUsers(); // Refresh the list
    } catch (error) {
      alert("Erreur: " + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return;
    }
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      await fetchUsers();
    } catch (error) {
      alert("Erreur lors de la suppression: " + (error as Error).message);
    }
  };

  const filteredUsers = users.filter((u) => {
    // Ne montrer que le personnel (exclure les étudiants/clients)
    if (u.role === 'STUDENT') return false;

    // Search query filter
    const lowerQuery = searchQuery.toLowerCase();
    const phoneMatches = u.phoneNumber?.includes(searchQuery);
    const roleMatches = u.role?.toLowerCase().includes(lowerQuery);
    const emailMatches = u.email?.toLowerCase().includes(lowerQuery);
    const nameMatches = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(lowerQuery);
    return phoneMatches || roleMatches || emailMatches || nameMatches;
  });

  const columns: Column<User>[] = [
    { header: 'Téléphone', accessor: (row) => <strong>{row.phoneNumber}</strong> },
    { header: 'Nom', accessor: (row) => row.firstName || row.lastName ? `${row.firstName || ''} ${row.lastName || ''}`.trim() : <span style={{ color: 'var(--color-gray-disabled)' }}>-</span> },
    { header: 'Email', accessor: (row) => row.email || <span style={{ color: 'var(--color-gray-disabled)' }}>Non renseigné</span> },
    { 
      header: 'Rôle', 
      accessor: (row) => (
        <span className={`badge ${
          row.role === 'ADMIN' ? 'badge-warning' : 
          row.role === 'STUDENT' ? 'badge-success' : 'badge-info'
        }`}>
          {row.role}
        </span>
      ) 
    },
    { 
      header: "Date d'inscription", 
      accessor: (row) => new Date(row.createdAt).toLocaleDateString('fr-FR')
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>Gestion des Utilisateurs</h2>
          <p style={{ color: 'var(--color-gray-disabled)', marginTop: '0.25rem' }}>Gérez les comptes clients et le personnel BTS</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Shield size={18} style={{ marginRight: '8px' }} />
          Ajouter du personnel
        </Button>
      </div>

      <div className="card">
        <div className="table-actions" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-disabled)' }} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, téléphone ou rôle..." 
              className="bts-input" 
              style={{ width: '100%', paddingLeft: '2.5rem' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-disabled)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredUsers} 
            keyField="id" 
            actions={(row) => (
              <>
                <button className="icon-btn" title="Modifier" style={{ color: 'var(--color-primary)' }} onClick={() => handleOpenModal(row)}>
                  <Edit2 size={18} />
                </button>
                {row.role !== 'ADMIN' && (
                  <button className="icon-btn" title="Supprimer" style={{ color: '#DC2626' }} onClick={() => handleDelete(row.id)}>
                    <Trash2 size={18} />
                  </button>
                )}
              </>
            )}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingUser ? 'Modifier Utilisateur' : 'Ajouter du Personnel'}</h2>
              <button className="icon-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <Input
                id="phone"
                label="Téléphone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Ex: 77 123 45 67"
                required
                disabled={!!editingUser} // Prevent changing phone number
              />
              <div className="modal-form-grid">
                <Input
                  id="firstName"
                  label="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  id="lastName"
                  label="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <Input
                id="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Select
                id="role"
                label="Rôle"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'STUDENT', label: 'Étudiant (Client)' },
                  { value: 'AGENT', label: 'Agent' },
                  { value: 'CONTROLLER', label: 'Contrôleur' },
                  { value: 'ADMIN', label: 'Administrateur' }
                ]}
              />
              {!editingUser && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-gray-disabled)' }}>
                  Le mot de passe par défaut sera: <strong>Bts@2026</strong>
                </div>
              )}
              
              <div className="modal-footer">
                <Button variant="outline" type="button" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit" isLoading={actionLoading}>
                  {editingUser ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;

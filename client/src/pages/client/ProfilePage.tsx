import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Phone, Mail, Headset, MapPin } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { useNavigate, Navigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { calculateLoyalty } from '../../utils/loyalty';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loyalty, setLoyalty] = React.useState({ points: 0, status: 'Nouveau Client', tier: 'Bronze' });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch('/reservations/me');
        const paidCount = data.reservations.filter((r: any) => r.status === 'PAID').length;
        setLoyalty(calculateLoyalty(paidCount));
      } catch (err) {}
    };
    if (user && user.role !== 'ADMIN') {
      fetchStats();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return <Navigate to="/auth" state={{ returnTo: '/profile' }} replace />;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Profil Header */}
      <div style={{ backgroundColor: 'var(--color-white)', padding: '2.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-white)', boxShadow: '0 4px 10px rgba(11, 110, 46, 0.2)', flexShrink: 0 }}>
          <User size={50} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-text)', fontWeight: 700 }}>
            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Mon Profil'}
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-gray-disabled)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            {user.role === 'ADMIN' ? 'Administrateur' : loyalty.status}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Informations Personnelles */}
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', color: 'var(--color-text)', borderBottom: '2px solid var(--color-gray-light)', paddingBottom: '0.5rem' }}>Mes Informations</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Phone size={20} color="var(--color-primary)" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gray-disabled)' }}>Numéro de téléphone</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{user.phoneNumber}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={20} color="var(--color-primary)" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gray-disabled)' }}>Email</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{user.email || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support et Contact */}
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', color: 'var(--color-text)', borderBottom: '2px solid var(--color-gray-light)', paddingBottom: '0.5rem' }}>Support et Contact</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Headset size={20} color="var(--color-primary)" />
              <div>
                <p style={{ color: 'var(--color-gray-disabled)', fontSize: '0.9rem' }}>Service Client</p>
                <a href="tel:+221773402425" style={{ fontWeight: '500', color: 'var(--color-text)', textDecoration: 'none' }}>+221 77 340 24 25</a>
              </div>
              <a href="https://wa.me/221773402425" target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#25D366', color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                WhatsApp
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MapPin size={20} color="var(--color-primary)" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gray-disabled)' }}>Agence Principale</p>
                <a href="https://maps.google.com/?q=Université+Gaston+Berger" target="_blank" rel="noreferrer" style={{ margin: 0, fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none' }}>Université Gaston Berger</a>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={20} color="var(--color-primary)" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gray-disabled)' }}>Assistance par email</p>
                <a href="mailto:contactbaoltranservices@gmail.com" style={{ margin: 0, fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none' }}>contactbaoltranservices@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Button variant="danger" onClick={handleLogout} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
          <LogOut size={20} style={{ marginRight: '10px' }} />
          Me déconnecter
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;

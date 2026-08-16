import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', backgroundColor: '#fef3c7', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '2.5rem' }}>⚠️</span>
      </div>
      
      <h2 style={{ color: '#1F1F1F', marginBottom: '1rem' }}>Paiement Annulé</h2>
      <p style={{ color: '#6b7280', maxWidth: '400px', marginBottom: '2rem' }}>
        Vous avez annulé la procédure de paiement. Votre réservation a été mise en attente.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', color: '#1f2937', 
            border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelPage;

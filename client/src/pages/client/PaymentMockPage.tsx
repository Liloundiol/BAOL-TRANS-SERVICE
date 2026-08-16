import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentMockPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('res');
  const amount = searchParams.get('amt');
  
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = () => {
    setIsLoading(true);
    // Simulate Wave Processing
    setTimeout(() => {
      // Redirection vers le success url
      const sessionId = `SIM-WAVE-${Date.now()}`;
      window.location.href = `/payment-success?session_id=${sessionId}&reservation_id=${reservationId}&amount=${amount}`;
    }, 1500);
  };

  const handleCancel = () => {
    window.location.href = `/payment-cancel`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#eef2ff', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🌊</span>
        </div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: '#1F1F1F' }}>Simulation de Paiement</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Interface fictive (Wave API Key non détectée)</p>
        
        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>Montant à payer</p>
          <p style={{ margin: '0', fontSize: '2rem', fontWeight: 'bold', color: '#0B6E2E' }}>{amount} FCFA</p>
        </div>

        <button 
          onClick={handlePay}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#0B6E2E',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            marginBottom: '1rem'
          }}
        >
          {isLoading ? 'Traitement...' : 'Payer avec Wave (Test)'}
        </button>

        <button 
          onClick={handleCancel}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          Annuler le paiement
        </button>
      </div>
    </div>
  );
};

export default PaymentMockPage;

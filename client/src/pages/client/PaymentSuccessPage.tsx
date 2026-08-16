import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const reservationId = searchParams.get('reservation_id'); // Passed by our mock
  const amount = searchParams.get('amount'); // Passed by our mock
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Use a ref to prevent double-firing in React StrictMode
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('Session de paiement invalide.');
      return;
    }

    const confirmPayment = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;
      
      try {
        // En vrai production, l'ID de réservation est stocké côté serveur ou récupéré via webhook
        // Ici on envoie au serveur le sessionId pour qu'il le valide.
        // Puisque nous passons reservationId dans l'URL mockée pour des raisons pratiques:
        const payload = {
          waveTransactionId: sessionId,
          reservationId: reservationId || '', // In a perfect flow, the server maps sessionId -> reservationId
          amount: amount ? Number(amount) : 0
        };

        const data = await apiFetch('/reservations/pay', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (data.success && data.ticket) {
          setStatus('success');
          // Wait 2 seconds so user sees the success message, then redirect to ticket
          setTimeout(() => {
            navigate(`/ticket/${data.ticket.ticketCode}`);
          }, 2000);
        } else {
          throw new Error('La validation du ticket a échoué');
        }
      } catch (err: any) {
        console.error('Payment confirmation error:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Une erreur est survenue lors de la validation.');
      }
    };

    confirmPayment();
  }, [sessionId, reservationId, amount, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
      {status === 'loading' && (
        <>
          <div style={{ 
            width: '60px', height: '60px', 
            border: '4px solid #f3f3f3', borderTop: '4px solid #0B6E2E', 
            borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '2rem' 
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h2>Vérification du paiement...</h2>
          <p style={{ color: '#6b7280' }}>Veuillez patienter, nous sécurisons votre billet.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2.5rem', color: '#16a34a' }}>✓</span>
          </div>
          <h2 style={{ color: '#0B6E2E' }}>Paiement Réussi !</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Votre billet est en cours de création. Redirection automatique...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#fee2e2', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2.5rem', color: '#dc2626' }}>✗</span>
          </div>
          <h2 style={{ color: '#dc2626' }}>Erreur de Paiement</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{errorMsg}</p>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0B6E2E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Retour à l'accueil
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentSuccessPage;

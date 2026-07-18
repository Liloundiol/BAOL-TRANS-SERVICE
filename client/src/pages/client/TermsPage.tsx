import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>Conditions d'utilisation</h1>
        <p style={{ color: 'var(--color-gray-disabled)', marginBottom: '2rem' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <div style={{ lineHeight: '1.8', color: 'var(--color-text)' }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>1. Acceptation des conditions</h2>
          <p>
            En accédant à ce site web et en utilisant nos services de réservation, vous acceptez d'être lié par ces 
            Conditions d'utilisation, toutes les lois et règlements applicables, et acceptez que vous êtes responsable 
            du respect des lois locales applicables.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>2. Réservation et Paiement</h2>
          <p>
            Toute réservation effectuée sur Baol Trans Services est soumise à la disponibilité des places. Le paiement doit 
            être effectué intégralement au moment de la réservation via Wave pour que le billet numérique soit généré. 
            Les billets sont nominatifs et ne peuvent être cédés sans l'accord préalable du service client.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>3. Annulation et Remboursement</h2>
          <p>
            Les annulations effectuées au moins 24 heures avant l'heure de départ prévue sont admissibles à un 
            remboursement partiel (déduction faite des frais de traitement). Les annulations de dernière minute ne sont 
            généralement pas remboursables, sauf cas de force majeure dûment justifié.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>4. Bagages et Sécurité</h2>
          <p>
            Chaque passager a droit à un bagage en soute et un petit bagage à main. Les matières dangereuses, inflammables 
            ou illégales sont strictement interdites à bord. La direction se réserve le droit de refuser l'embarquement 
            à toute personne ne respectant pas ces règles de sécurité.
          </p>
          
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>5. Modifications des Conditions</h2>
          <p>
            Baol Trans Services peut réviser ces conditions d'utilisation de son site web à tout moment sans préavis. 
            En utilisant ce site web, vous acceptez d'être lié par la version alors en vigueur de ces Conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

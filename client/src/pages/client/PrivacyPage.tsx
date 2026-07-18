import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>Politique de confidentialité</h1>
        <p style={{ color: 'var(--color-gray-disabled)', marginBottom: '2rem' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <div style={{ lineHeight: '1.8', color: 'var(--color-text)' }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>1. Collecte des informations</h2>
          <p>
            Nous recueillons les informations que vous nous fournissez directement, par exemple lorsque vous créez un compte, 
            réservez un billet de bus, contactez le support client ou interagissez avec notre plateforme.
            Ces informations peuvent inclure votre nom, prénom, numéro de téléphone, adresse e-mail, 
            et détails de paiement (traités de manière sécurisée via Wave).
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>2. Utilisation des informations</h2>
          <p>
            Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
          </p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <li>Personnaliser votre expérience et répondre à vos besoins individuels</li>
            <li>Fournir le service de réservation et générer vos billets numériques</li>
            <li>Améliorer notre plateforme</li>
            <li>Améliorer le service client et vos besoins de prise en charge</li>
            <li>Vous contacter par e-mail ou SMS concernant votre réservation</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>3. Confidentialité du commerce en ligne</h2>
          <p>
            Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations personnelles 
            ne seront pas vendues, échangées, transférées, ou données à une autre société pour n'importe quelle raison, 
            sans votre consentement, en dehors de ce qui est nécessaire pour répondre à une demande et / ou une transaction, 
            comme par exemple pour expédier une commande.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>4. Consentement</h2>
          <p>
            En utilisant notre site, vous consentez à notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

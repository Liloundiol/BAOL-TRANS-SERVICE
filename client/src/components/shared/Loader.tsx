import React from 'react';


interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Chargement en cours...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'rgba(255, 255, 255, 0.8)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
        <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0B6E2E', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        {message && <p style={{ marginTop: '1rem', color: '#1F1F1F', fontWeight: 500 }}>{message}</p>}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="loader-container-inline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0B6E2E', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      {message && <p style={{ marginTop: '1rem', color: '#1F1F1F', fontWeight: 500 }}>{message}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

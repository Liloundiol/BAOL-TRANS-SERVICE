import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, Camera, CameraOff } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './TicketVerifyPage.css';

const TicketScannerPage: React.FC = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isCameraActive) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          // Si le scan réussit, on met en pause le scanner et on navigue
          if (scanner) {
             scanner.pause();
          }
          
          // On s'attend à ce que le decodedText soit un JSON ou juste le ticketCode. 
          // Selon la génération, c'est JSON.stringify({ reservationId, ticketCode })
          try {
            const data = JSON.parse(decodedText);
            if (data.ticketCode) {
               navigate(`/admin/verify/${data.ticketCode.toUpperCase()}`);
            } else {
               navigate(`/admin/verify/${decodedText.trim().toUpperCase()}`);
            }
          } catch {
            // Si c'est juste du texte
            navigate(`/admin/verify/${decodedText.trim().toUpperCase()}`);
          }
        },
        (error) => {
          // On ignore les erreurs de scan fréquentes (pas de QR code trouvé sur l'image)
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isCameraActive, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    
    const normalizedCode = ticketCode.trim().toUpperCase();
    navigate(`/admin/verify/${normalizedCode}`);
  };

  return (
    <div className="verify-page">
      <div className="verify-header">
        <h1>Valider un Billet</h1>
      </div>

      <div className="verify-content" style={{ marginTop: '2rem' }}>
        
        {/* Toggle Mode Scanner / Saisie */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Button 
             variant={!isCameraActive ? 'primary' : 'outline'} 
             onClick={() => setIsCameraActive(false)}
             style={{ flex: 1 }}
          >
             Saisie Manuelle
          </Button>
          <Button 
             variant={isCameraActive ? 'primary' : 'outline'} 
             onClick={() => setIsCameraActive(true)}
             style={{ flex: 1 }}
          >
             {isCameraActive ? <CameraOff size={20} style={{marginRight: '8px'}} /> : <Camera size={20} style={{marginRight: '8px'}} />}
             Scanner
          </Button>
        </div>

        {isCameraActive ? (
          <div className="status-banner" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-gray-border)' }}>
             <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
             <p style={{ marginTop: '1rem', color: 'var(--color-gray-disabled)' }}>Placez le QR code au centre de la caméra</p>
          </div>
        ) : (
          <>
            <div className="status-banner" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-gray-border)' }}>
              <QrCode size={48} color="var(--color-primary)" />
              <h2 style={{ color: 'var(--color-text)', marginTop: '1rem' }}>Saisie du Billet</h2>
              <p style={{ color: 'var(--color-gray-disabled)' }}>Saisissez le code du billet pour vérifier sa validité.</p>
            </div>

            <div className="verify-details" style={{ marginTop: '2rem', padding: '2rem 1.5rem' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  id="ticketCode"
                  label="Code du billet (Ex: TKT-...)"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="TKT-..."
                  required
                />
                
                <Button variant="primary" type="submit" fullWidth size="large" style={{ marginTop: '1rem' }}>
                  <Search size={20} style={{ marginRight: '8px' }} />
                  Vérifier le billet
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TicketScannerPage;

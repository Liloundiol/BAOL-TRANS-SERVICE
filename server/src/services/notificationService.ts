import nodemailer from 'nodemailer';

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendTicketEmail = async (user: any, ticket: any, reservation: any) => {
  if (!user.email) {
    console.log(`Email non envoyé pour ${user.firstName}: Pas d'adresse email fournie.`);
    return;
  }

  const { bus } = reservation;
  const { trip } = bus;

  const mailOptions = {
    from: `"Baol Trans Services" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Votre Billet BTS - ${trip.departure} vers ${trip.destination}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0B6E2E; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Baol Trans Services</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Votre billet numérique</p>
        </div>
        
        <div style="padding: 20px; background-color: #ffffff;">
          <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Merci pour votre réservation. Voici les détails de votre voyage :</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Trajet :</strong> ${trip.departure} &rarr; ${trip.destination}</p>
            <p style="margin: 0 0 10px 0;"><strong>Date :</strong> ${new Date(trip.date).toLocaleDateString('fr-FR')}</p>
            <p style="margin: 0 0 10px 0;"><strong>Heure de départ :</strong> ${trip.departureTime}</p>
            <p style="margin: 0 0 10px 0;"><strong>Bus N° :</strong> ${bus.busNumber}</p>
            <p style="margin: 0 0 10px 0;"><strong>Lieu d'embarquement :</strong> ${reservation.boardingPoint}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Votre code Billet :</p>
            <h2 style="margin: 0; color: #0B6E2E; letter-spacing: 2px;">${ticket.ticketCode}</h2>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/ticket/${ticket.id}" 
               style="display: inline-block; background-color: #0B6E2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Voir mon billet / QR Code
            </a>
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; color: #6b7280; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Ce billet est généré automatiquement, merci de ne pas répondre à cet email.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Baol Trans Services. Tous droits réservés.</p>
        </div>
      </div>
    `,
  };

  try {
    // If SMTP_USER is not configured, we just log instead of crashing
    if (process.env.SMTP_USER) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email envoyé à ${user.email} (Message ID: ${info.messageId})`);
    } else {
      console.log(`[SIMULATION EMAIL] - Billet envoyé à ${user.email} (Code: ${ticket.ticketCode})`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};

export const sendTicketSMS = async (user: any, ticket: any, reservation: any) => {
  const { bus } = reservation;
  const { trip } = bus;
  
  const smsMessage = `BTS: Votre billet ${ticket.ticketCode} est confirmé. Trajet: ${trip.departure}-${trip.destination} le ${new Date(trip.date).toLocaleDateString('fr-FR')} à ${trip.departureTime}. Bus: ${bus.busNumber}. Lieu: ${reservation.boardingPoint}. Bon voyage !`;

  // TODO: Remplacer cette simulation par l'appel à la véritable API SMS (ex: Orange, Infobip)
  console.log(`\n========================================`);
  console.log(`[SIMULATION SMS] - À destination de: ${user.phoneNumber}`);
  console.log(`Message: ${smsMessage}`);
  console.log(`========================================\n`);
  
  return true;
};

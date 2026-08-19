"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketSMS = exports.sendTicketEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
// Configuration du transporteur d'email
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendTicketEmail = async (user, ticket, reservation) => {
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
        }
        else {
            console.log(`[SIMULATION EMAIL] - Billet envoyé à ${user.email} (Code: ${ticket.ticketCode})`);
        }
    }
    catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};
exports.sendTicketEmail = sendTicketEmail;
// Configuration Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;
const sendTicketSMS = async (user, ticket, reservation) => {
    const { bus } = reservation;
    const { trip } = bus;
    // Template imposé par Twilio pour les comptes en mode "Trial" (Essai gratuit)
    const dateStr = new Date(trip.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '');
    const timeStr = trip.departureTime || new Date(trip.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const smsMessage = `Reminder: Appt ${dateStr}, ${timeStr}. Reply C to confirm or R to reschedule. Test message from Twilio.`;
    if (!user.phoneNumber) {
        console.log(`[SMS] Numéro de téléphone manquant pour ${user.firstName}`);
        return false;
    }
    // Si Twilio n'est pas configuré, on simule l'envoi
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        console.log(`\n========================================`);
        console.log(`[SIMULATION SMS] - À destination de: ${user.phoneNumber}`);
        console.log(`Message: ${smsMessage}`);
        console.log(`========================================\n`);
        return true;
    }
    try {
        // Format the phone number (assuming it's senegalese)
        let formattedPhone = user.phoneNumber;
        if (!formattedPhone.startsWith('+')) {
            // Default to Senegal code if no + is provided
            formattedPhone = formattedPhone.startsWith('221') ? `+${formattedPhone}` : `+221${formattedPhone}`;
        }
        const message = await twilioClient.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        console.log(`[SMS] Billet envoyé par SMS à ${formattedPhone} (SID: ${message.sid})`);
        return true;
    }
    catch (error) {
        console.error(`[SMS ERROR] Échec de l'envoi du SMS à ${user.phoneNumber}:`, error.message);
        return false;
    }
};
exports.sendTicketSMS = sendTicketSMS;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const axios_1 = __importDefault(require("axios"));
// Wave API Base URL (Example, check actual documentation)
const WAVE_API_BASE_URL = process.env.WAVE_API_BASE_URL || 'https://api.wave.com/v1';
/**
 * Service pour interagir avec l'API de Wave Sénégal ou PayDunya
 */
exports.paymentService = {
    /**
     * Crée une session de paiement sur Wave et retourne l'URL de paiement
     * @param amount Le montant à payer en FCFA
     * @param reservationId L'ID de la réservation associée
     * @param customerPhone Le numéro de téléphone du client (optionnel)
     */
    async createPaymentSession(amount, reservationId, customerPhone) {
        // Si la clé API n'est pas configurée, on retourne une session simulée pour les tests de développement
        if (!process.env.WAVE_API_KEY) {
            console.log(`[SIMULATION WAVE] Création session de paiement pour ${amount} FCFA (Res: ${reservationId})`);
            return {
                success: true,
                paymentUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-mock?res=${reservationId}&amt=${amount}`,
                sessionId: `SIM-WAVE-${Date.now()}`
            };
        }
        try {
            // APPEL RÉEL À L'API WAVE (Adapter selon la doc officielle Wave/PayDunya)
            const response = await axios_1.default.post(`${WAVE_API_BASE_URL}/checkout/sessions`, {
                amount: amount.toString(),
                currency: 'XOF',
                reference: reservationId,
                success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
                customer: customerPhone ? { phone: customerPhone } : undefined
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                paymentUrl: response.data.url,
                sessionId: response.data.id
            };
        }
        catch (error) {
            console.error('Erreur lors de la création de la session Wave:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Erreur de communication avec le service de paiement'
            };
        }
    },
    /**
     * Vérifie le statut d'un paiement existant
     * @param sessionId L'ID de la session Wave
     */
    async verifyPayment(sessionId) {
        if (!process.env.WAVE_API_KEY || sessionId.startsWith('SIM-WAVE-')) {
            console.log(`[SIMULATION WAVE] Vérification du statut pour ${sessionId} -> SUCCÈS`);
            return { success: true, status: 'completed' };
        }
        try {
            const response = await axios_1.default.get(`${WAVE_API_BASE_URL}/checkout/sessions/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.WAVE_API_KEY}`
                }
            });
            return {
                success: true,
                status: response.data.payment_status // ex: 'completed', 'pending', 'failed'
            };
        }
        catch (error) {
            console.error('Erreur lors de la vérification Wave:', error.response?.data || error.message);
            return {
                success: false,
                status: 'error'
            };
        }
    }
};

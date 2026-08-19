"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLoyaltyPoints = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const addLoyaltyPoints = async (userId, points, description) => {
    try {
        let account = await prisma_1.default.loyaltyAccount.findUnique({
            where: { userId }
        });
        if (!account) {
            account = await prisma_1.default.loyaltyAccount.create({
                data: {
                    userId,
                    points: 0,
                    tier: 'BRONZE'
                }
            });
        }
        const newTotal = account.points + points;
        let tier = account.tier;
        if (newTotal >= 500) {
            tier = 'GOLD';
        }
        else if (newTotal >= 100) {
            tier = 'SILVER';
        }
        await prisma_1.default.$transaction([
            prisma_1.default.loyaltyAccount.update({
                where: { id: account.id },
                data: {
                    points: newTotal,
                    tier
                }
            }),
            prisma_1.default.loyaltyTransaction.create({
                data: {
                    loyaltyAccountId: account.id,
                    points,
                    description
                }
            })
        ]);
        return { success: true, newTotal, tier };
    }
    catch (error) {
        console.error("Erreur lors de l'ajout des points de fidélité:", error);
        return { success: false, error };
    }
};
exports.addLoyaltyPoints = addLoyaltyPoints;

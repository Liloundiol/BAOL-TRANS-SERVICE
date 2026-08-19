"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestReviews = exports.createReview = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'La note doit être comprise entre 1 et 5' });
        }
        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Le commentaire est requis' });
        }
        // Check if user has at least one paid reservation
        const hasReservations = await prisma_1.default.reservation.findFirst({
            where: {
                userId,
                status: 'PAID'
            }
        });
        if (!hasReservations) {
            return res.status(403).json({ success: false, message: 'Vous devez avoir effectué au moins un trajet avec nous pour laisser un avis.' });
        }
        const review = await prisma_1.default.review.create({
            data: {
                rating,
                comment,
                userId
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.status(201).json({ success: true, message: 'Avis ajouté avec succès', review });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
const getLatestReviews = async (req, res, next) => {
    try {
        // Get 3 recent positive reviews (4 or 5 stars)
        const reviews = await prisma_1.default.review.findMany({
            where: {
                rating: {
                    gte: 4
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 3,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.json({ success: true, reviews });
    }
    catch (error) {
        next(error);
    }
};
exports.getLatestReviews = getLatestReviews;

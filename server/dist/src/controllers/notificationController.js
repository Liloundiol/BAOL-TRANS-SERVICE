"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 for performance
        });
        const unreadCount = await prisma_1.default.notification.count({
            where: { userId, isRead: false }
        });
        res.json({ success: true, notifications, unreadCount });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const notification = await prisma_1.default.notification.updateMany({
            where: { id, userId },
            data: { isRead: true }
        });
        if (notification.count === 0) {
            return res.status(404).json({ success: false, error: 'Notification non trouvée ou non autorisée' });
        }
        res.json({ success: true, message: 'Notification marquée comme lue' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await prisma_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
        res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payPackage = exports.deletePackage = exports.updatePackageStatus = exports.createPackage = exports.getPackages = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all packages
const getPackages = async (req, res, next) => {
    try {
        const packages = await prisma.package.findMany({
            where: req.user?.role === 'STUDENT' ? { senderId: req.user.userId } : undefined,
            include: {
                sender: true,
                trip: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, packages });
    }
    catch (error) {
        next(error);
    }
};
exports.getPackages = getPackages;
// Create a new package
const createPackage = async (req, res, next) => {
    try {
        const { senderId, tripId, receiverPhone, receiverName, description, weight, price, packageType } = req.body;
        let finalSenderId = senderId || req.user?.userId;
        let finalPrice = price;
        if (packageType === 'VALISE_SAC') {
            finalPrice = 4000;
        }
        else if (packageType === 'DOCUMENT') {
            finalPrice = 2500;
        }
        else if (req.user?.role === 'STUDENT' || !finalPrice) {
            // Fallback if no packageType is provided
            finalPrice = Math.max(1000, weight * 500);
        }
        const newPackage = await prisma.package.create({
            data: {
                senderId: finalSenderId,
                tripId,
                receiverPhone,
                receiverName,
                description,
                weight,
                price: finalPrice,
                status: 'PENDING'
            },
            include: {
                sender: true,
                trip: true
            }
        });
        res.status(201).json({ success: true, package: newPackage });
    }
    catch (error) {
        next(error);
    }
};
exports.createPackage = createPackage;
// Update package status
const updatePackageStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedPackage = await prisma.package.update({
            where: { id },
            data: { status },
            include: {
                sender: true,
                trip: true
            }
        });
        res.json({ success: true, package: updatedPackage });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePackageStatus = updatePackageStatus;
// Delete a package
const deletePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.package.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Colis supprimé avec succès' });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePackage = deletePackage;
// Pay for a package
const payPackage = async (req, res, next) => {
    try {
        const { packageId, waveTransactionId, amount } = req.body;
        if (!packageId || !waveTransactionId) {
            res.status(400).json({ success: false, message: 'ID colis et transaction Wave requis' });
            return;
        }
        const pkg = await prisma.package.findUnique({
            where: { id: packageId },
            include: { payment: true }
        });
        if (!pkg) {
            res.status(404).json({ success: false, message: 'Colis introuvable' });
            return;
        }
        if (pkg.payment && pkg.payment.status === 'COMPLETED') {
            res.status(400).json({ success: false, message: 'Ce colis est déjà payé' });
            return;
        }
        if (pkg.status === 'DELIVERED' || pkg.status === 'CANCELLED') {
            res.status(400).json({ success: false, message: 'Ce colis est livré ou annulé' });
            return;
        }
        // Créer le paiement
        const payment = await prisma.payment.create({
            data: {
                packageId,
                waveTransactionId,
                amount: amount || pkg.price,
                status: 'COMPLETED'
            }
        });
        res.json({ success: true, package: pkg, payment });
    }
    catch (error) {
        next(error);
    }
};
exports.payPackage = payPackage;

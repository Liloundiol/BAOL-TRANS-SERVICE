"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePackage = exports.updatePackageStatus = exports.createPackage = exports.getPackages = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all packages
const getPackages = async (req, res, next) => {
    try {
        const packages = await prisma.package.findMany({
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
        const { senderId, tripId, receiverPhone, receiverName, description, weight, price } = req.body;
        const newPackage = await prisma.package.create({
            data: {
                senderId,
                tripId,
                receiverPhone,
                receiverName,
                description,
                weight,
                price,
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatus = exports.getComplaints = exports.createComplaint = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new complaint
const createComplaint = async (req, res, next) => {
    try {
        const { packageId, subject, message } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }
        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Le sujet et le message sont obligatoires' });
        }
        const complaint = await prisma.complaint.create({
            data: {
                userId: req.user.userId,
                packageId: packageId || null,
                subject,
                message,
                status: 'PENDING'
            }
        });
        res.status(201).json({ success: true, complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.createComplaint = createComplaint;
// Get all complaints (Admin only)
const getComplaints = async (req, res, next) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phoneNumber: true
                    }
                },
                package: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, complaints });
    }
    catch (error) {
        next(error);
    }
};
exports.getComplaints = getComplaints;
// Update complaint status (Admin only)
const updateComplaintStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const complaint = await prisma.complaint.update({
            where: { id },
            data: { status }
        });
        res.json({ success: true, complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.updateComplaintStatus = updateComplaintStatus;

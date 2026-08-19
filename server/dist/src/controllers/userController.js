"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAdmins = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../config/prisma"));
const getUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                phoneNumber: true,
                email: true,
                role: true,
                createdAt: true,
                firstName: true,
                lastName: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const { phoneNumber, firstName, lastName, email, role, password } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { phoneNumber } });
        if (existingUser) {
            // Si l'utilisateur existe déjà mais qu'il est étudiant, on le promeut au nouveau rôle (Admin, Agent, etc.)
            if (existingUser.role === 'STUDENT' && role && role !== 'STUDENT') {
                const updatedUser = await prisma_1.default.user.update({
                    where: { phoneNumber },
                    data: {
                        role,
                        firstName: firstName || existingUser.firstName,
                        lastName: lastName || existingUser.lastName,
                        email: email || existingUser.email
                    },
                    select: { id: true, phoneNumber: true, role: true, firstName: true, lastName: true }
                });
                res.status(200).json(updatedUser);
                return;
            }
            res.status(400).json({ message: 'Un membre du personnel ou un utilisateur avec ce numéro existe déjà' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password || 'Bts@2026', salt);
        const newUser = await prisma_1.default.user.create({
            data: {
                phoneNumber,
                firstName,
                lastName,
                email: email || undefined,
                role: role || 'STUDENT',
                passwordHash
            },
            select: { id: true, phoneNumber: true, role: true, firstName: true, lastName: true }
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Erreur lors de la création:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { role, firstName, lastName, email } = req.body;
        const updatedUser = await prisma_1.default.user.update({
            where: { id },
            data: {
                role,
                firstName,
                lastName,
                email: email || undefined
            },
            select: { id: true, phoneNumber: true, role: true, firstName: true, lastName: true }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        // Prevent deleting oneself
        if (req.user?.userId === id) {
            res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
            return;
        }
        await prisma_1.default.user.delete({ where: { id } });
        res.json({ message: 'Utilisateur supprimé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.deleteUser = deleteUser;
const resetAdmins = async (req, res) => {
    try {
        const admins = await prisma_1.default.user.findMany({ where: { role: 'ADMIN' } });
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash('Bts@2026', salt);
        for (const admin of admins) {
            await prisma_1.default.user.update({
                where: { id: admin.id },
                data: { passwordHash },
            });
        }
        res.json({ message: 'Admins reset', phones: admins.map(a => a.phoneNumber) });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
};
exports.resetAdmins = resetAdmins;

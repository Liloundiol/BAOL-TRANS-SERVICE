"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const register = async (req, res, next) => {
    try {
        const { phoneNumber, password, firstName, lastName, email } = req.body;
        if (!phoneNumber || !password) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone et mot de passe requis' });
        }
        // Check if user exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { phoneNumber }
        });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Ce numéro de téléphone est déjà utilisé' });
        }
        // Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        // Create user
        const user = await prisma_1.default.user.create({
            data: {
                phoneNumber,
                passwordHash,
                firstName,
                lastName,
                email: email === '' ? undefined : email,
                role: 'STUDENT'
            }
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, phoneNumber: user.phoneNumber }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { phoneNumber, password } = req.body;
        if (!phoneNumber || !password) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone et mot de passe requis' });
        }
        // Find user
        const user = await prisma_1.default.user.findUnique({
            where: { phoneNumber }
        });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
        }
        // Check password
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, phoneNumber: user.phoneNumber }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;

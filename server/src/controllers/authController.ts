import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, password, firstName, lastName, email } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ success: false, error: 'Numéro de téléphone et mot de passe requis' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Ce numéro de téléphone est déjà utilisé' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
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
    const token = jwt.sign(
      { id: user.id, role: user.role, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

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
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ success: false, error: 'Numéro de téléphone et mot de passe requis' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

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
  } catch (error) {
    next(error);
  }
};

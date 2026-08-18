import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, firstName, lastName, email, role, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingUser) {
      // Si l'utilisateur existe déjà mais qu'il est étudiant, on le promeut au nouveau rôle (Admin, Agent, etc.)
      if (existingUser.role === 'STUDENT' && role && role !== 'STUDENT') {
        const updatedUser = await prisma.user.update({
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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Bts@2026', salt);

    const newUser = await prisma.user.create({
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
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { role, firstName, lastName, email } = req.body;

    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Prevent deleting oneself
    if (req.user?.userId === id) {
      res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

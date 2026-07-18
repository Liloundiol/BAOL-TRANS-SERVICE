import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log the full error for backend debugging

  const statusCode = err.statusCode || 500;
  
  // Check if it's a Prisma error or a generic 500 error to hide technical details
  let message = err.message || 'Une erreur est survenue. Veuillez réessayer.';
  
  if (err.name === 'PrismaClientInitializationError' || err.name === 'PrismaClientKnownRequestError' || statusCode >= 500) {
    message = 'Une erreur est survenue. Veuillez réessayer.';
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

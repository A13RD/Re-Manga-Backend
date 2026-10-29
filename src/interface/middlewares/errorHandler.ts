import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const errorObj = err as { message?: string; code?: string; statusCode?: number };
  console.error('Error procesado:', errorObj?.message || err);

  // Errores controlados de la aplicación (AppError: ValidationError, UnauthorizedError, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Errores específicos de Prisma ORM
  if (errorObj?.code === 'P2002') {
    return res.status(409).json({ message: 'Conflicto: Ya existe un registro con esos datos únicos.' });
  }
  if (errorObj?.code === 'P2025') {
    return res.status(404).json({ message: 'Recurso no encontrado.' });
  }

  // Error 500 genérico sin exponer trazas de pila (stack traces) al cliente
  res.status(500).json({ message: 'Internal server error' });
};

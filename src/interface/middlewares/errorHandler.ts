import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const errorObj = err as { message?: string; code?: string; statusCode?: number; status?: number; type?: string };
  console.error('Error procesado:', errorObj?.message || err);

  // Errores de sintaxis JSON en el cuerpo de la petición
  if (err instanceof SyntaxError && ('body' in err || errorObj?.status === 400 || errorObj?.type === 'entity.parse.failed')) {
    return res.status(400).json({ message: 'Formato JSON inválido en la solicitud.' });
  }

  // Errores controlados de la aplicación (AppError: ValidationError, UnauthorizedError, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Errores específicos de Prisma ORM (sin exponer detalles internos de la base de datos)
  if (errorObj?.code === 'P2002') {
    return res.status(409).json({ message: 'Conflicto: Ya existe un registro con esos datos únicos.' });
  }
  if (errorObj?.code === 'P2025') {
    return res.status(404).json({ message: 'Recurso no encontrado.' });
  }
  if (errorObj?.code === 'P2003') {
    return res.status(409).json({ message: 'Conflicto: No se puede completar la operación porque el recurso tiene registros asociados.' });
  }

  // Error 500 genérico sin exponer trazas de pila (stack traces) al cliente
  res.status(500).json({ message: 'Internal server error' });
};

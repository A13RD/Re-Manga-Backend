import { Request, Response, NextFunction } from 'express';
import { Role } from '../../domain/user';

/**
 * Middleware centralizado de autorización basada en roles (RBAC).
 * Permite la ejecución de la ruta si el usuario autenticado posee uno de los roles permitidos.
 * - Sin identidad autenticada: HTTP 401 Unauthorized.
 * - Con identidad válida pero rol insuficiente: HTTP 403 Forbidden.
 * - Rol autorizado: continúa al siguiente middleware/controlador.
 */
export const authorizeRoles = (...allowedRoles: (Role | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado: sesión no identificada' });
    }

    const userRole = req.user.role;
    const isAuthorized = allowedRoles.some(
      (role) => role.toUpperCase() === userRole.toUpperCase()
    );

    if (!isAuthorized) {
      return res.status(403).json({
        message: 'Acceso denegado: permisos insuficientes para realizar esta acción',
      });
    }

    next();
  };
};


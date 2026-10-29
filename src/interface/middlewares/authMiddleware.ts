import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../../domain/user';

/**
 * Middleware centralizado de autenticación JWT.
 * Inspecciona el encabezado 'Authorization', valida el token Bearer,
 * verifica la firma criptográfica y expiración, y adjunta la identidad tipada a req.user.
 * Sustituye completamente el middleware mock temporal y elimina la confianza en 'x-user-id'.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No autorizado: falta el encabezado Authorization' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'No autorizado: formato de token inválido. Use "Bearer <token>"' });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: 'No autorizado: token no proporcionado' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('ERROR CRÍTICO: JWT_SECRET no está configurado en las variables de entorno');
    return res.status(500).json({ message: 'Error de configuración del servidor' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({ message: 'No autorizado: token corrupto o payload incompleto' });
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'No autorizado: el token ha expirado' });
    }
    return res.status(401).json({ message: 'No autorizado: token inválido' });
  }
};


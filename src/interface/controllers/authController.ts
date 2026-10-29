import { Request, Response, NextFunction } from 'express';
import { AuthUseCase } from '../../application/authUseCase';
import { AppError } from '../../domain/errors';

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, nombre, email, password } = req.body;
      const userName = name || nombre;

      const result = await this.authUseCase.register({
        name: userName,
        email,
        password,
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: result.user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const result = await this.authUseCase.login({
        email,
        password,
      });

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const profile = await this.authUseCase.getProfile(userId);
      res.status(200).json({ user: profile });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  };
}


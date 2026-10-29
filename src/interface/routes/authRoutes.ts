import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthUseCase } from '../../application/authUseCase';
import { UserRepository } from '../../infrastructure/repositories/userRepository';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();
const userRepository = new UserRepository();
const authUseCase = new AuthUseCase(userRepository);
const controller = new AuthController(authUseCase);

// Rutas públicas de autenticación
router.post('/register', controller.register);
router.post('/login', controller.login);

// Ruta protegida para consultar el perfil/sesión del usuario actual
router.get('/me', authenticateJWT, controller.me);

export default router;


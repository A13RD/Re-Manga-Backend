import { Router } from 'express';
import { MangaController } from '../controllers/mangaController';
import { MangaUseCase } from '../../application/mangaUseCase';
import { MangaRepository } from '../../infrastructure/repositories/mangaRepository';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Role } from '../../domain/user';

const router = Router();
const repository = new MangaRepository();
const useCase = new MangaUseCase(repository);
const controller = new MangaController(useCase);

// Rutas públicas de lectura del catálogo
router.get('/', controller.getAllMangas);
router.get('/:id', controller.getMangaById);

// Rutas administrativas de gestión de mangas (solo ADMIN)
router.post('/', authenticateJWT, authorizeRoles(Role.ADMIN), controller.createManga);
router.put('/:id', authenticateJWT, authorizeRoles(Role.ADMIN), controller.updateManga);
router.delete('/:id', authenticateJWT, authorizeRoles(Role.ADMIN), controller.deleteManga);

export default router;

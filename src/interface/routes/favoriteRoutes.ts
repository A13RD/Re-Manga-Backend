import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController.js';
import { FavoriteUseCase } from '../../application/favoriteUseCase.js';
import { FavoriteRepository } from '../../infrastructure/repositories/favoriteRepository.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();
const repository = new FavoriteRepository();
const useCase = new FavoriteUseCase(repository);
const controller = new FavoriteController(useCase);

router.get('/', authenticateJWT, controller.getFavorites);
router.post('/', authenticateJWT, controller.addFavorite);
router.delete('/:mangaId', authenticateJWT, controller.removeFavorite);

export default router;


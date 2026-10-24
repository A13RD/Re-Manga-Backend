import { Router } from 'express';
import { MangaController } from '../controllers/mangaController';
import { MangaUseCase } from '../../application/mangaUseCase';
import { MangaRepository } from '../../infrastructure/repositories/mangaRepository';

const router = Router();
const repository = new MangaRepository();
const useCase = new MangaUseCase(repository);
const controller = new MangaController(useCase);

router.get('/', controller.getAllMangas);
router.get('/:id', controller.getMangaById);
router.post('/', controller.createManga);
router.put('/:id', controller.updateManga);
router.delete('/:id', controller.deleteManga);

export default router;

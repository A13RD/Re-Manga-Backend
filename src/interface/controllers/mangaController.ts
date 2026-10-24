import { Request, Response, NextFunction } from 'express';
import { MangaUseCase } from '../../application/mangaUseCase.js';

export class MangaController {
  constructor(private mangaUseCase: MangaUseCase) {}

  getAllMangas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const pageSize = parseInt(req.query['pageSize'] as string) || 6;

      if (page < 1 || pageSize < 1) {
        return res.status(400).json({ message: 'Invalid pagination parameters' });
      }

      const result = await this.mangaUseCase.getAllMangas(page, pageSize);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getMangaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') return res.status(400).json({ message: 'Missing manga id' });
      const manga = await this.mangaUseCase.getMangaById(id);
      res.json(manga);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Manga not found') {
        res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    }
  };

  createManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, author, genre, description, price, condition, stock } = req.body as Record<string, unknown>;
      if (!title || !author || !genre || !description || price === undefined || !condition || stock === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const newManga = await this.mangaUseCase.createManga(req.body);
      res.status(201).json(newManga);
    } catch (error) {
      next(error);
    }
  };

  updateManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') return res.status(400).json({ message: 'Missing manga id' });
      const updatedManga = await this.mangaUseCase.updateManga(id, req.body);
      res.json(updatedManga);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Manga not found') {
        res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    }
  };

  deleteManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string') return res.status(400).json({ message: 'Missing manga id' });
      await this.mangaUseCase.deleteManga(id);
      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Manga not found') {
        res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    }
  };
}

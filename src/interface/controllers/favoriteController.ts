import { Request, Response, NextFunction } from 'express';
import { FavoriteUseCase } from '../../application/favoriteUseCase.js';

export class FavoriteController {
  constructor(private favoriteUseCase: FavoriteUseCase) {}

  getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
      }

      const favorites = await this.favoriteUseCase.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  };

  addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
      }

      const { mangaId } = (req.body || {}) as { mangaId?: unknown };
      const mangaIdStr = typeof mangaId === 'string' ? mangaId.trim() : '';
      if (!mangaIdStr) {
        return res.status(400).json({ message: 'mangaId es requerido y debe ser una cadena válida' });
      }

      const favorite = await this.favoriteUseCase.addFavorite(userId, mangaIdStr);
      res.status(201).json(favorite);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Manga not found') {
        return res.status(404).json({ message: 'El manga especificado no existe' });
      }
      next(error);
    }
  };

  removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
      }

      const rawMangaId = req.params['mangaId'];
      const mangaId = typeof rawMangaId === 'string' ? rawMangaId.trim() : undefined;
      if (!mangaId) {
        return res.status(400).json({ message: 'mangaId es requerido' });
      }

      await this.favoriteUseCase.removeFavorite(userId, mangaId);
      res.json({ message: 'Manga eliminado de favoritos' });
    } catch (error) {
      next(error);
    }
  };
}

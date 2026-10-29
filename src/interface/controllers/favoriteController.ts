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

      const { mangaId } = req.body as { mangaId?: string };
      if (!mangaId) {
        return res.status(400).json({ message: 'mangaId es requerido' });
      }

      const favorite = await this.favoriteUseCase.addFavorite(userId, mangaId);
      res.status(201).json(favorite);
    } catch (error) {
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
      const mangaId = typeof rawMangaId === 'string' ? rawMangaId : undefined;
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

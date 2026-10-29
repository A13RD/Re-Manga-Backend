import { Request, Response, NextFunction } from 'express';
import { MangaUseCase } from '../../application/mangaUseCase.js';
import { CreateMangaDTO, UpdateMangaDTO } from '../../domain/manga.js';

const VALID_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

export class MangaController {
  constructor(private mangaUseCase: MangaUseCase) {}

  getAllMangas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawPage = req.query['page'];
      const rawPageSize = req.query['pageSize'];

      const page = rawPage !== undefined && rawPage !== '' ? Number(rawPage) : 1;
      const pageSize = rawPageSize !== undefined && rawPageSize !== '' ? Number(rawPageSize) : 6;

      if (
        !Number.isInteger(page) ||
        !Number.isInteger(pageSize) ||
        page < 1 ||
        pageSize < 1 ||
        pageSize > 100
      ) {
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
      if (typeof id !== 'string' || !id.trim()) {
        return res.status(400).json({ message: 'Missing manga id' });
      }
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
      const { title, author, genre, description, price, condition, stock, volume, image } = (req.body || {}) as Record<string, unknown>;

      const titleStr = typeof title === 'string' ? title.trim() : '';
      const authorStr = typeof author === 'string' ? author.trim() : '';
      const genreStr = typeof genre === 'string' ? genre.trim() : '';
      const descriptionStr = typeof description === 'string' ? description.trim() : '';
      const conditionStr = typeof condition === 'string' ? condition.trim().toUpperCase() : '';

      if (
        !titleStr ||
        !authorStr ||
        !genreStr ||
        !descriptionStr ||
        price === undefined ||
        price === null ||
        price === '' ||
        !conditionStr ||
        stock === undefined ||
        stock === null ||
        stock === ''
      ) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (!VALID_CONDITIONS.includes(conditionStr)) {
        return res.status(400).json({ message: 'Condición del manga inválida' });
      }

      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: 'El precio debe ser un número válido mayor que 0' });
      }

      const stockNum = Number(stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        return res.status(400).json({ message: 'El stock debe ser un número entero mayor o igual a 0' });
      }

      const mangaData: CreateMangaDTO = {
        title: titleStr,
        author: authorStr,
        genre: genreStr,
        description: descriptionStr,
        price: priceNum,
        condition: conditionStr,
        stock: stockNum,
      };

      if (volume !== undefined && volume !== null && volume !== '') {
        const volumeNum = Number(volume);
        if (!Number.isInteger(volumeNum) || volumeNum <= 0) {
          return res.status(400).json({ message: 'El volumen debe ser un número entero mayor que 0' });
        }
        mangaData.volume = volumeNum;
      }

      if (image !== undefined && image !== null && typeof image === 'string' && image.trim() !== '') {
        mangaData.image = image.trim();
      }

      const newManga = await this.mangaUseCase.createManga(mangaData);
      res.status(201).json(newManga);
    } catch (error) {
      next(error);
    }
  };

  updateManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (typeof id !== 'string' || !id.trim()) {
        return res.status(400).json({ message: 'Missing manga id' });
      }

      const body = (req.body || {}) as Record<string, unknown>;
      const updateData: UpdateMangaDTO = {};

      if (body.title !== undefined) {
        if (typeof body.title !== 'string' || !body.title.trim()) {
          return res.status(400).json({ message: 'El título no puede estar vacío' });
        }
        updateData.title = body.title.trim();
      }

      if (body.author !== undefined) {
        if (typeof body.author !== 'string' || !body.author.trim()) {
          return res.status(400).json({ message: 'El autor no puede estar vacío' });
        }
        updateData.author = body.author.trim();
      }

      if (body.genre !== undefined) {
        if (typeof body.genre !== 'string' || !body.genre.trim()) {
          return res.status(400).json({ message: 'El género no puede estar vacío' });
        }
        updateData.genre = body.genre.trim();
      }

      if (body.description !== undefined) {
        if (typeof body.description !== 'string' || !body.description.trim()) {
          return res.status(400).json({ message: 'La descripción no puede estar vacía' });
        }
        updateData.description = body.description.trim();
      }

      if (body.condition !== undefined) {
        const condStr = typeof body.condition === 'string' ? body.condition.trim().toUpperCase() : '';
        if (!VALID_CONDITIONS.includes(condStr)) {
          return res.status(400).json({ message: 'Condición del manga inválida' });
        }
        updateData.condition = condStr;
      }

      if (body.price !== undefined) {
        const priceNum = Number(body.price);
        if (body.price === null || body.price === '' || !Number.isFinite(priceNum) || priceNum <= 0) {
          return res.status(400).json({ message: 'El precio debe ser un número válido mayor que 0' });
        }
        updateData.price = priceNum;
      }

      if (body.stock !== undefined) {
        const stockNum = Number(body.stock);
        if (body.stock === null || body.stock === '' || !Number.isInteger(stockNum) || stockNum < 0) {
          return res.status(400).json({ message: 'El stock debe ser un número entero mayor o igual a 0' });
        }
        updateData.stock = stockNum;
      }

      if (body.volume !== undefined && body.volume !== null && body.volume !== '') {
        const volumeNum = Number(body.volume);
        if (!Number.isInteger(volumeNum) || volumeNum <= 0) {
          return res.status(400).json({ message: 'El volumen debe ser un número entero mayor que 0' });
        }
        updateData.volume = volumeNum;
      }

      if (body.image !== undefined) {
        if (typeof body.image === 'string') {
          updateData.image = body.image.trim();
        }
      }

      const updatedManga = await this.mangaUseCase.updateManga(id, updateData);
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
      if (typeof id !== 'string' || !id.trim()) {
        return res.status(400).json({ message: 'Missing manga id' });
      }
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

import { Request, Response, NextFunction } from 'express';
import { SaleRequestUseCase } from '../../application/saleRequestUseCase';

const VALID_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

export class SaleRequestController {
  constructor(private saleRequestUseCase: SaleRequestUseCase) {}

  getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requests = await this.saleRequestUseCase.getAllRequests();
      res.json(requests);
    } catch (error) {
      next(error);
    }
  };

  getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: usuario no identificado' });
      }
      const requests = await this.saleRequestUseCase.getMyRequests(userId);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  };

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // El identificador del vendedor se obtiene estrictamente del JWT verificado
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: sesión no identificada' });
      }

      const { title, author, genre, description, proposedPrice, condition, volume, image } = (req.body || {}) as Record<string, unknown>;

      const titleStr = typeof title === 'string' ? title.trim() : '';
      const authorStr = typeof author === 'string' ? author.trim() : '';
      const genreStr = typeof genre === 'string' ? genre.trim() : '';
      const descriptionStr = typeof description === 'string' ? description.trim() : '';
      const conditionStr = typeof condition === 'string' ? condition.trim().toUpperCase() : '';

      if (!titleStr || !authorStr || !genreStr || !descriptionStr || proposedPrice === undefined || proposedPrice === null || proposedPrice === '' || !conditionStr) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      if (!VALID_CONDITIONS.includes(conditionStr)) {
        return res.status(400).json({ message: 'Condición del manga inválida' });
      }

      const priceNum = Number(proposedPrice);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: 'El precio propuesto debe ser un número válido mayor que 0' });
      }

      // Estructuración controlada: se ignora explícitamente cualquier userId o status enviado en el body
      const requestData: {
        title: string;
        author: string;
        genre: string;
        description: string;
        proposedPrice: number;
        condition: string;
        volume?: number;
        image?: string;
      } = {
        title: titleStr,
        author: authorStr,
        genre: genreStr,
        description: descriptionStr,
        proposedPrice: priceNum,
        condition: conditionStr,
      };

      if (volume !== undefined && volume !== null && volume !== '') {
        const volumeNum = Number(volume);
        if (!Number.isInteger(volumeNum) || volumeNum <= 0) {
          return res.status(400).json({ message: 'El volumen debe ser un número entero mayor que 0' });
        }
        requestData.volume = volumeNum;
      }
      if (image !== undefined && image !== null && typeof image === 'string' && image.trim() !== '') {
        requestData.image = image.trim();
      }

      const newRequest = await this.saleRequestUseCase.createRequest(userId, requestData);

      res.status(201).json(newRequest);
    } catch (error) {
      next(error);
    }
  };
}

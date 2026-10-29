import { Request, Response, NextFunction } from 'express';
import { SaleRequestUseCase } from '../../application/saleRequestUseCase';

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

      const { title, author, genre, description, proposedPrice, condition, volume, image } = req.body;
      if (!title || !author || !genre || !description || proposedPrice === undefined || !condition) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      // Estructuración controlada: se ignora explícitamente cualquier userId enviado en el body
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
        title: String(title),
        author: String(author),
        genre: String(genre),
        description: String(description),
        proposedPrice: Number(proposedPrice),
        condition: String(condition),
      };

      if (volume !== undefined && volume !== null && volume !== '') {
        requestData.volume = Number(volume);
      }
      if (image !== undefined && image !== null && image !== '') {
        requestData.image = String(image);
      }

      const newRequest = await this.saleRequestUseCase.createRequest(userId, requestData);

      res.status(201).json(newRequest);
    } catch (error) {
      next(error);
    }
  };
}

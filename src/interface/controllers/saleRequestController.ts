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
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const requests = await this.saleRequestUseCase.getMyRequests(userId);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  };

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title, author, genre, description, proposedPrice, condition } = req.body;
      if (!title || !author || !genre || !description || proposedPrice === undefined || !condition) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const newRequest = await this.saleRequestUseCase.createRequest(userId, req.body);
      res.status(201).json(newRequest);
    } catch (error) {
      next(error);
    }
  };
}

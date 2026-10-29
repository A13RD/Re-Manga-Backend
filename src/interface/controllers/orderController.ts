import { Request, Response, NextFunction } from 'express';
import { OrderUseCase } from '../../application/orderUseCase.js';
import { CreateOrderItemDTO } from '../../domain/order.js';

export class OrderController {
  constructor(private orderUseCase: OrderUseCase) {}

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: usuario no identificado' });
      }

      const { items } = (req.body || {}) as { items?: unknown };
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'El pedido debe contener al menos un producto' });
      }

      const sanitizedItems: CreateOrderItemDTO[] = [];
      for (const rawItem of items) {
        const item = (rawItem || {}) as Record<string, unknown>;
        const mangaId = typeof item.mangaId === 'string' ? item.mangaId.trim() : '';
        const quantity = Number(item.quantity);

        if (!mangaId || item.quantity === undefined || item.quantity === null || item.quantity === '' || !Number.isInteger(quantity) || quantity <= 0) {
          return res.status(400).json({ message: 'Cantidad o identificador no válido para uno o más productos' });
        }

        sanitizedItems.push({ mangaId, quantity });
      }

      const order = await this.orderUseCase.createOrder(userId, sanitizedItems);
      res.status(201).json(order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('El manga solicitado no fue encontrado')) {
          return res.status(404).json({ message: error.message });
        }
        if (
          error.message.includes('Stock insuficiente') ||
          error.message.includes('Cantidad no válida') ||
          error.message.includes('El pedido debe')
        ) {
          return res.status(400).json({ message: error.message });
        }
      }
      next(error);
    }
  };

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: usuario no identificado' });
      }

      const orders = await this.orderUseCase.getMyOrders(userId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado: usuario no identificado' });
      }

      const rawId = req.params['id'];
      const id = typeof rawId === 'string' ? rawId.trim() : undefined;
      if (!id) {
        return res.status(400).json({ message: 'ID de orden requerido' });
      }

      const isAdmin = req.user?.role === 'ADMIN';
      const order = await this.orderUseCase.getOrderById(userId, id, isAdmin);
      res.json(order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Orden no encontrada') {
          return res.status(404).json({ message: error.message });
        }
        if (error.message === 'No autorizado para ver esta orden') {
          return res.status(403).json({ message: error.message });
        }
      }
      next(error);
    }
  };
}

import { IOrderRepository, Order, CreateOrderItemDTO } from '../../domain/order.js';
import { prisma } from '../database/prismaClient.js';
import { Prisma, OrderStatus as PrismaOrderStatus } from '@prisma/client';

export class OrderRepository implements IOrderRepository {
  async createOrder(userId: string, items: CreateOrderItemDTO[]): Promise<Order> {
    if (!items || items.length === 0) {
      throw new Error('El pedido debe incluir al menos un producto');
    }

    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData: { mangaId: string; quantity: number; unitPrice: Prisma.Decimal }[] = [];

      for (const item of items) {
        if (!item.mangaId || item.quantity <= 0) {
          throw new Error('Cantidad no válida para uno o más productos');
        }

        const manga = await tx.manga.findUnique({
          where: { id: item.mangaId },
        });

        if (!manga) {
          throw new Error(`El manga solicitado no fue encontrado`);
        }

        if (manga.stock < item.quantity) {
          throw new Error(`Stock insuficiente para "${manga.title}". Disponibles: ${manga.stock}`);
        }

        const unitPriceNum = Number(manga.price);
        totalAmount += unitPriceNum * item.quantity;

        // Decremento atómico del stock dentro de la transacción
        await tx.manga.update({
          where: { id: item.mangaId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        orderItemsData.push({
          mangaId: item.mangaId,
          quantity: item.quantity,
          unitPrice: manga.price,
        });
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: new Prisma.Decimal(totalAmount),
          status: PrismaOrderStatus.COMPLETED,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              manga: true,
            },
          },
        },
      });

      return order as unknown as Order;
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
      },
    });

    return orders as unknown as Order[];
  }

  async findById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
      },
    });

    return order as unknown as Order | null;
  }
}


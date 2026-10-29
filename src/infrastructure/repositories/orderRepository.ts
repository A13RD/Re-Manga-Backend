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
        if (!item?.mangaId || typeof item.mangaId !== 'string' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new Error('Cantidad no válida para uno o más productos');
        }

        const manga = await tx.manga.findUnique({
          where: { id: item.mangaId },
        });

        if (!manga) {
          throw new Error('El manga solicitado no fue encontrado');
        }

        // Decremento condicional y atómico a nivel de fila (WHERE id = ? AND stock >= ?)
        // Protege contra condiciones de carrera en compras simultáneas para evitar stock negativo
        const updateResult = await tx.manga.updateMany({
          where: {
            id: item.mangaId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          const latestManga = await tx.manga.findUnique({ where: { id: item.mangaId } });
          const currentStock = latestManga?.stock ?? 0;
          throw new Error(`Stock insuficiente para "${manga.title}". Disponibles: ${currentStock}`);
        }

        const unitPriceNum = Number(manga.price);
        totalAmount += unitPriceNum * item.quantity;

        orderItemsData.push({
          mangaId: item.mangaId,
          quantity: item.quantity,
          unitPrice: manga.price,
        });
      }

      // El pedido se registra en estado PENDING coherente con el modelo de pago contraentrega
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: new Prisma.Decimal(totalAmount),
          status: PrismaOrderStatus.PENDING,
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

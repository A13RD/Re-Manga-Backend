import { IOrderRepository, Order, CreateOrderItemDTO } from '../domain/order.js';

export class OrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async createOrder(userId: string, items: CreateOrderItemDTO[]): Promise<Order> {
    return this.orderRepository.createOrder(userId, items);
  }

  async getMyOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async getOrderById(userId: string, orderId: string, isAdmin = false): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Orden no encontrada');
    }
    if (order.userId !== userId && !isAdmin) {
      throw new Error('No autorizado para ver esta orden');
    }
    return order;
  }
}


import { Manga } from './manga.js';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  mangaId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
  manga?: Manga;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItem[];
}

export interface CreateOrderItemDTO {
  mangaId: string;
  quantity: number;
}

export interface IOrderRepository {
  createOrder(userId: string, items: CreateOrderItemDTO[]): Promise<Order>;
  findByUserId(userId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
}


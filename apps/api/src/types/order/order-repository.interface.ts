import type { Order } from '../../modules/orders/entities/order';

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findByExecutorId(executorId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  create(data: Partial<Order>): Order;
  save(order: Order): Promise<Order>;
}

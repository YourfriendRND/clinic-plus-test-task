import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { ApplicationComponents } from '../../core/di/application-components';
import type { IOrderRepository } from '../../types/order/order-repository.interface';
import { Order } from './entities/order';

@injectable()
export class OrderRepository implements IOrderRepository {
  private readonly orders: Repository<Order>;

  public constructor(@inject(ApplicationComponents.DataSource) dataSource: DataSource) {
    this.orders = dataSource.getRepository(Order);
  }

  public findAll(): Promise<Order[]> {
    return this.orders.find({
      relations: { executor: true },
      order: { executionDate: 'DESC' },
    });
  }

  public findByExecutorId(executorId: string): Promise<Order[]> {
    return this.orders.find({
      where: { executor: { id: executorId } },
      relations: { executor: true },
      order: { executionDate: 'DESC' },
    });
  }

  public findById(id: string): Promise<Order | null> {
    return this.orders.findOne({ where: { id }, relations: { executor: true } });
  }

  public create(data: Partial<Order>): Order {
    return this.orders.create(data);
  }

  public save(order: Order): Promise<Order> {
    return this.orders.save(order);
  }
}

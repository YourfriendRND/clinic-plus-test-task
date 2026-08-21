import { inject, injectable } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import type { CreateOrderDto } from '../../types/order/create-order';
import type { IOrderRepository } from '../../types/order/order-repository.interface';
import type { IOrderService } from '../../types/order/order-service.interface';
import type { OrderView } from '../../types/order/order-view';
import type { UpdateOrderDto } from '../../types/order/update-order';
import type { SessionUser } from '../../types/session/session-user';
import { Order } from './entities/order';
import { OrderError } from './order-error';
import { OrderStatus } from './order-status.enum';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@injectable()
export class OrderService implements IOrderService {
  public constructor(
    @inject(ApplicationComponents.OrderRepository) private readonly orders: IOrderRepository,
  ) {}

  public async list(_user: SessionUser): Promise<OrderView[]> {
    const items = await this.orders.findAll();
    return items.map((order) => this.toView(order));
  }

  public async create(dto: CreateOrderDto): Promise<OrderView> {
    const address = this.requireText(dto.address, 'Укажите адрес');
    const executionDate = this.requireDate(dto.executionDate);
    const description = this.requireText(dto.description, 'Укажите описание');

    const saved = await this.orders.save(
      this.orders.create({
        address,
        executionDate,
        description,
        status: OrderStatus.New,
        executor: null,
      }),
    );

    return this.toView(saved);
  }

  public async update(id: string, dto: UpdateOrderDto): Promise<OrderView> {
    const order = await this.orders.findById(id);

    if (!order) {
      throw new OrderError('Наряд не найден', 404);
    }

    if (dto.address === undefined && dto.executionDate === undefined && dto.description === undefined) {
      throw new OrderError('Укажите адрес, дату или описание');
    }

    if (dto.address !== undefined) {
      order.address = this.requireText(dto.address, 'Укажите адрес');
    }

    if (dto.executionDate !== undefined) {
      order.executionDate = this.requireDate(dto.executionDate);
    }

    if (dto.description !== undefined) {
      order.description = this.requireText(dto.description, 'Укажите описание');
    }

    return this.toView(await this.orders.save(order));
  }

  private requireText(value: string | undefined, message: string): string {
    const text = value?.trim() ?? '';

    if (!text) {
      throw new OrderError(message);
    }

    return text;
  }

  private requireDate(value: string | undefined): string {
    const date = value?.trim() ?? '';

    if (!DATE_PATTERN.test(date)) {
      throw new OrderError('Укажите дату выполнения в формате YYYY-MM-DD');
    }

    return date;
  }

  private toView(order: Order): OrderView {
    const executionDate =
      typeof order.executionDate === 'string'
        ? order.executionDate.slice(0, 10)
        : new Date(order.executionDate).toISOString().slice(0, 10);

    return {
      id: order.id,
      address: order.address,
      executionDate,
      description: order.description,
      status: order.status,
      executor: order.executor
        ? { id: order.executor.id, fullName: order.executor.fullName }
        : null,
    };
  }
}

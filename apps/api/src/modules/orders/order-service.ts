import { inject, injectable } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import { DomainEvent } from '../../core/rabbitmq/domain-event.enum';
import { RoleCode } from '../auth/role-code.enum';
import type { AssignOrderDto } from './dto/assign-order';
import type { ChangeOrderStatusDto } from './dto/change-order-status';
import type { CreateOrderDto } from './dto/create-order';
import type { OrderView } from './dto/order-view';
import type { UpdateOrderDto } from './dto/update-order';
import type { IEventBus } from '../../types/common/event-bus.interface';
import type { IOrderRepository } from '../../types/order/order-repository.interface';
import type { IOrderService } from '../../types/order/order-service.interface';
import type { IUserService } from '../../types/user/user-service.interface';
import type { SessionUser } from '../auth/dto/session-user';
import { Order } from './entities/order';
import { OrderError } from './order-error';
import { OrderStatus } from './order-status.enum';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.New]: OrderStatus.InProgress,
  [OrderStatus.InProgress]: OrderStatus.Done,
};

function isOrderStatus(value: unknown): value is OrderStatus {
  return Object.values(OrderStatus).some((status) => status === value);
}

@injectable()
export class OrderService implements IOrderService {
  public constructor(
    @inject(ApplicationComponents.OrderRepository) private readonly orderRepository: IOrderRepository,
    @inject(ApplicationComponents.UserService) private readonly userService: IUserService,
    @inject(ApplicationComponents.EventBus) private readonly eventBus: IEventBus,
  ) {}

  public async list(_user: SessionUser): Promise<OrderView[]> {
    const items = await this.orderRepository.findAll();
    return items.map((order) => this.toView(order));
  }

  public async create(dto: CreateOrderDto): Promise<OrderView> {
    const address = this.requireText(dto.address, 'Укажите адрес');
    const executionDate = this.requireDate(dto.executionDate);
    const description = this.requireText(dto.description, 'Укажите описание');

    const saved = await this.orderRepository.save(
      this.orderRepository.create({
        address,
        executionDate,
        description,
        status: OrderStatus.New,
        executor: null,
      }),
    );

    const view = this.toView(saved);
    await this.eventBus.publish(DomainEvent.OrderCreated, view);
    return view;
  }

  public async update(id: string, dto: UpdateOrderDto): Promise<OrderView> {
    const order = await this.requireOrder(id);

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

    const view = this.toView(await this.orderRepository.save(order));
    await this.eventBus.publish(DomainEvent.OrderUpdated, view);
    return view;
  }

  public async assign(id: string, dto: AssignOrderDto): Promise<OrderView> {
    const order = await this.requireOrder(id);
    const executorId = dto?.executorId?.trim() ?? '';

    if (!executorId) {
      throw new OrderError('Укажите исполнителя');
    }

    const executor = await this.userService.findById(executorId);

    if (!executor) {
      throw new OrderError('Пользователь не найден', 404);
    }

    if (executor.role.code !== RoleCode.Team) {
      throw new OrderError('Можно назначить только на бригаду');
    }

    order.executor = executor;
    const view = this.toView(await this.orderRepository.save(order));
    await this.eventBus.publish(DomainEvent.OrderAssigned, view);
    return view;
  }

  public async changeStatus(id: string, dto: ChangeOrderStatusDto, user: SessionUser): Promise<OrderView> {
    const order = await this.requireOrder(id);

    if (!order.executor || order.executor.id !== user.id) {
      throw new OrderError('Наряд не назначен вашей бригаде', 403);
    }

    const requested = dto?.status;

    if (!isOrderStatus(requested)) {
      throw new OrderError('Укажите статус in_progress или done');
    }

    if (NEXT_STATUS[order.status] !== requested) {
      throw new OrderError('Статус меняется только new => in_progress => done');
    }

    order.status = requested;
    const view = this.toView(await this.orderRepository.save(order));
    await this.eventBus.publish(DomainEvent.OrderStatusChanged, view);
    return view;
  }

  private async requireOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new OrderError('Наряд не найден', 404);
    }

    return order;
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

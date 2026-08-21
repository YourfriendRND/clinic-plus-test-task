import type { SessionUser } from '../session/session-user';
import type { CreateOrderDto } from './create-order';
import type { OrderView } from './order-view';
import type { UpdateOrderDto } from './update-order';

export interface IOrderService {
  list(user: SessionUser): Promise<OrderView[]>;
  create(dto: CreateOrderDto): Promise<OrderView>;
  update(id: string, dto: UpdateOrderDto): Promise<OrderView>;
}

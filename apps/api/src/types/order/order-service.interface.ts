import type { SessionUser } from '../../modules/auth/dto/session-user';
import type { AssignOrderDto } from '../../modules/orders/dto/assign-order';
import type { ChangeOrderStatusDto } from '../../modules/orders/dto/change-order-status';
import type { CreateOrderDto } from '../../modules/orders/dto/create-order';
import type { OrderView } from '../../modules/orders/dto/order-view';
import type { UpdateOrderDto } from '../../modules/orders/dto/update-order';

export interface IOrderService {
  list(user: SessionUser): Promise<OrderView[]>;
  create(dto: CreateOrderDto): Promise<OrderView>;
  update(id: string, dto: UpdateOrderDto): Promise<OrderView>;
  assign(id: string, dto: AssignOrderDto): Promise<OrderView>;
  changeStatus(id: string, dto: ChangeOrderStatusDto, user: SessionUser): Promise<OrderView>;
}

import type { OrderStatus } from '../order-status.enum';

export type ChangeOrderStatusDto = {
  status: OrderStatus;
};

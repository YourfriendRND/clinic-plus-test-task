import type { OrderStatus } from './order-status.enum';

export type ChangeOrderStatusBody = {
  status: OrderStatus;
};

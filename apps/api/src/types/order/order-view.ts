import type { OrderStatus } from '../../modules/orders/order-status.enum';

export type OrderExecutorView = {
  id: string;
  fullName: string;
};

export type OrderView = {
  id: string;
  address: string;
  executionDate: string;
  description: string;
  status: OrderStatus;
  executor: OrderExecutorView | null;
};

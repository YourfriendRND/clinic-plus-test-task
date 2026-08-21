import type { OrderStatus } from '../order-status.enum';

type OrderExecutorView = {
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

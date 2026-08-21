import type { OrderStatus } from './order-status.enum';

type OrderExecutor = {
  id: string;
  fullName: string;
};

export type Order = {
  id: string;
  address: string;
  executionDate: string;
  description: string;
  status: OrderStatus;
  executor: OrderExecutor | null;
};

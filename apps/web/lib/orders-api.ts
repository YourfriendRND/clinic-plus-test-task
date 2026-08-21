import { apiRequest } from './api';
import type { AssignOrderBody } from './assign-order';
import type { ChangeOrderStatusBody } from './change-order-status';
import type { CreateOrderBody } from './create-order';
import type { Order } from './order';
import type { UpdateOrderBody } from './update-order';

export function listOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders');
}

export function createOrder(body: CreateOrderBody): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateOrder(id: string, body: UpdateOrderBody): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function assignOrder(id: string, body: AssignOrderBody): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function changeOrderStatus(id: string, body: ChangeOrderStatusBody): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { AssignOrderBody } from '../lib/assign-order';
import type { ChangeOrderStatusBody } from '../lib/change-order-status';
import type { CreateOrderBody } from '../lib/create-order';
import {
  assignOrder,
  changeOrderStatus,
  createOrder,
  listOrders,
  updateOrder,
} from '../lib/orders-api';
import type { UpdateOrderBody } from '../lib/update-order';
import { queryKeys } from '../lib/query-keys';

async function refreshOrders(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: listOrders,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOrderBody) => createOrder(body),
    onSuccess: async () => {
      await refreshOrders(queryClient);
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOrderBody }) => updateOrder(id, body),
    onSuccess: async () => {
      await refreshOrders(queryClient);
    },
  });
}

export function useAssignOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignOrderBody }) => assignOrder(id, body),
    onSuccess: async () => {
      await refreshOrders(queryClient);
    },
  });
}

export function useChangeOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ChangeOrderStatusBody }) =>
      changeOrderStatus(id, body),
    onSuccess: async () => {
      await refreshOrders(queryClient);
    },
  });
}

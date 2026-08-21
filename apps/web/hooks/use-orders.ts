import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateOrderBody } from '../lib/create-order';
import { createOrder, listOrders, updateOrder } from '../lib/orders-api';
import type { UpdateOrderBody } from '../lib/update-order';

import { queryKeys } from '../lib/query-keys';

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
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOrderBody }) => updateOrder(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

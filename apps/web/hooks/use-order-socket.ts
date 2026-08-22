import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DomainEvent } from '../lib/domain-event.enum';
import type { Order } from '../lib/order';
import { createOrderSocket } from '../lib/order-socket';
import { playDeliveredSound } from '../lib/play-delivered-sound';
import { queryKeys } from '../lib/query-keys';
import { RoleCode } from '../lib/role-code.enum';
import type { SessionUser } from '../lib/session-user';

const ORDER_EVENTS = Object.values(DomainEvent);

function shouldPlaySound(event: DomainEvent, order: Order, user: SessionUser): boolean {
  if (user.roleCode !== RoleCode.Team) {
    return false;
  }

  if (order.executor?.id !== user.id) {
    return false;
  }

  return event !== DomainEvent.OrderStatusChanged;
}

function isOrder(value: unknown): value is Order {
  return Boolean(value && typeof value === 'object' && 'id' in value && typeof (value as Order).id === 'string');
}

export function useOrderSocket(
  user: SessionUser,
  onEvent: (event: DomainEvent, order: Order) => void,
): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = createOrderSocket();

    socket.on('connect_error', (error) => {
      console.warn('Socket connect_error', error.message);
    });

    function handleEvent(event: DomainEvent, payload: unknown) {
      if (!isOrder(payload)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      onEvent(event, payload);

      if (shouldPlaySound(event, payload, user)) {
        playDeliveredSound();
      }
    }

    for (const event of ORDER_EVENTS) {
      socket.on(event, (payload: unknown) => {
        handleEvent(event, payload);
      });
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [onEvent, queryClient, user]);
}


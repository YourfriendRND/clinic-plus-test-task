'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useOrderSocket } from '../../hooks/use-order-socket';
import type { DomainEvent } from '../../lib/domain-event.enum';
import type { Order } from '../../lib/order';
import type { SessionUser } from '../../lib/session-user';

type OrderLiveValue = {
  token: number;
  event: DomainEvent | null;
  order: Order | null;
};

type OrderLiveProviderProps = {
  user: SessionUser;
  children: ReactNode;
};

const OrderLiveContext = createContext<OrderLiveValue>({
  token: 0,
  event: null,
  order: null,
});

export function OrderLiveProvider({ user, children }: OrderLiveProviderProps) {
  const [live, setLive] = useState<OrderLiveValue>({
    token: 0,
    event: null,
    order: null,
  });

  const handleEvent = useCallback((event: DomainEvent, order: Order) => {
    setLive((current) => ({
      token: current.token + 1,
      event,
      order,
    }));
  }, []);

  useOrderSocket(user, handleEvent);

  const value = useMemo(() => live, [live]);

  return <OrderLiveContext.Provider value={value}>{children}</OrderLiveContext.Provider>;
}

export function useOrderLive(): OrderLiveValue {
  return useContext(OrderLiveContext);
}

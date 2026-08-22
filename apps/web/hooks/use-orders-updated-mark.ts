import { useEffect, useRef, useState } from 'react';
import { useOrderLive } from '../components/orders/order-live-provider';
import type { DomainEvent } from '../lib/domain-event.enum';
import type { Order } from '../lib/order';

export function useOrdersUpdatedMark(
  shouldShow: (event: DomainEvent, order: Order) => boolean,
): { token: number; visible: boolean; hide: () => void } {
  const live = useOrderLive();
  const [token, setToken] = useState(0);
  const seenToken = useRef(live.token);

  useEffect(() => {
    if (live.token === seenToken.current) {
      return;
    }

    seenToken.current = live.token;

    if (!live.event || !live.order || !shouldShow(live.event, live.order)) {
      return;
    }

    setToken(live.token);
  }, [live, shouldShow]);

  return {
    token,
    visible: token > 0,
    hide() {
      setToken(0);
    },
  };
}

'use client';

import { useCallback, useState } from 'react';
import { useChangeOrderStatus, useOrders } from '../../hooks/use-orders';
import { useOrdersUpdatedMark } from '../../hooks/use-orders-updated-mark';
import { useSession } from '../../hooks/use-session';
import { ApiError } from '../../lib/api-error';
import type { DomainEvent } from '../../lib/domain-event.enum';
import type { Order } from '../../lib/order';
import { OrderStatus } from '../../lib/order-status.enum';
import { OrderTable } from './order-table';
import { OrdersUpdatedMark } from './orders-updated-mark';
import './orders-page.css';

type TeamOrdersViewProps = {
  scope: 'mine' | 'all';
};

export function TeamOrdersView({ scope }: TeamOrdersViewProps) {
  const session = useSession();
  const ordersQuery = useOrders();
  const changeStatus = useChangeOrderStatus();
  const [error, setError] = useState('');
  const userId = session.data?.id;
  const shouldShowUpdated = useCallback(
    (_event: DomainEvent, order: Order) => scope === 'all' || order.executor?.id === userId,
    [scope, userId],
  );
  const updatedMark = useOrdersUpdatedMark(shouldShowUpdated);
  const orders = ordersQuery.data ?? [];
  const rows = scope === 'mine' ? orders.filter((order) => order.executor?.id === userId) : orders;
  const loading = session.isPending || ordersQuery.isPending;
  const failed = session.isError || ordersQuery.isError;
  const ready = session.isSuccess && ordersQuery.isSuccess;
  const title = scope === 'mine' ? 'Мои наряды' : 'Все наряды';
  const empty = scope === 'mine' ? 'Нет назначенных нарядов' : 'Нарядов нет';
  const canAct = scope === 'mine';

  async function handleStatus(order: Order, status: OrderStatus) {
    setError('');

    try {
      await changeStatus.mutateAsync({ id: order.id, body: { status } });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось сменить статус');
    }
  }

  function renderAction(order: Order) {
    if (order.status === OrderStatus.New) {
      return {
        label: 'Взять в работу',
        disabled: changeStatus.isPending,
        onClick: () => {
          void handleStatus(order, OrderStatus.InProgress);
        },
      };
    }

    if (order.status === OrderStatus.InProgress) {
      return {
        label: 'Выполнить',
        disabled: changeStatus.isPending,
        onClick: () => {
          void handleStatus(order, OrderStatus.Done);
        },
      };
    }

    return null;
  }

  return (
    <main className="orders-page">
      <div className="orders-page__heading">
        <h1 className="orders-page__title">{title}</h1>
        <OrdersUpdatedMark
          token={updatedMark.token}
          visible={updatedMark.visible}
          onHide={updatedMark.hide}
        />
      </div>
      {error ? <p className="orders-page__error">{error}</p> : null}
      <div className="orders-page__panel">
        {loading ? <p className="orders-page__empty">Загрузка…</p> : null}
        {failed ? <p className="orders-page__empty">Не удалось загрузить наряды</p> : null}
        {ready && rows.length === 0 ? <p className="orders-page__empty">{empty}</p> : null}
        {ready && rows.length > 0 ? (
          <OrderTable orders={rows} renderAction={canAct ? renderAction : undefined} />
        ) : null}
      </div>
    </main>
  );
}

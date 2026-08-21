'use client';

import { useOrders } from '../../hooks/use-orders';
import { useSession } from '../../hooks/use-session';
import { OrderTable } from './order-table';
import './orders-page.css';

type TeamOrdersViewProps = {
  scope: 'mine' | 'all';
};

export function TeamOrdersView({ scope }: TeamOrdersViewProps) {
  const session = useSession();
  const ordersQuery = useOrders();
  const userId = session.data?.id;
  const orders = ordersQuery.data ?? [];
  const rows = scope === 'mine' ? orders.filter((order) => order.executor?.id === userId) : orders;
  const loading = session.isPending || ordersQuery.isPending;
  const failed = session.isError || ordersQuery.isError;
  const ready = session.isSuccess && ordersQuery.isSuccess;
  const title = scope === 'mine' ? 'Мои наряды' : 'Все наряды';
  const empty = scope === 'mine' ? 'Нет назначенных нарядов' : 'Нарядов нет';

  return (
    <main className="orders-page">
      <h1 className="orders-page__title">{title}</h1>
      <div className="orders-page__panel">
        {loading ? <p className="orders-page__empty">Загрузка…</p> : null}
        {failed ? <p className="orders-page__empty">Не удалось загрузить наряды</p> : null}
        {ready && rows.length === 0 ? <p className="orders-page__empty">{empty}</p> : null}
        {ready && rows.length > 0 ? <OrderTable orders={rows} /> : null}
      </div>
    </main>
  );
}

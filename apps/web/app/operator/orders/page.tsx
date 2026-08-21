'use client';

import { useState } from 'react';
import { OrderModal } from '../../../components/orders/order-modal';
import { OrderTable } from '../../../components/orders/order-table';
import { Button } from '../../../components/ui/button';
import { useCreateOrder, useOrders, useUpdateOrder } from '../../../hooks/use-orders';
import { ApiError } from '../../../lib/api-error';
import type { Order } from '../../../lib/order';
import '../../../components/orders/orders-page.css';

export default function OperatorOrdersPage() {
  const ordersQuery = useOrders();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);

  const pending = createOrder.isPending || updateOrder.isPending;
  const orders = ordersQuery.data ?? [];

  function flashUpdated() {
    setUpdated(true);
    window.setTimeout(() => setUpdated(false), 2000);
  }

  function openCreate() {
    setEditing(null);
    setError('');
    setModalOpen(true);
  }

  function openEdit(order: Order) {
    setEditing(order);
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    if (pending) {
      return;
    }

    setModalOpen(false);
    setError('');
  }

  async function handleSubmit(values: { address: string; executionDate: string; description: string }) {
    setError('');

    try {
      if (editing) {
        await updateOrder.mutateAsync({ id: editing.id, body: values });
      } else {
        await createOrder.mutateAsync(values);
      }

      setModalOpen(false);
      flashUpdated();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось сохранить наряд');
    }
  }

  return (
    <main className="orders-page">
      <div className="orders-page__toolbar">
        <div className="orders-page__heading">
          <h1 className="orders-page__title">Наряды</h1>
          {updated ? <span className="orders-page__updated">Обновлено</span> : null}
        </div>
        <Button onClick={openCreate}>Создать наряд</Button>
      </div>
      <div className="orders-page__panel">
        {ordersQuery.isPending ? <p className="orders-page__empty">Загрузка…</p> : null}
        {ordersQuery.isError ? <p className="orders-page__empty">Не удалось загрузить наряды</p> : null}
        {ordersQuery.isSuccess && orders.length === 0 ? (
          <div className="orders-page__empty-state">
            <p className="orders-page__empty">Нарядов нет</p>
            <Button onClick={openCreate}>Создать наряд</Button>
          </div>
        ) : null}
        {ordersQuery.isSuccess && orders.length > 0 ? <OrderTable orders={orders} onEdit={openEdit} /> : null}
      </div>
      <OrderModal
        open={modalOpen}
        order={editing}
        pending={pending}
        error={error}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

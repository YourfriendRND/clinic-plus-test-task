'use client';

import { useState } from 'react';
import { OrderModal, type OrderFormValues } from '../../../components/orders/order-modal';
import { OrderTable } from '../../../components/orders/order-table';
import { OrdersUpdatedMark } from '../../../components/orders/orders-updated-mark';
import { Button } from '../../../components/ui/button';
import { useAssignOrder, useCreateOrder, useOrders, useUpdateOrder } from '../../../hooks/use-orders';
import { useOrdersUpdatedMark } from '../../../hooks/use-orders-updated-mark';
import { useTeams } from '../../../hooks/use-teams';
import { ApiError } from '../../../lib/api-error';
import type { Order } from '../../../lib/order';
import '../../../components/orders/orders-page.css';

export default function OperatorOrdersPage() {
  const ordersQuery = useOrders();
  const teamsQuery = useTeams();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const assignOrder = useAssignOrder();
  const updatedMark = useOrdersUpdatedMark(() => true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const pending = createOrder.isPending || updateOrder.isPending || assignOrder.isPending;
  const orders = ordersQuery.data ?? [];
  const teams = teamsQuery.data ?? [];

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

  async function handleSubmit(values: OrderFormValues) {
    setError('');
    const body = {
      address: values.address,
      executionDate: values.executionDate,
      description: values.description,
    };

    try {
      const saved = editing
        ? await updateOrder.mutateAsync({ id: editing.id, body })
        : await createOrder.mutateAsync(body);

      if (values.executorId && values.executorId !== saved.executor?.id) {
        await assignOrder.mutateAsync({ id: saved.id, body: { executorId: values.executorId } });
      }

      setModalOpen(false);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось сохранить наряд');
    }
  }

  return (
    <main className="orders-page">
      <div className="orders-page__toolbar">
        <div className="orders-page__heading">
          <h1 className="orders-page__title">Наряды</h1>
          <OrdersUpdatedMark
            token={updatedMark.token}
            visible={updatedMark.visible}
            onHide={updatedMark.hide}
          />
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
        {ordersQuery.isSuccess && orders.length > 0 ? (
          <OrderTable
            orders={orders}
            renderAction={(order) => ({
              label: 'Изменить',
              onClick: () => openEdit(order),
            })}
          />
        ) : null}
      </div>
      <OrderModal
        open={modalOpen}
        order={editing}
        teams={teams}
        pending={pending}
        error={error}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

import { formatDate } from '../../lib/format-date';
import type { Order } from '../../lib/order';
import { StatusBadge } from '../ui/badge';
import './order-table.css';

type OrderTableProps = {
  orders: Order[];
  onEdit?: (order: Order) => void;
};

export function OrderTable({ orders, onEdit }: OrderTableProps) {
  return (
    <table className="order-table">
      <thead>
        <tr>
          <th className="order-table__head">Адрес</th>
          <th className="order-table__head">Дата выполнения</th>
          <th className="order-table__head">Исполнитель</th>
          <th className="order-table__head">Статус</th>
          <th className="order-table__head">Описание</th>
          {onEdit ? <th className="order-table__head">Действие</th> : null}
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="order-table__row">
            <td className="order-table__cell">{order.address}</td>
            <td className="order-table__cell">{formatDate(order.executionDate)}</td>
            <td className={`order-table__cell${order.executor ? '' : ' order-table__cell--muted'}`}>
              {order.executor?.fullName ?? 'Не назначен'}
            </td>
            <td className="order-table__cell">
              <StatusBadge status={order.status} />
            </td>
            <td className="order-table__cell order-table__cell--ellipsis">{order.description}</td>
            {onEdit ? (
              <td className="order-table__cell">
                <button type="button" className="order-table__action" onClick={() => onEdit(order)}>
                  Изменить
                </button>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

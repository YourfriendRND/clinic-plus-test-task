import { formatDate } from '../../lib/format-date';
import type { Order } from '../../lib/order';
import { StatusBadge } from '../ui/badge';
import './order-table.css';

export type OrderRowAction = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

type OrderTableProps = {
  orders: Order[];
  renderAction?: (order: Order) => OrderRowAction | null;
};

export function OrderTable({ orders, renderAction }: OrderTableProps) {
  return (
    <table className="order-table">
      <thead>
        <tr>
          <th className="order-table__head">Адрес</th>
          <th className="order-table__head">Дата выполнения</th>
          <th className="order-table__head">Исполнитель</th>
          <th className="order-table__head">Статус</th>
          <th className="order-table__head">Описание</th>
          {renderAction ? <th className="order-table__head">Действие</th> : null}
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const action = renderAction?.(order) ?? null;

          return (
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
              {renderAction ? (
                <td className="order-table__cell">
                  {action ? (
                    <button
                      type="button"
                      className="order-table__action"
                      disabled={action.disabled}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </button>
                  ) : null}
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

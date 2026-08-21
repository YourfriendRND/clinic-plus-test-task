import { OrderStatus } from '../../lib/order-status.enum';
import './badge.css';

const labels: Record<OrderStatus, string> = {
  [OrderStatus.New]: 'Новый',
  [OrderStatus.InProgress]: 'В работе',
  [OrderStatus.Done]: 'Выполнен',
};

type StatusBadgeProps = {
  status: OrderStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge badge--${status.replace('_', '-')}`}>{labels[status]}</span>;
}

import { useEffect, useState, type FormEvent } from 'react';
import type { Order } from '../../lib/order';
import type { Team } from '../../lib/team';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { SelectField } from '../ui/select-field';
import { TextArea } from '../ui/textarea';
import { TextField } from '../ui/text-field';
import './order-modal.css';

const UNASSIGNED = '';

export type OrderFormValues = {
  address: string;
  executionDate: string;
  description: string;
  executorId: string;
};

type OrderModalProps = {
  open: boolean;
  order: Order | null;
  teams: Team[];
  pending: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => void;
};

export function OrderModal({
  open,
  order,
  teams,
  pending,
  error,
  onClose,
  onSubmit,
}: OrderModalProps) {
  const [address, setAddress] = useState('');
  const [executionDate, setExecutionDate] = useState('');
  const [description, setDescription] = useState('');
  const [executorId, setExecutorId] = useState(UNASSIGNED);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAddress(order?.address ?? '');
    setExecutionDate(order?.executionDate.slice(0, 10) ?? '');
    setDescription(order?.description ?? '');
    setExecutorId(order?.executor?.id ?? UNASSIGNED);
  }, [open, order]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ address, executionDate, description, executorId });
  }

  return (
    <Modal
      open={open}
      title={order ? 'Редактировать наряд' : 'Создать наряд'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" disabled={pending} onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="order-form" disabled={pending}>
            Сохранить
          </Button>
        </>
      }
    >
      <form id="order-form" className="order-modal" onSubmit={handleSubmit}>
        <TextField
          label="Адрес"
          name="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <TextField
          label="Дата выполнения"
          name="executionDate"
          type="date"
          value={executionDate}
          onChange={(event) => setExecutionDate(event.target.value)}
        />
        <TextArea
          label="Описание"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <SelectField
          label="Исполнитель"
          name="executor"
          value={executorId}
          options={[
            { value: UNASSIGNED, label: 'Не назначен' },
            ...teams.map((team) => ({ value: team.id, label: team.fullName })),
          ]}
          onChange={setExecutorId}
        />
        {error ? <p className="order-modal__error">{error}</p> : null}
      </form>
    </Modal>
  );
}

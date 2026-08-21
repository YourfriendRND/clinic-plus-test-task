import { useEffect, useState, type FormEvent } from 'react';
import type { Order } from '../../lib/order';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { SelectField } from '../ui/select-field';
import { TextArea } from '../ui/textarea';
import { TextField } from '../ui/text-field';
import './order-modal.css';

type OrderModalProps = {
  open: boolean;
  order: Order | null;
  pending: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: { address: string; executionDate: string; description: string }) => void;
};

export function OrderModal({ open, order, pending, error, onClose, onSubmit }: OrderModalProps) {
  const [address, setAddress] = useState('');
  const [executionDate, setExecutionDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setAddress(order?.address ?? '');
    setExecutionDate(order?.executionDate.slice(0, 10) ?? '');
    setDescription(order?.description ?? '');
  }, [open, order]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ address, executionDate, description });
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
        <SelectField label="Исполнитель" name="executor" disabled value="current">
          <option value="current">{order?.executor?.fullName ?? 'Не назначен'}</option>
        </SelectField>
        {error ? <p className="order-modal__error">{error}</p> : null}
      </form>
    </Modal>
  );
}

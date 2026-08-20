import type { FormEvent } from 'react';
import { Button } from '../ui/button';
import { TextField } from '../ui/text-field';
import './verify-form.css';

type VerifyFormProps = {
  code: string;
  error: string;
  pending: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function VerifyForm({
  code,
  error,
  pending,
  onCodeChange,
  onSubmit,
  onBack,
}: VerifyFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="verify-form" onSubmit={handleSubmit}>
      <div className="verify-form__header">
        <h1 className="verify-form__title">Подтверждение входа</h1>
        <p className="verify-form__hint">
          Введите код из сообщения. В режиме разработки код смотрите в логе API.
        </p>
      </div>
      <TextField
        label="Код"
        name="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
      />
      {error ? <p className="verify-form__error">{error}</p> : null}
      <div className="verify-form__actions">
        <Button type="submit" disabled={pending}>
          Подтвердить
        </Button>
        <Button variant="ghost" disabled={pending} onClick={onBack}>
          Назад
        </Button>
      </div>
    </form>
  );
}

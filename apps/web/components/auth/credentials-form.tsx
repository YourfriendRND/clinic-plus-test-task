import type { FormEvent } from 'react';
import { Button } from '../ui/button';
import { TextField } from '../ui/text-field';
import './credentials-form.css';

type CredentialsFormProps = {
  phone: string;
  password: string;
  error: string;
  pending: boolean;
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function CredentialsForm({
  phone,
  password,
  error,
  pending,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
}: CredentialsFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="credentials-form" onSubmit={handleSubmit}>
      <h1 className="credentials-form__title">Вход</h1>
      <div className="credentials-form__fields">
        <TextField
          label="Телефон"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+79001111111"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
      </div>
      {error ? <p className="credentials-form__error">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        Войти
      </Button>
    </form>
  );
}

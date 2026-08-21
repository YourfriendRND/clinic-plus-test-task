import type { InputHTMLAttributes } from 'react';
import './text-field.css';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, id, className, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name;
  const controlClass = ['text-field__control', className].filter(Boolean).join(' ');

  return (
    <label className="text-field" htmlFor={fieldId}>
      <span className="text-field__label">{label}</span>
      <input id={fieldId} className={controlClass} {...props} />
    </label>
  );
}

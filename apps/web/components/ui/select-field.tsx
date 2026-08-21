import type { SelectHTMLAttributes } from 'react';
import './select-field.css';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function SelectField({ label, id, className, children, ...props }: SelectFieldProps) {
  const fieldId = id ?? props.name;
  const controlClass = ['select-field__control', className].filter(Boolean).join(' ');

  return (
    <label className="select-field" htmlFor={fieldId}>
      <span className="select-field__label">{label}</span>
      <select id={fieldId} className={controlClass} {...props}>
        {children}
      </select>
    </label>
  );
}

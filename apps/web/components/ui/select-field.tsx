'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './select-field.css';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function SelectField({ label, name, value, options, disabled, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function handleSelect(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="select-field" ref={rootRef}>
      <span className="select-field__label" id={`${listId}-label`}>
        {label}
      </span>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className={`select-field__control${open ? ' select-field__control--open' : ''}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label ?? ''}</span>
      </button>
      {open ? (
        <ul className="select-field__list" role="listbox" aria-labelledby={`${listId}-label`}>
          {options.map((option) => (
            <li key={option.value || 'unassigned'} role="none">
              <button
                type="button"
                className={`select-field__option${option.value === value ? ' select-field__option--active' : ''}`}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

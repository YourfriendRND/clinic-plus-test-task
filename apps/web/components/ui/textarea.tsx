import type { TextareaHTMLAttributes } from 'react';
import './textarea.css';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextArea({ label, id, className, ...props }: TextAreaProps) {
  const fieldId = id ?? props.name;
  const controlClass = ['textarea__control', className].filter(Boolean).join(' ');

  return (
    <label className="textarea" htmlFor={fieldId}>
      <span className="textarea__label">{label}</span>
      <textarea id={fieldId} className={controlClass} rows={3} {...props} />
    </label>
  );
}

import type { ButtonHTMLAttributes } from 'react';
import './button.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ');

  return <button type={type} className={classes} {...props} />;
}

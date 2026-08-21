import type { ReactNode } from 'react';
import './modal.css';

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

export function Modal({ title, open, onClose, children, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal">
      <button type="button" className="modal__overlay" aria-label="Закрыть" onClick={onClose} />
      <div className="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 className="modal__title" id="modal-title">
          {title}
        </h2>
        {children}
        <div className="modal__footer">{footer}</div>
      </div>
    </div>
  );
}

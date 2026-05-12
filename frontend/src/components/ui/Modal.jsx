import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  if (!isOpen) return null;

  const maxWidth = size === 'lg' ? '680px' : size === 'sm' ? '380px' : '520px';

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

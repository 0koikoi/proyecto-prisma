/**
 * Componente modal base reutilizable.
 */
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '520px' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1c1c1c] m-0">{title}</h3>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1c1c1c] hover:bg-[#f5f5f5] transition-colors cursor-pointer border-none bg-transparent"
            onClick={onClose}
            type="button"
            aria-label="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

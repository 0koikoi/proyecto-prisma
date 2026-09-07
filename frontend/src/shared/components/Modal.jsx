/**
 * RESPONSABLE: Todos los integrantes
 *
 * Componente Modal reutilizable con Tailwind.
 * Cierra al hacer clic en el overlay. maxWidth es configurable por cada uso.
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
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            className="text-gray-400 hover:text-gray-700 transition-colors"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-[#059669] shrink-0" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-[#d97706] shrink-0" />;
      case 'error':
        return <XCircle size={18} className="text-[#dc2626] shrink-0" />;
      default:
        return <Info size={18} className="text-[#d6efff] shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Contenedor flotante de notificaciones */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className="pointer-events-auto bg-[#1c1c1c] text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3 transform transition-all duration-300 animate-in fade-in slide-in-from-top-2"
            role="alert"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getIcon(type)}
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-100 leading-snug truncate">
                {message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors border-none bg-transparent cursor-pointer shrink-0"
              aria-label="Cerrar notificación"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

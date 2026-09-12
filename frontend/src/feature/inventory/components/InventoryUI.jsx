import { useEffect, useId, useRef, useState } from 'react';
import { ImageOff, X } from 'lucide-react';
import '../design/inventario.tailwind.css';

export const controlClass = 'inv-control';
export const panelClass = 'inv-panel';

export function InventoryButton({ secondary = false, className = '', type = 'button', ...props }) {
  const variant = secondary ? 'inv-button--secondary' : 'inv-button--primary';
  return <button type={type} className={`inv-button ${variant} ${className}`} {...props} />;
}

export function InventoryField({ label, error, id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return <div className="flex min-w-0 flex-col gap-1.5">
    <label className="text-xs font-semibold" htmlFor={inputId}>{label}{props.required ? ' *' : ''}</label>
    <input id={inputId} className={controlClass} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} {...props} />
    {error && <p id={`${inputId}-error`} role="alert" className="border-l-2 border-[var(--inv-color-primary)] pl-2 text-xs font-medium">{error}</p>}
  </div>;
}

export function InventoryModal({ title, onClose, busy = false, children }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    className="inv-dialog m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-[620px] overflow-y-auto rounded-xl border border-[var(--inv-color-primary)]/20 p-0 text-[color:var(--inv-color-primary)] shadow-2xl backdrop:bg-[var(--inv-color-primary)]/60 backdrop:backdrop-blur-sm">
    <div className="inv-dialog-header sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--inv-color-primary)]/20 px-5 py-4">
      <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
      <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar modal" className="rounded p-1 hover:bg-[var(--inv-color-primary)]/10 disabled:opacity-40"><X size={20} /></button>
    </div>
    <div className="p-5">{children}</div>
  </dialog>;
}

function Thumbnail({ src, name, className }) {
  const [failed, setFailed] = useState(false);
  return <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--inv-color-primary)]/20 bg-white/40 ${className}`}>
    {src && !failed ? <img src={src} alt={name} onError={() => setFailed(true)} className="h-full w-full object-cover" /> :
      <span role="img" aria-label={src ? 'No se pudo cargar la imagen' : 'Sin imagen'} title={src ? 'No se pudo cargar la imagen' : 'Sin imagen'}><ImageOff size={20} /></span>}
  </div>;
}
export function ProductImage({ src, name = 'Imagen del producto', className = 'h-10 w-10' }) {
  return <Thumbnail key={src || 'empty'} src={src} name={name} className={className} />;
}

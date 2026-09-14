import { useState } from 'react';
import { Edit } from 'lucide-react';
import { InventoryButton, InventoryField, InventoryModal } from './InventoryUI';

export function CategoryModal({ categories, onClose, onSave }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const reset = () => { setEditing(null); setForm({ name: '', description: '' }); setError(''); };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const name = form.name.trim();
    if (!name) { setError('Ingresa el nombre de la categoría.'); return; }
    if (categories.some((c) => c.id !== editing && c.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('Ya existe una categoría con ese nombre.'); return;
    }
    setSaving(true); setError(''); setStatus('');
    try {
      await onSave(editing, { name, description: form.description.trim() });
      reset(); setStatus('Categoría guardada.');
    } catch (err) { setError(err.message || 'No se pudo guardar la categoría.'); }
    finally { setSaving(false); }
  };
  return <InventoryModal title="Gestionar categorías" onClose={onClose} busy={saving}>
    <ul className="mb-5 divide-y divide-[#1C1C1C]/15 rounded-lg border border-[#1C1C1C]/20">
      {categories.map((category) => <li key={category.id} className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{category.name}</p><p className="break-words text-xs">{category.description}</p></div>
        <button type="button" disabled={saving} aria-label={`Editar categoría ${category.name}`} onClick={() => { setEditing(category.id); setForm({ name: category.name, description: category.description || '' }); setError(''); setStatus(''); }} className="rounded p-2 hover:bg-[#1C1C1C]/10"><Edit size={16} /></button>
      </li>)}
      {!categories.length && <li className="p-3 text-sm">Todavía no hay categorías.</li>}
    </ul>
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{editing ? 'Editar categoría' : 'Nueva categoría'}</h3>
      <InventoryField label="Nombre" value={form.name} required disabled={saving} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(''); }} />
      <InventoryField label="Descripción (opcional)" value={form.description} disabled={saving} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      {error && <p role="alert" className="text-sm font-semibold">{error}</p>}
      {status && <p role="status" className="text-sm">{status}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        {editing && <InventoryButton secondary disabled={saving} onClick={reset}>Cancelar edición</InventoryButton>}
        <InventoryButton disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar categoría'}</InventoryButton>
      </div>
    </form>
    <div className="mt-5 flex justify-end border-t border-[#1C1C1C]/20 pt-4"><InventoryButton secondary disabled={saving} onClick={onClose}>Cerrar</InventoryButton></div>
  </InventoryModal>;
}

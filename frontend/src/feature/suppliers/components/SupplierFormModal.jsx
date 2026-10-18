/**
 * Modal para creación y edición de proveedores y talleres.
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Building2, User, Phone, Mail, FileText, MapPin } from 'lucide-react';

export const SupplierFormModal = ({ isOpen, onClose, onSave, supplierToEdit }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxIdType, setTaxIdType] = useState('RUC');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setCompanyName(supplierToEdit.companyName || '');
        setContactName(supplierToEdit.contactName || '');
        setPhone(supplierToEdit.phone || '');
        setEmail(supplierToEdit.email || '');
        setTaxIdType(supplierToEdit.taxIdType || 'RUC');
        setTaxId(supplierToEdit.taxId || '');
        setAddress(supplierToEdit.address || '');
        setNotes(supplierToEdit.notes || '');
      } else {
        setCompanyName('');
        setContactName('');
        setPhone('');
        setEmail('');
        setTaxIdType('RUC');
        setTaxId('');
        setAddress('');
        setNotes('');
      }
      setErrorMsg('');
    }
  }, [isOpen, supplierToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('La razón social o nombre del taller es obligatorio');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('El teléfono principal de contacto es obligatorio');
      return;
    }

    const hasTaxId = taxId.trim().length > 0;

    const supplierData = {
      ...(supplierToEdit ? { id: supplierToEdit.id } : {}),
      companyName: companyName.trim(),
      contactName: contactName.trim() || null,
      phone: phone.trim(),
      email: email.trim() || null,
      taxIdType: hasTaxId ? taxIdType : null,
      taxId: hasTaxId ? taxId.trim() : null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    };

    onSave(supplierData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor / Taller'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        <Input
          label="Razón Social / Nombre del Taller"
          placeholder="Ej: Confecciones Textiles Gamarra S.A.C."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          icon={Building2}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Persona de Contacto"
            placeholder="Ej: Jorge Mendoza"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            icon={User}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Documento (RUC / DNI)
            </label>
            <div className="flex gap-1.5">
              <select
                value={taxIdType}
                onChange={(e) => setTaxIdType(e.target.value)}
                className="w-24 px-2.5 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
              </select>
              <input
                type="text"
                placeholder="20601234567"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Teléfono Principal"
            placeholder="Ej: 981234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={Phone}
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="contacto@textiles.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
          />
        </div>

        <Input
          label="Dirección Física / Stand"
          placeholder="Ej: Jr. Gamarra 1240, Galería La Virreyna Stand 305, Lima"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          icon={MapPin}
        />

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Notas u Observaciones
          </label>
          <textarea
            placeholder="Condiciones de pago, tiempo de entrega o detalles de confección..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {supplierToEdit ? 'Guardar Cambios' : 'Registrar Proveedor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

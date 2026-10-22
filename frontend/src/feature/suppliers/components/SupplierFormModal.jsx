/**
 * Modal para creación y edición de proveedores y talleres.
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import {
  isValidPeruvianPhone,
  sanitizePhoneInput,
  isValidPersonName,
  isValidRuc,
  isValidDni,
  sanitizeNumericInput,
} from '../../../shared/utils/validators';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(false);
    }
  }, [isOpen, supplierToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (companyName.trim().length < 3) {
      setErrorMsg('La razón social o nombre del taller debe tener al menos 3 caracteres.');
      return;
    }

    if (contactName.trim() && !isValidPersonName(contactName)) {
      setErrorMsg('El nombre de la persona de contacto solo debe contener letras y espacios (mínimo 3 caracteres).');
      return;
    }

    if (!isValidPeruvianPhone(phone)) {
      setErrorMsg('El teléfono principal debe ser un celular peruano válido (empieza sí o sí con 9 y tiene 9 dígitos).');
      return;
    }

    const trimmedTaxId = taxId.trim();
    if (trimmedTaxId.length > 0) {
      if (taxIdType === 'RUC' && !isValidRuc(trimmedTaxId)) {
        setErrorMsg('El RUC debe contener exactamente 11 dígitos numéricos.');
        return;
      }
      if (taxIdType === 'DNI' && !isValidDni(trimmedTaxId)) {
        setErrorMsg('El DNI debe contener exactamente 8 dígitos numéricos.');
        return;
      }
    }

    const hasTaxId = trimmedTaxId.length > 0;

    const supplierData = {
      ...(supplierToEdit ? { id: supplierToEdit.id } : {}),
      companyName: companyName.trim(),
      contactName: contactName.trim() || null,
      phone: phone.trim(),
      email: email.trim() || null,
      taxIdType: hasTaxId ? taxIdType : null,
      taxId: hasTaxId ? trimmedTaxId : null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      setIsSubmitting(true);
      await onSave(supplierData);
    } finally {
      setIsSubmitting(false);
    }
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
                onChange={(e) => {
                  const newType = e.target.value;
                  setTaxIdType(newType);
                  setTaxId((prev) => sanitizeNumericInput(prev, newType === 'RUC' ? 11 : 8));
                }}
                className="w-24 px-2.5 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="RUC">RUC (11)</option>
                <option value="DNI">DNI (8)</option>
              </select>
              <input
                type="text"
                placeholder={taxIdType === 'RUC' ? '20601234567' : '71234567'}
                value={taxId}
                onChange={(e) =>
                  setTaxId(sanitizeNumericInput(e.target.value, taxIdType === 'RUC' ? 11 : 8))
                }
                className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {taxIdType === 'RUC' ? '11 dígitos numéricos' : '8 dígitos numéricos'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Teléfono Principal (Perú)"
              placeholder="981234567"
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              icon={Phone}
              required
            />
            <span className="text-[11px] text-gray-500 mt-1 block">
              9 dígitos numéricos iniciando con 9. ({phone.length}/9)
            </span>
          </div>
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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? 'Guardando...'
              : supplierToEdit
              ? 'Guardar Cambios'
              : 'Registrar Proveedor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

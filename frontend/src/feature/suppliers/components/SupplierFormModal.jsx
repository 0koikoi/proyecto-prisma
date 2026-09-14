/**
 * Modal para creación y edición de proveedores y talleres.
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Building2, User, Phone, Mail, FileText, MapPin, Tag } from 'lucide-react';

export const SupplierFormModal = ({ isOpen, onClose, onSave, supplierToEdit }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [productsSupplied, setProductsSupplied] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setCompanyName(supplierToEdit.companyName || '');
        setContactName(supplierToEdit.contactName || '');
        setPhone(supplierToEdit.phone || '');
        setEmail(supplierToEdit.email || '');
        setTaxId(supplierToEdit.taxId || '');
        setAddress(supplierToEdit.address || '');
        setProductsSupplied(supplierToEdit.productsSupplied || '');
      } else {
        setCompanyName('');
        setContactName('');
        setPhone('');
        setEmail('');
        setTaxId('');
        setAddress('');
        setProductsSupplied('');
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

    const supplierData = {
      ...(supplierToEdit ? { id: supplierToEdit.id } : {}),
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      taxId: taxId.trim(),
      address: address.trim(),
      productsSupplied: productsSupplied.trim(),
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
          <Input
            label="RUC / DNI"
            placeholder="Ej: 20601234567"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            icon={FileText}
          />
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
            placeholder="Ej: contacto@taller.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
          />
        </div>

        <Input
          label="Dirección / Galería / Stand"
          placeholder="Ej: Jr. Gamarra 1240, Piso 3, Stand 305, La Victoria, Lima"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          icon={MapPin}
        />

        <Input
          label="Línea de Suministro / Especialidad"
          placeholder="Ej: Ropa Urbana y Juvenil Femenina / Telas / Accesorios pet"
          value={productsSupplied}
          onChange={(e) => setProductsSupplied(e.target.value)}
          icon={Tag}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {supplierToEdit ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

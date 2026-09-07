/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Apertura de Caja
 *
 * Modal para iniciar el turno del día registrando el sencillo inicial (efectivo base).
 *
 * TODO Leo:
 *  - Enviar el monto inicial a cashService.openRegister(initialAmount).
 *  - Registrar el nombre del cajero/vendedor que abre la caja.
 *  - Cambiar el indicador de "Tienda abierta" en el Navbar tras confirmar.
 */
import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { DollarSign, CheckCircle } from 'lucide-react';

export const CashOpenModal = ({ isOpen, onClose, onConfirm }) => {
  const [initialAmount, setInitialAmount] = useState('100');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(parseFloat(initialAmount) || 0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apertura de Caja Diaria" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-sm flex items-start gap-3">
          <DollarSign size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Ingresa el monto de <strong>sencillo inicial en efectivo</strong> con el que se inicia el turno en la gaveta.
          </p>
        </div>

        <Input
          label="Sencillo Inicial en Gaveta (S/)"
          type="number"
          step="0.50"
          value={initialAmount}
          onChange={(e) => setInitialAmount(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={CheckCircle}>
            Confirmar Apertura
          </Button>
        </div>
      </form>
    </Modal>
  );
};

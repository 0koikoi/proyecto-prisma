/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Apertura de Caja
 *
 * Modal para iniciar el turno del día registrando el sencillo inicial (efectivo base).
 *
 * VALIDACIÓN (react-hook-form + zod):
 *  - El sencillo inicial debe ser un número mayor a 0.
 *  - Se usa `Controller` en vez de `register` porque el <Input/> compartido
 *    no reenvía `ref` (no usa forwardRef) — Controller trabaja en modo
 *    controlado y no lo necesita, sin tener que modificar ese archivo compartido.
 *
 * TODO Leo:
 *  - Registrar el nombre del cajero/vendedor que abre la caja.
 *  - Cambiar el indicador de "Tienda abierta" en el Navbar tras confirmar.
 */
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { DollarSign, CheckCircle } from 'lucide-react';

const schema = z.object({
  initialAmount: z.coerce
    .number()
    .refine((v) => !Number.isNaN(v) && v > 0, { message: 'Ingresa un monto mayor a S/ 0.00' }),
});

export const CashOpenModal = ({ isOpen, onClose, onConfirm }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { initialAmount: '100' },
  });

  const submit = (data) => {
    onConfirm(data.initialAmount);
    reset({ initialAmount: '100' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apertura de Caja Diaria" maxWidth="max-w-md">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-sm flex items-start gap-3">
          <DollarSign size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Ingresa el monto de <strong>sencillo inicial en efectivo</strong> con el que se inicia el turno en la gaveta.
          </p>
        </div>

        <Controller
          name="initialAmount"
          control={control}
          render={({ field }) => (
            <Input
              label="Sencillo Inicial en Gaveta (S/)"
              type="number"
              step="0.50"
              value={field.value}
              onChange={field.onChange}
              error={errors.initialAmount?.message}
              required
            />
          )}
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

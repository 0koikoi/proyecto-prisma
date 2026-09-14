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

  // maxWidth de Modal.jsx es un valor CSS (style inline), no una clase de
  // Tailwind — "max-w-md" se ignoraba y dejaba el modal casi a pantalla completa.
  // Gris neutro en vez de celeste: el botón "Cancelar" ya usa ese celeste por
  // el sistema de botones compartido, así que un banner celeste repetía color.
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apertura de Caja Diaria" maxWidth="28rem">
      {/* noValidate: apagamos la validación nativa del navegador (el globito
          "Completa este campo") — zod + react-hook-form ya muestran sus
          propios mensajes de error, tener las dos a la vez se veía mal. */}
      <form onSubmit={handleSubmit(submit)} noValidate className="max-h-[70vh] overflow-y-auto pr-0.5 space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 text-sm flex items-start gap-3">
          <DollarSign size={20} className="text-gray-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Ingresa el monto de <strong className="text-gray-900">sencillo inicial en efectivo</strong> con el que se inicia el turno en la gaveta.
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

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={CheckCircle} className="w-full">
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

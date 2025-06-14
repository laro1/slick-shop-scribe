
import React from 'react';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Article, SaleFormData } from '@/types/inventory';

interface PaymentFieldsProps {
  control: Control<SaleFormData>;
  register: UseFormRegister<SaleFormData>;
  errors: FieldErrors<SaleFormData>;
  paymentMethod: 'efectivo' | 'transferencia' | 'sinabono';
  selectedArticle?: Article;
  quantity: number;
}

export const PaymentFields: React.FC<PaymentFieldsProps> = ({
  control,
  register,
  errors,
  paymentMethod,
  selectedArticle,
  quantity,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tipo de pago</Label>
        <Controller
          name="paymentMethod"
          control={control}
          rules={{ required: 'Debe seleccionar un tipo de pago' }}
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-wrap gap-x-4 gap-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo" className="text-sm font-normal">Efectivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label htmlFor="transferencia" className="text-sm font-normal">Transferencia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sinabono" id="sinabono" />
                <Label htmlFor="sinabono" className="text-sm font-normal">Sin abono</Label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.paymentMethod && (
          <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {paymentMethod === 'transferencia' && (
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <Label htmlFor="bankName" className="text-sm font-medium">Nombre del Banco</Label>
            <Input
              id="bankName"
              {...register('bankName', { required: paymentMethod === 'transferencia' ? 'El nombre del banco es requerido' : false })}
              placeholder="Ingrese el banco"
              className="text-sm"
            />
            {errors.bankName && (
              <p className="text-xs text-destructive">{errors.bankName.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="amountPaid" className="text-sm font-medium">Monto Pagado</Label>
          <Input
            id="amountPaid"
            type="number"
            step="0.01"
            {...register('amountPaid', {
              valueAsNumber: true,
              required: paymentMethod !== 'sinabono' ? 'El monto es requerido' : false,
              min: { value: 0, message: 'El monto no puede ser negativo' },
              validate: (value) => {
                if (paymentMethod === 'sinabono' && value !== 0) {
                  return 'Con "Sin abono", el monto debe ser 0';
                }
                if (selectedArticle && quantity > 0) {
                  const totalPrice = selectedArticle.price * quantity;
                  if (value > totalPrice) {
                    return 'El monto no puede ser mayor al total';
                  }
                }
                return true;
              }
            })}
            placeholder="0.00"
            className="text-sm"
            disabled={paymentMethod === 'sinabono'}
          />
          {errors.amountPaid && (
            <p className="text-xs text-destructive">{errors.amountPaid.message}</p>
          )}
        </div>
      </div>
    </>
  );
};

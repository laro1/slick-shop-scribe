
import React from 'react';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Article, SaleFormData } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('payment_type')}</Label>
        <Controller
          name="paymentMethod"
          control={control}
          rules={{ required: t('payment_type_required') }}
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-wrap gap-x-4 gap-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo" className="text-sm font-normal">{t('cash')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label htmlFor="transferencia" className="text-sm font-normal">{t('transfer')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sinabono" id="sinabono" />
                <Label htmlFor="sinabono" className="text-sm font-normal">{t('no_payment')}</Label>
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
            <Label htmlFor="bankName" className="text-sm font-medium">{t('bank_name')}</Label>
            <Input
              id="bankName"
              {...register('bankName', { required: paymentMethod === 'transferencia' ? t('bank_name_required') : false })}
              placeholder={t('bank_name_placeholder')}
              className="text-sm"
            />
            {errors.bankName && (
              <p className="text-xs text-destructive">{errors.bankName.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="amountPaid" className="text-sm font-medium">{t('amount_paid')}</Label>
          <Input
            id="amountPaid"
            type="number"
            step="1"
            {...register('amountPaid', {
              valueAsNumber: true,
              required: paymentMethod !== 'sinabono' ? t('amount_paid_required') : false,
              min: { value: 0, message: t('amount_paid_not_negative') },
              validate: (value) => {
                if (paymentMethod === 'sinabono' && value !== 0) {
                  return t('amount_paid_must_be_zero');
                }
                if (selectedArticle && quantity > 0) {
                  const totalPrice = selectedArticle.price * quantity;
                  if (value > totalPrice) {
                    return t('amount_paid_too_high', { totalPrice: formatCurrency(totalPrice) });
                  }
                }
                return true;
              }
            })}
            placeholder="0"
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


import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Article, SaleFormData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { SaleFormAlerts } from './sale-form/SaleFormAlerts';
import { ArticleSelector } from './sale-form/ArticleSelector';
import { SelectedArticlePreview } from './sale-form/SelectedArticlePreview';
import { PaymentFields } from './sale-form/PaymentFields';

interface SaleFormProps {
  articles: Article[];
  onSubmit: (data: SaleFormData) => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({ articles, onSubmit }) => {
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<SaleFormData>({
    defaultValues: {
      articleId: '',
      paymentMethod: 'efectivo',
      amountPaid: 0,
      bankName: ''
    }
  });
  const { toast } = useToast();
  const selectedArticleId = watch('articleId');
  const paymentMethod = watch('paymentMethod');
  const quantity = watch('quantity');
  
  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  React.useEffect(() => {
    if (paymentMethod === 'sinabono') {
      setValue('amountPaid', 0);
    } else if (selectedArticle && quantity > 0) {
      const totalPrice = selectedArticle.price * quantity;
      setValue('amountPaid', totalPrice);
    }
  }, [selectedArticle, quantity, paymentMethod, setValue]);

  const handleFormSubmit = (data: SaleFormData) => {
    try {
      if (data.paymentMethod === 'sinabono') {
        data.amountPaid = 0;
      }
      if (data.paymentMethod !== 'transferencia') {
        data.bankName = '';
      }
      onSubmit(data);
      reset();
      toast({
        title: "Venta registrada",
        description: "La venta se ha registrado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al registrar la venta.",
        variant: "destructive",
      });
    }
  };

  const availableArticles = articles.filter(article => article.stock > 0);
  const lowStockArticles = articles.filter(article => article.stock > 0 && article.stock <= 5);

  if (articles.length === 0 || availableArticles.length === 0) {
    return <SaleFormAlerts articles={articles} availableArticles={availableArticles} lowStockArticles={[]} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <SaleFormAlerts articles={articles} availableArticles={availableArticles} lowStockArticles={lowStockArticles} />

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <ArticleSelector control={control} errors={errors} availableArticles={availableArticles} />

          <SelectedArticlePreview selectedArticle={selectedArticle} />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { 
                  required: 'La cantidad es requerida',
                  min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
                  max: selectedArticle ? { value: selectedArticle.stock, message: 'Cantidad excede el stock disponible' } : undefined
                })}
                placeholder="1"
                className="text-sm"
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="buyerName" className="text-sm font-medium">Nombre del Comprador</Label>
              <Input
                id="buyerName"
                {...register('buyerName', { required: 'El nombre del comprador es requerido' })}
                placeholder="Ingrese el nombre del comprador"
                className="text-sm"
              />
              {errors.buyerName && (
                <p className="text-xs text-destructive">{errors.buyerName.message}</p>
              )}
            </div>
          </div>

          <PaymentFields 
            control={control}
            register={register}
            errors={errors}
            paymentMethod={paymentMethod}
            selectedArticle={selectedArticle}
            quantity={quantity}
          />
          
          <Button type="submit" className="w-full text-sm py-2">
            Registrar Venta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

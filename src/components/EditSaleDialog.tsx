import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Article, Sale, EditSaleData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EditSaleDialogProps {
  sale: Sale | null;
  articles: Article[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EditSaleData) => void;
}

export const EditSaleDialog: React.FC<EditSaleDialogProps> = ({
  sale,
  articles,
  open,
  onOpenChange,
  onSubmit,
}) => {
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<EditSaleData>();
  const { toast } = useToast();
  const selectedArticleId = watch('articleId');
  const selectedArticle = articles.find(a => a.id === selectedArticleId);
  const paymentMethod = watch('paymentMethod');
  const quantity = watch('quantity');

  React.useEffect(() => {
    if (sale) {
      reset({
        id: sale.id,
        articleId: sale.articleId,
        quantity: sale.quantity,
        buyerName: sale.buyerName,
        paymentMethod: sale.paymentMethod,
        amountPaid: sale.amountPaid,
        bankName: sale.bankName || '',
      });
      setValue('articleId', sale.articleId);
    }
  }, [sale, reset, setValue]);

  const handleFormSubmit = (data: EditSaleData) => {
    try {
      if (data.paymentMethod === 'sinabono') {
        data.amountPaid = 0;
      }
      if (data.paymentMethod !== 'transferencia') {
        data.bankName = '';
      }
      onSubmit(data);
      onOpenChange(false);
      toast({
        title: "Venta actualizada",
        description: "La venta se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al actualizar la venta.",
        variant: "destructive",
      });
    }
  };

  if (!sale) return null;

  const maxQuantity = selectedArticle ? (selectedArticle.id === sale.articleId ? selectedArticle.stock + sale.quantity : selectedArticle.stock) : sale.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Venta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleId" className="text-sm font-medium">Artículo</Label>
            <Select onValueChange={(value) => setValue('articleId', value)} defaultValue={sale.articleId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccione un artículo" />
              </SelectTrigger>
              <SelectContent>
                {articles.map((article) => (
                  <SelectItem key={article.id} value={article.id} className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{article.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Stock: {article.stock} - ${article.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedArticle && (
            <div className="p-3 bg-muted rounded-md flex items-center gap-3">
              <img src={selectedArticle.imageUrl} alt={selectedArticle.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedArticle.name}</p>
                <div className="flex justify-between text-xs">
                  <span>Precio: ${selectedArticle.price}</span>
                  <span>Stock disponible: {selectedArticle.id === sale.articleId ? maxQuantity : selectedArticle.stock}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { 
                  required: 'La cantidad es requerida',
                  min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
                  max: { value: maxQuantity, message: 'Cantidad excede el stock disponible' }
                })}
                className="text-sm"
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerName" className="text-sm font-medium">Comprador</Label>
              <Input
                id="buyerName"
                {...register('buyerName', { required: 'El nombre del comprador es requerido' })}
                className="text-sm"
              />
              {errors.buyerName && (
                <p className="text-xs text-destructive">{errors.buyerName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de pago</Label>
            <Controller
              name="paymentMethod"
              control={control}
              rules={{ required: 'Debe seleccionar un tipo de pago' }}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'sinabono') {
                      setValue('amountPaid', 0);
                    }
                  }}
                  value={field.value}
                  className="flex flex-wrap gap-x-4 gap-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="efectivo" id="edit-efectivo" />
                    <Label htmlFor="edit-efectivo" className="text-sm font-normal">Efectivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transferencia" id="edit-transferencia" />
                    <Label htmlFor="edit-transferencia" className="text-sm font-normal">Transferencia</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sinabono" id="edit-sinabono" />
                    <Label htmlFor="edit-sinabono" className="text-sm font-normal">Sin abono</Label>
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
                <Label htmlFor="edit-bankName" className="text-sm font-medium">Nombre del Banco</Label>
                <Input
                  id="edit-bankName"
                  {...register('bankName', { required: paymentMethod === 'transferencia' ? 'El nombre del banco es requerido' : false })}
                  className="text-sm"
                />
                {errors.bankName && (
                  <p className="text-xs text-destructive">{errors.bankName.message}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="edit-amountPaid" className="text-sm font-medium">Monto Pagado</Label>
              <Input
                id="edit-amountPaid"
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
                className="text-sm"
                disabled={paymentMethod === 'sinabono'}
              />
              {errors.amountPaid && (
                <p className="text-xs text-destructive">{errors.amountPaid.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Actualizar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

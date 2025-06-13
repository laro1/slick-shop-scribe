
import React from 'react';
import { useForm } from 'react-hook-form';
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
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EditSaleData>();
  const { toast } = useToast();
  const selectedArticleId = watch('articleId');
  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  React.useEffect(() => {
    if (sale) {
      reset({
        id: sale.id,
        articleId: sale.articleId,
        quantity: sale.quantity,
        buyerName: sale.buyerName,
      });
      setValue('articleId', sale.articleId);
    }
  }, [sale, reset, setValue]);

  const handleFormSubmit = (data: EditSaleData) => {
    try {
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

  const currentArticle = articles.find(a => a.id === sale.articleId);
  const maxQuantity = selectedArticle ? selectedArticle.stock + sale.quantity : sale.quantity;

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
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{selectedArticle.name}</p>
              <p className="text-xs text-muted-foreground mb-1">{selectedArticle.description}</p>
              <div className="flex justify-between text-xs">
                <span>Precio: ${selectedArticle.price}</span>
                <span>Stock disponible: {selectedArticle.id === sale.articleId ? maxQuantity : selectedArticle.stock}</span>
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

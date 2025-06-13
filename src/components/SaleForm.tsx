
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Article, SaleFormData } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface SaleFormProps {
  articles: Article[];
  onSubmit: (data: SaleFormData) => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({ articles, onSubmit }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SaleFormData>();
  const { toast } = useToast();
  const selectedArticleId = watch('articleId');
  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  const handleFormSubmit = (data: SaleFormData) => {
    try {
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

  if (availableArticles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-muted-foreground text-center py-4 text-sm">
            No hay artículos disponibles para venta.
            Registre artículos primero.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Registrar Venta</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleId" className="text-sm font-medium">Artículo</Label>
            <Select onValueChange={(value) => setValue('articleId', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccione un artículo" />
              </SelectTrigger>
              <SelectContent>
                {availableArticles.map((article) => (
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
            {errors.articleId && (
              <p className="text-xs text-destructive">Debe seleccionar un artículo</p>
            )}
          </div>

          {selectedArticle && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{selectedArticle.name}</p>
              <p className="text-xs text-muted-foreground mb-1">{selectedArticle.description}</p>
              <div className="flex justify-between text-xs">
                <span>Precio: ${selectedArticle.price}</span>
                <span>Stock: {selectedArticle.stock}</span>
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

          <Button type="submit" className="w-full text-sm py-2">
            Registrar Venta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
